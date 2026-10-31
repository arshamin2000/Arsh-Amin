import React, { useState, useEffect, useRef } from 'react';
import {
  ChatSession,
  ChatMessage,
  ImageAttachment,
  PersonaType,
  UserSettings,
  UserAccount,
} from './types';
import {
  loadStoredSessions,
  saveStoredSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  loadStoredSettings,
  saveStoredSettings,
  createNewSession,
  DEFAULT_SETTINGS,
  loadCurrentUser,
  saveCurrentUser,
  logoutUser,
  DEFAULT_USER,
} from './utils/storage';
import { playCompletionSound } from './utils/audio';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AuthPage } from './components/AuthPage';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize on mount: load user, sessions and settings
  useEffect(() => {
    const loadedSettings = loadStoredSettings();
    setSettings(loadedSettings);

    const storedUser = loadCurrentUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }

    const loadedSessions = loadStoredSessions();
    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
      const savedActiveId = loadActiveSessionId();
      if (savedActiveId && loadedSessions.some((s) => s.id === savedActiveId)) {
        setActiveSessionId(savedActiveId);
      } else {
        setActiveSessionId(loadedSessions[0].id);
      }
    } else {
      const initial = createNewSession(loadedSettings.defaultPersona);
      setSessions([initial]);
      setActiveSessionId(initial.id);
      saveStoredSessions([initial]);
      saveActiveSessionId(initial.id);
    }

    // Auto-collapse sidebar on small mobile screens
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Sync dark/light theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Persist sessions
  useEffect(() => {
    if (sessions.length > 0) {
      saveStoredSessions(sessions);
    }
  }, [sessions]);

  // Persist active session
  useEffect(() => {
    saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea (except for Escape)
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea';

      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
        return;
      }

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessions, settings]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // New Chat
  const handleNewChat = () => {
    if (isStreaming) {
      handleStopStreaming();
    }
    const freshSession = createNewSession(settings.defaultPersona);
    setSessions((prev) => [freshSession, ...prev]);
    setActiveSessionId(freshSession.id);
  };

  // Change Persona / Model
  const handleSelectPersona = (persona: PersonaType) => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, persona } : s))
    );
  };

  // Rename Session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  // Toggle Pin Session
  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      const fresh = createNewSession(settings.defaultPersona);
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  // Clear All Chats
  const handleClearAllChats = () => {
    if (isStreaming) {
      handleStopStreaming();
    }
    const fresh = createNewSession(settings.defaultPersona);
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  };

  // Toggle Message Feedback
  const handleToggleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        return {
          ...s,
          messages: s.messages.map((m) =>
            m.id === messageId
              ? { ...m, feedback: m.feedback === type ? null : type }
              : m
          ),
        };
      })
    );
  };

  // Stop Streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Generate Title from First Message
  const triggerTitleGeneration = async (sessionId: string, firstText: string) => {
    try {
      const res = await fetch('/api/chat/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstMessage: firstText }),
      });
      const data = await res.json();
      if (data?.title) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, title: data.title } : s))
        );
      }
    } catch (e) {
      console.warn('Failed to auto-generate title:', e);
    }
  };

  // Send Message
  const handleSendMessage = async (
    text: string,
    images?: ImageAttachment[],
    customSessionId?: string,
    historyOverride?: ChatMessage[]
  ) => {
    const targetSessionId = customSessionId || activeSessionId;
    let targetSession = sessions.find((s) => s.id === targetSessionId);

    if (!targetSession) {
      targetSession = createNewSession(settings.defaultPersona);
      setSessions((prev) => [targetSession!, ...prev]);
      setActiveSessionId(targetSession.id);
    }

    const isFirstMessage = (historyOverride || targetSession.messages).length === 0;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
      images,
    };

    const currentHistory = historyOverride || targetSession.messages;
    const updatedMessagesWithUser = [...currentHistory, userMsg];

    // Placeholder model message for streaming
    const assistantMsgId = `msg_m_${Date.now() + 1}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      persona: targetSession.persona,
      isStreaming: true,
    };

    const finalMessages = [...updatedMessagesWithUser, assistantMsg];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSession!.id
          ? {
              ...s,
              updatedAt: Date.now(),
              title: isFirstMessage ? text.slice(0, 32) : s.title,
              messages: finalMessages,
            }
      : s
      )
    );

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Trigger title generation in the background if first message
    if (isFirstMessage && text) {
      triggerTitleGeneration(targetSession.id, text);
    }

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessagesWithUser.map((m) => ({
            role: m.role,
            text: m.text,
            images: m.images?.map((img) => ({
              mimeType: img.mimeType,
              data: img.data,
            })),
          })),
          persona: targetSession.persona,
          customInstructions: settings.customInstructions,
          model: targetSession.persona === 'reasoner' ? 'gemini-3.8-flash' : 'gemini-3.5-flash',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No readable stream from server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();

            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                // Update message in state
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id !== targetSession!.id) return s;
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMsgId
                          ? { ...m, text: accumulatedText, isStreaming: true }
                          : m
                      ),
                    };
                  })
                );
              } else if (parsed.error) {
                accumulatedText += `\n\n*(Error: ${parsed.error})*`;
              }
            } catch {
              // Ignore partial parse
            }
          }
        }
      }

      // Mark streaming complete
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSession!.id) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            ),
          };
        })
      );

      if (settings.soundEffects) {
        playCompletionSound();
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user.');
      } else {
        console.error('Chat stream error:', err);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== targetSession!.id) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      text:
                        m.text ||
                        'Sorry, I encountered an issue processing your request. Please try again.',
                      isStreaming: false,
                    }
                  : m
              ),
            };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate Response
  const handleRegenerateResponse = (assistantIndex: number) => {
    if (!activeSession || isStreaming) return;
    // History up to the message before the assistant response
    const historyBefore = activeSession.messages.slice(0, assistantIndex);
    const lastUserMsg = historyBefore[historyBefore.length - 1];
    if (!lastUserMsg || lastUserMsg.role !== 'user') return;

    // Remove user message from historyBefore to re-send it through handleSendMessage
    const baseHistory = historyBefore.slice(0, -1);
    handleSendMessage(
      lastUserMsg.text,
      lastUserMsg.images,
      activeSession.id,
      baseHistory
    );
  };

  // Edit Message
  const handleEditMessage = (messageIndex: number, newText: string) => {
    if (!activeSession || isStreaming) return;
    const historyBefore = activeSession.messages.slice(0, messageIndex);
    handleSendMessage(newText, undefined, activeSession.id, historyBefore);
  };

  // Auth Handlers
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsGuest(false);
    saveCurrentUser(user);
    setSettings((prev) => ({
      ...prev,
      userProfileName: user.name,
    }));
  };

  const handleExploreAsGuest = () => {
    setIsGuest(true);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsGuest(false);
  };

  // If not logged in and not exploring as guest, show ChatGPT style Auth Page
  if (!currentUser && !isGuest) {
    return (
      <AuthPage
        onSuccess={handleAuthSuccess}
        onExploreAsGuest={handleExploreAsGuest}
        logoVariant={settings.logoStyle || 'knot'}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#141415] font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setIsGuest(false);
          setCurrentUser(null);
        }}
        isGuest={!currentUser && isGuest}
        userEmail={currentUser ? currentUser.email : 'guest@aether.ai'}
        userName={currentUser ? currentUser.name : settings.userProfileName || 'Guest User'}
        logoVariant={settings.logoStyle || 'knot'}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        <ChatArea
          session={activeSession}
          isStreaming={isStreaming}
          onOpenSidebar={() => setSidebarOpen((prev) => !prev)}
          onSelectPersona={handleSelectPersona}
          onSendMessage={(text) => handleSendMessage(text)}
          onRegenerateResponse={handleRegenerateResponse}
          onEditMessage={handleEditMessage}
          onNewChat={handleNewChat}
          onToggleFeedback={handleToggleFeedback}
          userProfileName={currentUser ? currentUser.name : settings.userProfileName || 'You'}
          logoVariant={settings.logoStyle || 'knot'}
        />

        {/* Input Dock */}
        <ChatInput
          onSendMessage={(text, images) => handleSendMessage(text, images)}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          placeholder={
            activeSession && activeSession.messages.length > 0
              ? 'Reply to Aether AI...'
              : 'Ask anything or explore an idea...'
          }
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveStoredSettings(newSettings);
        }}
        onClearAllChats={handleClearAllChats}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
