export type Role = 'user' | 'model';

export type PersonaType = 'standard' | 'reasoner' | 'coder' | 'creative' | 'concise';

export interface ImageAttachment {
  name: string;
  mimeType: string;
  data: string; // Base64 data URL
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  images?: ImageAttachment[];
  persona?: PersonaType;
  feedback?: 'like' | 'dislike' | null;
  thoughtProcess?: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  persona: PersonaType;
  isPinned?: boolean;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  customInstructions: string;
  userProfileName: string;
  soundEffects: boolean;
  defaultPersona: PersonaType;
  voiceSpeed: number;
  selectedVoiceURI: string;
  logoStyle?: 'knot' | 'prism' | 'mobius' | 'iris';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  createdAt: number;
}

