import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Serve public directory
  app.use(express.static(path.resolve(__dirname, 'public')));

  // API: Download complete project source code as zip
  app.get('/api/download-zip', (_req: Request, res: Response) => {
    const zipPath = path.resolve(__dirname, 'public', 'aether-ai-source.zip');
    res.download(zipPath, 'aether-ai-source.zip', (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ error: 'Zip archive not found' });
      }
    });
  });

  // API: Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Aether AI Engine',
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Helper: Resilient generateContent with fallback
  async function generateWithFallback(options: {
    preferredModel?: string;
    contents: any;
    config?: any;
  }) {
    const candidateModels = [
      options.preferredModel || 'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ];
    const uniqueModels = Array.from(new Set(candidateModels));

    let lastError: any = null;
    for (const model of uniqueModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        return response;
      } catch (err: any) {
        console.warn(`Model ${model} failed, trying fallback:`, err?.message || err);
        lastError = err;
      }
    }
    throw lastError;
  }

  // Helper: Resilient generateContentStream with fallback
  async function streamWithFallback(options: {
    preferredModel?: string;
    contents: any;
    config?: any;
  }) {
    const candidateModels = [
      options.preferredModel || 'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
    ];
    const uniqueModels = Array.from(new Set(candidateModels));

    let lastError: any = null;
    for (const model of uniqueModels) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents: options.contents,
          config: options.config,
        });
        return stream;
      } catch (err: any) {
        console.warn(`Stream model ${model} failed, trying fallback:`, err?.message || err);
        lastError = err;
      }
    }
    throw lastError;
  }

  // API: Generate snappy title for conversation
  app.post('/api/chat/title', async (req: Request, res: Response) => {
    try {
      const { firstMessage } = req.body;
      if (!firstMessage || typeof firstMessage !== 'string') {
        return res.json({ title: 'New Conversation' });
      }

      const prompt = `Provide a concise, catchy, 3 to 5 word title summarizing the user prompt below. Do not use quotes, punctuation at the end, or markdown. Output only the plain title text.\n\nPrompt: "${firstMessage.slice(0, 300)}"`;

      const response = await generateWithFallback({
        preferredModel: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You generate short, clean, crisp 3-5 word conversation titles.',
        },
      });

      const title = (response.text || 'New Conversation').trim().replace(/^["']|["']$/g, '');
      res.json({ title });
    } catch (err: any) {
      console.warn('Title generation error, falling back:', err.message);
      res.json({ title: 'New Conversation' });
    }
  });

  // API: Streaming Chat with multi-model resiliency
  app.post('/api/chat/stream', async (req: Request, res: Response) => {
    const { messages, persona = 'standard', customInstructions, model } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is available in Settings > Secrets.',
      });
    }

    // Prepare Persona System Instruction
    let personaGuidance = '';
    if (persona === 'reasoner') {
      personaGuidance = 'You are in Deep Reasoning mode. Break down problems step-by-step, explain underlying mechanisms, consider edge cases, and present structured arguments.';
    } else if (persona === 'coder') {
      personaGuidance = 'You are in Expert Developer mode. Provide clean, secure, idiomatic, and modern code. Always specify the programming language on code blocks (e.g., ```typescript, ```python, ```html). Provide brief architectural context and best practices.';
    } else if (persona === 'creative') {
      personaGuidance = 'You are in Creative Ideation mode. Write with flair, imaginative vocabulary, engaging metaphors, and inventive concepts while maintaining coherence.';
    } else if (persona === 'concise') {
      personaGuidance = 'You are in Concise mode. Provide high-density, direct answers with minimal preamble. Bullet points and direct conclusions are prioritized.';
    }

    const baseSystemInstruction = [
      'You are Aether AI, an intelligent, versatile, helpful, and articulate AI assistant modeled with the conversational polish and intellectual depth of leading frontier AI assistants like ChatGPT.',
      'Format your responses elegantly using GitHub-flavored Markdown: use clear headers, bold accents, lists, tables where structured comparison is helpful, and fenced code blocks with language identifiers.',
      'Maintain an encouraging, polite, objective, and intellectually capable tone. If a question is ambiguous, answer the most likely intent while offering helpful follow-up pathways.',
      'Never refer to yourself as ChatGPT, OpenAI, or GPT. Your identity is Aether AI (created with high-performance neural intelligence).',
      personaGuidance,
      customInstructions ? `User Custom Instructions:\n${customInstructions}` : '',
    ].filter(Boolean).join('\n\n');

    // Build contents for @google/genai
    const contents = messages.map((msg: any) => {
      const parts: any[] = [];

      // Multimodal attachments if any
      if (Array.isArray(msg.images) && msg.images.length > 0) {
        for (const img of msg.images) {
          if (img && img.data && img.mimeType) {
            const cleanBase64 = img.data.replace(/^data:[^;]+;base64,/, '');
            parts.push({
              inlineData: {
                mimeType: img.mimeType,
                data: cleanBase64,
              },
            });
          }
        }
      }

      // Text part
      if (typeof msg.text === 'string' && msg.text.trim().length > 0) {
        parts.push({ text: msg.text });
      } else if (parts.length === 0) {
        parts.push({ text: '...' });
      }

      return {
        role: msg.role === 'model' ? 'model' : 'user',
        parts,
      };
    });

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const candidateModels = Array.from(
      new Set([model || 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'])
    );

    let streamSucceeded = false;
    let chunksEmitted = 0;
    let lastError: any = null;

    for (const modelToUse of candidateModels) {
      try {
        const stream = await ai.models.generateContentStream({
          model: modelToUse,
          contents,
          config: {
            systemInstruction: baseSystemInstruction,
          },
        });

        for await (const chunk of stream) {
          const text = chunk.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
            chunksEmitted++;
          }
        }

        streamSucceeded = true;
        break; // Successfully finished streaming
      } catch (err: any) {
        console.warn(`Model ${modelToUse} stream error:`, err?.message || err);
        lastError = err;
        // If we already emitted some chunks to the user, we cannot restart from scratch without duplicate content
        if (chunksEmitted > 0) {
          break;
        }
      }
    }

    if (streamSucceeded) {
      res.write(`data: [DONE]\n\n`);
      res.end();
    } else {
      console.error('All model streaming candidates failed:', lastError);
      const errMsg = lastError?.message || 'An error occurred during response generation.';
      res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
      res.end();
    }
  });

  // Setup Vite in Dev or Static files in Production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aether AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
