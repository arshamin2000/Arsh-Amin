import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Enter', desc: 'Send message' },
    { key: 'Shift + Enter', desc: 'Add new line in input' },
    { key: 'Ctrl/Cmd + K', desc: 'Start a new conversation' },
    { key: 'Ctrl/Cmd + [', desc: 'Toggle sidebar' },
    { key: 'Esc', desc: 'Close dialogs or cancel edit' },
    { key: '?', desc: 'Show this keyboard shortcuts modal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-zinc-600 dark:text-zinc-400">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono border border-zinc-200 dark:border-zinc-700 font-medium">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
