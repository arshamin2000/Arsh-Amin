# Aether AI 🌌

A frontier conversational AI assistant modeled after ChatGPT with real-time token streaming, multi-turn memory, persona intelligence modes, multimodal image analysis, speech synthesis, and persistent chat sessions.

---

## ✨ Features

- **⚡ Real-Time Streaming**: Live word-by-word streaming responses via Server-Sent Events (SSE).
- **🧠 Intelligence Personas**:
  - **Aether 3.8 Flash**: Fast, all-around conversational intelligence.
  - **Aether Reasoner**: Deep step-by-step logic, edge cases, and architectural reasoning.
  - **Aether Coder**: Clean syntax, idiomatic patterns, and security best practices.
  - **Aether Creative**: Inventive prose, metaphor, and conceptual brainstorming.
  - **Aether Concise**: Direct, high-density brevity.
- **🎨 Custom Emblem & Design**:
  - The **Aether Neural Bloom Knot** 6-fold impossible torus emblem with 3D drop-shadows.
  - 4 customizable emblem styles (Bloom Knot, Quantum Prism, Infinity Ribbon, Neural Iris).
  - Dark mode and Light mode support.
- **💻 Rich Markdown & Code Highlighting**:
  - Syntax highlighted code blocks with language badges (TypeScript, Python, Bash, HTML, etc.).
  - One-click **Copy code** button with checkmark animation.
  - Formatted data tables and blockquotes.
- **🔐 ChatGPT-Style Authentication**:
  - Mode toggle for **Log in** and **Sign up**.
  - Interactive password strength meter and forgot password flow.
  - One-click instant login & Guest preview mode.
- **📁 Chat Management**:
  - Sidebar with instant search, pinned conversations, and date grouping (Today, Previous 7 Days, Older).
  - Automatic conversation title generation from the first prompt.
  - Inline conversation renaming and deletion.
  - Export chat history as Markdown.
- **🎙️ Voice & Audio**:
  - Voice-to-text dictation (Web Speech API).
  - Text-to-speech response reader with speed controls.
  - Subtle audio chimes on completion.
- **🖼️ Multimodal Vision**:
  - Attach images, screenshots, and diagrams for instant analysis.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone or extract this repository:
```bash
unzip aether-ai-source.zip
cd aether-ai
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, React Markdown
- **Backend**: Node.js, Express, TypeScript (`tsx`)
- **AI SDK**: `@google/genai`
- **Build Tool**: Vite

---

## 📜 License

MIT License. Built with love using Google AI Studio.
