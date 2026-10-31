import React, { useState } from 'react';
import { X, Moon, Sun, Monitor, Trash2, Volume2, ShieldAlert, Download, FileArchive } from 'lucide-react';
import { UserSettings } from '../types';
import { Logo } from './Logo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllChats,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* Theme selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'system', label: 'System', icon: Monitor },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, theme: id as any })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    localSettings.theme === id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Emblem Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Logo Emblem
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'knot', label: 'Bloom Knot' },
                { id: 'prism', label: 'Quantum Prism' },
                { id: 'mobius', label: 'Infinity Ribbon' },
                { id: 'iris', label: 'Neural Iris' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, logoStyle: id as any })}
                  className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    (localSettings.logoStyle || 'knot') === id
                      ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Logo size="sm" variant={id as any} showText={false} />
                  <span className="text-[11px] font-semibold text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Profile Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Your Display Name
            </label>
            <input
              type="text"
              value={localSettings.userProfileName}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, userProfileName: e.target.value })
              }
              placeholder="e.g., Alex"
              className="w-full px-3 py-2 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Custom Instructions
            </label>
            <p className="text-xs text-zinc-500">
              What would you like Aether AI to know about you to provide better, more personalized responses?
            </p>
            <textarea
              rows={4}
              value={localSettings.customInstructions}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, customInstructions: e.target.value })
              }
              placeholder="e.g., I'm a full-stack software engineer working with TypeScript and React. Keep explanations concise, prioritize practical code examples, and point out security considerations."
              className="w-full p-3 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
            />
          </div>

          {/* Sound effects toggle */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Audio Chimes
                </div>
                <div className="text-xs text-zinc-500">
                  Play gentle sound when responses finish generating
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={localSettings.soundEffects}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, soundEffects: e.target.checked })
              }
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Download Project Source Code */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Export & Source Code
            </label>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <FileArchive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Aether AI Complete Source
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Full TypeScript, React, Tailwind & Express project (.zip)
                  </div>
                </div>
              </div>

              <a
                href="/api/download-zip"
                download="aether-ai-source.zip"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .zip</span>
              </a>
            </div>
          </div>

          {/* Danger Zone: Delete All Chats */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-red-500">
              Data Management
            </label>

            {showClearConfirm ? (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-500">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Are you sure? This action cannot be undone.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllChats();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                  >
                    Yes, delete everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all conversation history</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
