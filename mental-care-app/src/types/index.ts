export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  mood_score: number; // 1-10 scale
  notes?: string;
  created_at: string;
}

export interface Usage {
  id: string;
  user_id: string;
  date: string;
  daily_count: number;
  is_premium: boolean;
}