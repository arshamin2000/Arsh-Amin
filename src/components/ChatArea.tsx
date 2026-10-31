import React, { useRef, useEffect, useState } from 'react';
import {
  Menu,
  ChevronDown,
  Sparkles,
  RotateCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Code2,
  Lightbulb,
  Compass,
  PenTool,
  Edit3,
  ArrowDown,
  Cpu,
  Brain,
  Zap,
} from 'lucide-react';
import { ChatMessage, ChatSession, PersonaType } from '../types';
import { Logo, LogoVariant } from './Logo';
import { MarkdownRenderer } from './MarkdownRenderer';
import { speechManager } from '../utils/audio';

interface ChatAreaProps {
  session: ChatSession | null;
  isStreaming: boolean;
  onOpenSidebar: () => void;
  onSelectPersona: (persona: PersonaType) => void;
  onSendMessage: (text: string) => void;
  onRegenerateResponse: (messageIndex: number) => void;
  onEditMessage: (messageIndex: number, newText: string) => void;
  onNewChat: () => void;
  onToggleFeedback: (messageId: string, type: 'like' | 'dislike') => void;
  userProfileName?: string;
  logoVariant?: LogoVariant;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  session,
  isStreaming,
  onOpenSidebar,
  onSelectPersona,
  onSendMessage,
  onRegenerateResponse,
  onEditMessage,
  onNewChat,
  onToggleFeedback,
  userProfileName = 'You',
  logoVariant = 'knot',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [editingMsgIndex, setEditingMsgIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);

  const messages = session?.messages || [];
  const activePersona = session?.persona || 'standard';

  // Auto-scroll to bottom on streaming or new messages
  useEffect(() => {
    if (!showScrollBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming, showScrollBottom]);

  // Monitor scroll position to display "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  const handleCopyMessage = async (msg: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleSpeak = (msg: ChatMessage) => {
    if (speakingId === msg.id) {
      speechManager.stop();
      setSpeakingId(null);
      return;
    }

    speechManager.speak(
      msg.text,
      1.0,
      undefined,
      () => setSpeakingId(msg.id),
      () => setSpeakingId(null)
    );
  };

