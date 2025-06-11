import { supabase } from './supabase';
import { Conversation, Message, MoodLog, Usage } from '../types';

export class DatabaseService {
  // Conversation methods
  static async createConversation(userId: string, title?: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getConversations(userId: string): Promise<Conversation[]> {
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
    userId: string,
    moodScore: number,
    notes?: string
  ): Promise<MoodLog> {
    const { data, error } = await supabase
      .from('mood_logs')
      .insert({ user_id: userId, mood_score: moodScore, notes })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getMoodLogs(userId: string, limit = 30): Promise<MoodLog[]> {
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
  static async incrementDailyUsage(userId: string): Promise<Usage> {
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

  static async getDailyUsage(userId: string): Promise<number> {
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