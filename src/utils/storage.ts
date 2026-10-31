import { ChatSession, UserSettings, UserAccount } from '../types';

const STORAGE_KEY_SESSIONS = 'nexus_ai_sessions_v1';
const STORAGE_KEY_ACTIVE = 'nexus_ai_active_session_v1';
const STORAGE_KEY_SETTINGS = 'nexus_ai_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  customInstructions: '',
  userProfileName: 'User',
  soundEffects: true,
  defaultPersona: 'standard',
  voiceSpeed: 1.0,
  selectedVoiceURI: '',
  logoStyle: 'knot',
};

export function loadStoredSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load sessions from localStorage:', e);
    return [];
  }
}

export function saveStoredSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage:', e);
  }
}

export function loadActiveSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE);
  } catch {
    return null;
  }
}

export function saveActiveSessionId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE);
    }
  } catch {}
}

export function loadStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function createNewSession(persona: UserSettings['defaultPersona'] = 'standard'): ChatSession {
  const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id,
    title: 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    persona,
    isPinned: false,
  };
}

// Authentication Storage
const STORAGE_KEY_CURRENT_USER = 'nexus_ai_current_user_v1';
const STORAGE_KEY_ACCOUNTS = 'nexus_ai_accounts_v1';

export const DEFAULT_USER: UserAccount = {
  id: 'usr_arsh_default',
  name: 'Arsh Amin',
  email: 'arshamin2000@gmail.com',
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
};

export function loadCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch {}
}

export function loadAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      // Seed with initial default account
      const seeded = [DEFAULT_USER];
      saveAccounts(seeded);
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return [DEFAULT_USER];
  }
}

export function saveAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch {}
}

export function registerUser(name: string, email: string, password?: string): { success: boolean; user?: UserAccount; error?: string } {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedEmail || !trimmedName) {
    return { success: false, error: 'Please enter both your name and email.' };
  }

  const accounts = loadAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const newUser: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: trimmedName,
    email: trimmedEmail,
    password: password || undefined,
    createdAt: Date.now(),
  };

  accounts.push(newUser);
  saveAccounts(accounts);
  saveCurrentUser(newUser);

  return { success: true, user: newUser };
}

export function loginUser(email: string, password?: string): { success: boolean; user?: UserAccount; error?: string } {
  const trimmedEmail = email.trim().toLowerCase();
  const accounts = loadAccounts();

  const user = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);
  if (!user) {
    // If not found and it's the admin/owner email, auto-create
    if (trimmedEmail === 'arshamin2000@gmail.com') {
      const newUser = { ...DEFAULT_USER };
      accounts.push(newUser);
      saveAccounts(accounts);
      saveCurrentUser(newUser);
      return { success: true, user: newUser };
    }
    return { success: false, error: 'Account not found with this email. Please sign up.' };
  }

  // If password was set on account, verify
  if (user.password && password && user.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  saveCurrentUser(user);
  return { success: true, user };
}

export function logoutUser(): void {
  saveCurrentUser(null);
}

