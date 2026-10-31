import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Settings,
  HelpCircle,
  PanelLeftClose,
  Check,
  X,
  Sparkles,
  LogOut,
  LogIn,
  ChevronUp,
  Download,
} from 'lucide-react';
import { ChatSession } from '../types';
import { Logo, LogoVariant } from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  isGuest?: boolean;
  userEmail?: string;
  userName?: string;
  logoVariant?: LogoVariant;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onOpenSettings,
  onOpenShortcuts,
  onLogout,
  onOpenAuth,
  isGuest = false,
  userEmail = 'arshamin2000@gmail.com',
  userName = 'User',
  logoVariant = 'knot',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Filter sessions
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.isPinned);

  // Group unpinned sessions by date
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;

  const todaySessions = unpinnedSessions.filter((s) => now - s.updatedAt < ONE_DAY);
  const weekSessions = unpinnedSessions.filter(
    (s) => now - s.updatedAt >= ONE_DAY && now - s.updatedAt < SEVEN_DAYS
  );
  const olderSessions = unpinnedSessions.filter((s) => now - s.updatedAt >= SEVEN_DAYS);

  const handleStartRename = (e: React.MouseEvent, s: ChatSession) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const handleSaveRename = (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    if (isEditing) {
      return (
        <div
          key={session.id}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(e, session.id);
              if (e.key === 'Escape') setEditingId(null);
            }}
            autoFocus
            className="flex-1 bg-transparent border-none text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none"
          />
          <button
            onClick={(e) => handleSaveRename(e, session.id)}
            className="p-1 hover:text-emerald-500 text-zinc-500"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancelRename}
            className="p-1 hover:text-red-500 text-zinc-500"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={session.id}
        onClick={() => {
          onSelectSession(session.id);
          if (window.innerWidth < 768) onClose();
        }}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-150 ${
          isActive
            ? 'bg-zinc-200/80 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-50 font-medium shadow-xs'
            : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {session.isPinned ? (
            <Pin className="w-3.5 h-3.5 shrink-0 text-emerald-500 rotate-45" />
          ) : (
            <MessageSquare className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          )}
          <span className="truncate text-[13.5px]">{session.title || 'Untitled Conversation'}</span>
        </div>

        {/* Action icons on hover */}
        <div className="hidden group-hover:flex items-center gap-0.5 opacity-90 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePinSession(session.id);
            }}
            title={session.isPinned ? 'Unpin' : 'Pin chat'}
            className="p-1 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <Pin className={`w-3.5 h-3.5 ${session.isPinned ? 'text-emerald-500 fill-emerald-500/20' : ''}`} />
          </button>
          <button
            type="button"
            onClick={(e) => handleStartRename(e, session)}
            title="Rename"
            className="p-1 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSession(session.id);
            }}
            title="Delete"
            className="p-1 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 hover:text-red-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 flex flex-col bg-zinc-100 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 transition-transform duration-300 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-850">
          <Logo size="sm" showText={true} variant={logoVariant} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Close sidebar (Ctrl+[)"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            type="button"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm shadow-sm transition-all duration-150 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
              <span>New chat</span>
            </div>
            <kbd className="hidden sm:inline-block text-[11px] font-mono opacity-80 bg-violet-700/60 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Search Conversations */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-zinc-200/60 dark:bg-zinc-900 border border-transparent focus:border-emerald-500/40 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
          {sessions.length === 0 ? (
            <div className="px-4 py-8 text-center text-zinc-400 text-xs">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
              <p>No chat history yet</p>
              <p className="mt-1 text-zinc-500">Start your first prompt!</p>
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinnedSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[11px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-500 uppercase">
                    Pinned
                  </div>
                  {pinnedSessions.map(renderSessionItem)}
                </div>
              )}

              {/* Today */}
              {todaySessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                    Today
                  </div>
                  {todaySessions.map(renderSessionItem)}
                </div>
              )}

              {/* Previous 7 Days */}
              {weekSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                    Previous 7 Days
                  </div>
                  {weekSessions.map(renderSessionItem)}
                </div>
              )}

              {/* Older */}
              {olderSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                    Older
                  </div>
                  {olderSessions.map(renderSessionItem)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer User Profile & Settings */}
        <div className="relative p-2.5 border-t border-zinc-200/80 dark:border-zinc-850 bg-zinc-100/80 dark:bg-zinc-950/80">
          {/* User Popover Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute bottom-full left-2 right-2 mb-2 p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-zinc-100 dark:divide-zinc-800">
                {/* User info banner */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {userName}
                    </span>
                    <span className="text-[10px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/20">
                      {isGuest ? 'Guest' : 'Aether Ultra 4.0'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {userEmail}
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings & Custom Instructions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenShortcuts();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Keyboard shortcuts (?)</span>
                  </button>

                  <a
                    href="/api/download-zip"
                    download="aether-ai-source.zip"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Source (.zip)</span>
                  </a>
                </div>

                {/* Log in / Log out button */}
                <div className="pt-1">
                  {isGuest ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuth?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign in or Create Account</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log out ({userName})</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Trigger button */}
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800/70 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                  <span>{userName}</span>
                  {isGuest && (
                    <span className="text-[9px] uppercase px-1 rounded bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                      Guest
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-500 truncate" title={userEmail}>
                  {userEmail}
                </div>
              </div>
            </div>

            <ChevronUp className={`w-4 h-4 text-zinc-400 transition-transform ${showUserMenu ? 'rotate-180 text-emerald-500' : 'group-hover:text-zinc-600 dark:group-hover:text-zinc-200'}`} />
          </div>
        </div>
      </aside>
    </>
  );
};