  const handleExportChat = async () => {
    if (!session || session.messages.length === 0) return;

    let markdown = `# ${session.title}\n*Exported from Aether AI on ${new Date().toLocaleString()}*\n\n---\n\n`;
    session.messages.forEach((m) => {
      markdown += `### ${m.role === 'user' ? 'User' : 'Aether AI'}\n\n${m.text}\n\n---\n\n`;
    });

    try {
      await navigator.clipboard.writeText(markdown);
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleStartEdit = (idx: number, currentText: string) => {
    setEditingMsgIndex(idx);
    setEditText(currentText);
  };

  const handleSaveEdit = (idx: number) => {
    if (editText.trim()) {
      onEditMessage(idx, editText.trim());
    }
    setEditingMsgIndex(null);
  };

  // Persona configurations
  const personaDetails = {
    standard: {
      name: 'Aether 3.8 Flash',
      tagline: 'Balanced, fast & intelligent',
      icon: Zap,
      color: 'text-violet-500',
    },
    reasoner: {
      name: 'Aether Reasoner',
      tagline: 'Deep step-by-step logic & rigor',
      icon: Brain,
      color: 'text-cyan-400',
    },
    coder: {
      name: 'Aether Coder',
      tagline: 'Clean architecture & syntax',
      icon: Code2,
      color: 'text-blue-400',
    },
    creative: {
      name: 'Aether Creative',
      tagline: 'Inventive prose & brainstorming',
      icon: Sparkles,
      color: 'text-pink-400',
    },
    concise: {
      name: 'Aether Concise',
      tagline: 'Direct, high-signal brevity',
      icon: Cpu,
      color: 'text-amber-400',
    },
  };

  const CurrentPersonaIcon = personaDetails[activePersona].icon;

  // Starter prompts
  const starterCards = [
    {
      title: 'Analyze & Debug Code',
      desc: 'Explain React 19 memoization vs compiler and write a live benchmark example',
      prompt: 'Explain how React 19 handles memoization compared to manual useMemo, and write an example benchmark component.',
      icon: Code2,
      color: 'text-cyan-500 bg-cyan-500/10',
    },
    {
      title: 'Brainstorm Startup Ideas',
      desc: 'High-margin B2B ideas leveraging multimodal AI and real-time audio',
      prompt: 'Brainstorm 5 high-margin B2B SaaS startup ideas that leverage real-time multimodal intelligence. Include target customers, USP, and pricing models.',
      icon: Lightbulb,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'Professional Communication',
      desc: 'Draft a diplomatic email renegotiating a project deadline gracefully',
      prompt: 'Draft an email to a client renegotiating a project delivery deadline by 5 days due to scope additions, while keeping confidence high.',
      icon: PenTool,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Understand Complex Concepts',
      desc: 'Explain quantum entanglement with an everyday analogy and math intuition',
      prompt: 'Explain quantum entanglement like I am an curious college student. Use an intuitive real-world analogy and explain the physics significance.',
      icon: Compass,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
  ];

  return (
    <div className="relative flex-1 flex flex-col h-full bg-white dark:bg-[#141415] text-zinc-900 dark:text-zinc-100 overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/80 bg-white/80 dark:bg-[#141415]/80 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle */}
          <button
            type="button"
            onClick={onOpenSidebar}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Open history sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Model / Persona Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-sm transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            >
              <CurrentPersonaIcon className={`w-4 h-4 ${personaDetails[activePersona].color}`} />
              <span>{personaDetails[activePersona].name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Dropdown Menu */}
            {showPersonaMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowPersonaMenu(false)}
                />
                <div className="absolute left-0 mt-1.5 w-64 p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Intelligence Modes
                  </div>
                  {(Object.keys(personaDetails) as PersonaType[]).map((key) => {
                    const item = personaDetails[key];
                    const Icon = item.icon;
                    const isSelected = activePersona === key;

                    return (
                      <button
                        key={key}
                        onClick={() => {
                          onSelectPersona(key);
                          setShowPersonaMenu(false);
                        }}
                        className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.color}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold flex items-center gap-1.5">
                            {item.name}
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {item.tagline}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1">
          {session && session.messages.length > 0 && (
            <button
              type="button"
              onClick={handleExportChat}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Copy conversation markdown"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNewChat}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Start new conversation"
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      </header>

      {/* Export Toast Notification */}
      {showExportToast && (
        <div className="absolute top-16 right-4 z-50 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>Full chat copied to clipboard!</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800"
      >
        {messages.length === 0 ? (
          /* Empty State: ChatGPT style centered hero + starter prompts */
          <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center text-center px-4 py-8 select-none">
            <Logo size="xl" showText={false} isAnimated={isStreaming} variant={logoVariant} className="mb-4" />
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-display">
              What can I help you with today?
            </h1>
            
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
              Aether AI is powered by high-performance neural reasoning. Ask questions, analyze code, brainstorm, or explore concepts.
            </p>

            {/* Prompt Cards Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {starterCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => onSendMessage(card.prompt)}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 text-left group shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`p-1.5 rounded-lg ${card.color}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-500 transition-colors">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Conversation Thread */
          <div className="max-w-3xl mx-auto space-y-6 pb-6">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isLast = index === messages.length - 1;
              const isCurrentlyStreaming = isLast && isStreaming && !isUser;
              const isEditing = editingMsgIndex === index;

              return (
                <div
                  key={msg.id || index}
                  className={`group relative flex gap-3.5 sm:gap-4 transition-all duration-150 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-xs">
                        <Logo size="sm" showText={false} isAnimated={isCurrentlyStreaming} variant={logoVariant} />
                      </div>
                    </div>
                  )}

                  {/* Message Bubble & Content */}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl ${
                      isUser
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-3 border border-zinc-200/80 dark:border-zinc-700/60'
                        : 'text-zinc-900 dark:text-zinc-100 px-1 py-1 w-full'
                    }`}
                  >
                    {/* User Edit Mode */}
                    {isUser && isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 text-sm bg-white dark:bg-zinc-900 rounded-lg border border-emerald-500 focus:outline-none text-zinc-900 dark:text-zinc-100 min-h-[80px]"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setEditingMsgIndex(null)}
                            className="px-2.5 py-1 rounded-md text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(index)}
                            className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                          >
                            Save & Submit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Attached Images */}
                        {isUser && msg.images && msg.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {msg.images.map((img, i) => (
                              <img
                                key={i}
                                src={img.data}
                                alt={img.name}
                                className="w-32 h-32 object-cover rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-xs cursor-pointer hover:opacity-95"
                                onClick={() => {
                                  // Open enlarged image in new tab safely
                                  const win = window.open();
                                  win?.document.write(`<img src="${img.data}" style="max-width:100%;height:auto;margin:auto;" />`);
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Content text */}
                        {isUser ? (
                          <div className="text-[15px] whitespace-pre-wrap leading-relaxed select-text">
                            {msg.text}
                          </div>
                        ) : (
                          <div className="space-y-2 select-text">
                            {/* Persona Badge if specialized */}
                            {msg.persona && msg.persona !== 'standard' && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                <CurrentPersonaIcon className="w-3 h-3 text-emerald-500" />
                                <span>{personaDetails[msg.persona]?.name || msg.persona}</span>
                              </div>
                            )}

                            {/* Markdown Render */}
                            <MarkdownRenderer
                              content={msg.text}
                              isStreaming={isCurrentlyStreaming}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Action Bar below messages */}
                    <div
                      className={`flex items-center gap-1.5 mt-2 text-zinc-400 dark:text-zinc-500 text-xs ${
                        isUser ? 'justify-end opacity-0 group-hover:opacity-100 transition-opacity' : ''
                      }`}
                    >
                      {/* Copy */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg)}
                        className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* User: Edit prompt */}
                      {isUser && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(index, msg.text)}
                          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          title="Edit message"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Assistant: Read aloud */}
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            speakingId === msg.id
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'
                          }`}
                          title={speakingId === msg.id ? 'Stop reading' : 'Read aloud'}
                        >
                          {speakingId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      {/* Assistant: Regenerate */}
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => onRegenerateResponse(index)}
                          disabled={isStreaming}
                          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer disabled:opacity-40"
                          title="Regenerate response"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${isCurrentlyStreaming ? 'animate-spin' : ''}`} />
                        </button>
                      )}

                      {/* Assistant: Feedback Like / Dislike */}
                      {!isUser && (
                        <>
                          <button
                            type="button"
                            onClick={() => onToggleFeedback(msg.id, 'like')}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              msg.feedback === 'like'
                                ? 'text-emerald-500 bg-emerald-500/10'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                            title="Helpful response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleFeedback(msg.id, 'dislike')}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              msg.feedback === 'dislike'
                                ? 'text-red-500 bg-red-500/10'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                            title="Unhelpful response"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {userProfileName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 z-30 p-2.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
