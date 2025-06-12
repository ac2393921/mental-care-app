import { supabase } from './supabase';
import { Conversation, Message, MoodLog, Usage } from '../types';

// Clerk IDからSupabase User IDを取得または作成
async function getOrCreateUser(clerkId: string): Promise<string> {
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (existingUser) {
    return existingUser.id;
  }

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  // ユーザーが存在しない場合は作成
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({ clerk_id: clerkId })
    .select('id')
    .single();

  if (createError) throw createError;
  return newUser.id;
}

export class DatabaseService {
  // Conversation methods
  static async createConversation(clerkId: string, title?: string): Promise<Conversation> {
    const userId = await getOrCreateUser(clerkId);
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getConversations(clerkId: string): Promise<Conversation[]> {
    const userId = await getOrCreateUser(clerkId);
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Message methods
  static async createMessage(
    conversationId: string,
    content: string,
    role: 'user' | 'assistant'
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, content, role })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Mood log methods
  static async createMoodLog(
    clerkId: string,
    moodScore: number,
    notes?: string
  ): Promise<MoodLog> {
    const userId = await getOrCreateUser(clerkId);
    
    const { data, error } = await supabase
      .from('mood_logs')
      .insert({ user_id: userId, mood_score: moodScore, notes })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getMoodLogs(clerkId: string, limit = 30): Promise<MoodLog[]> {
    const userId = await getOrCreateUser(clerkId);
    
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Usage tracking methods
  static async incrementDailyUsage(clerkId: string): Promise<Usage> {
    const userId = await getOrCreateUser(clerkId);
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existing, error: fetchError } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (existing) {
      const { data, error } = await supabase
        .from('usage')
        .update({ daily_count: existing.daily_count + 1 })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('usage')
        .insert({ user_id: userId, date: today, daily_count: 1, is_premium: false })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  static async getDailyUsage(clerkId: string): Promise<number> {
    const userId = await getOrCreateUser(clerkId);
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('usage')
      .select('daily_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.daily_count || 0;
  }
}