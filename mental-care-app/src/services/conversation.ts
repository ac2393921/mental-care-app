import { supabase } from './supabase';
import { DatabaseService } from './database';
import { LLMService } from './llm';
import { Conversation, Message } from '../types';

export class ConversationService {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  async createConversation(clerkId: string, title?: string): Promise<Conversation> {
    try {
      return await DatabaseService.createConversation(clerkId, title);
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('会話の作成に失敗しました');
    }
  }

  async getConversations(clerkId: string): Promise<Conversation[]> {
    try {
      return await DatabaseService.getConversations(clerkId);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async sendMessage(
    conversationId: string,
    userMessage: string,
    clerkId: string
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    try {
      // ユーザーメッセージを保存
      const savedUserMessage = await DatabaseService.createMessage(
        conversationId,
        userMessage,
        'user'
      );

      // 過去のメッセージを取得（コンテキスト用）
      const previousMessages = await DatabaseService.getMessages(conversationId);

      // LLMからレスポンスを生成
      const assistantResponse = await this.llmService.generateResponse(previousMessages);

      // アシスタントメッセージを保存
      const savedAssistantMessage = await DatabaseService.createMessage(
        conversationId,
        assistantResponse,
        'assistant'
      );

      // 会話のupdated_atを更新
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // 使用回数をインクリメント
      await DatabaseService.incrementDailyUsage(clerkId);

      return {
        userMessage: savedUserMessage,
        assistantMessage: savedAssistantMessage,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('メッセージの送信に失敗しました');
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      return await DatabaseService.getMessages(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async getUserDailyUsage(clerkId: string): Promise<number> {
    try {
      return await DatabaseService.getDailyUsage(clerkId);
    } catch (error) {
      console.error('Error fetching daily usage:', error);
      return 0;
    }
  }

  async canUserSendMessage(clerkId: string): Promise<{ canSend: boolean; reason?: string }> {
    try {
      const dailyUsage = await this.getUserDailyUsage(clerkId);
      const limit = 10; // 無料プランの制限

      if (dailyUsage >= limit) {
        return {
          canSend: false,
          reason: `本日の利用制限（${limit}回）に達しました。明日また利用できます。`,
        };
      }

      return { canSend: true };
    } catch (error) {
      console.error('Error checking user limits:', error);
      return { canSend: true }; // エラー時は送信を許可
    }
  }

  generateConversationTitle(firstMessage: string): string {
    // 最初のメッセージから会話タイトルを生成
    const cleanMessage = firstMessage.trim();
    
    if (cleanMessage.length <= 20) {
      return cleanMessage;
    }

    // キーワードベースでタイトルを生成
    const keywords = {
      '仕事': '仕事について',
      '会社': '職場の悩み',
      '上司': '上司との関係',
      '同僚': '同僚との関係',
      '疲れ': '疲れとストレス',
      '不安': '不安な気持ち',
      '心配': '心配事',
      '家族': '家族の関係',
      '恋人': '恋愛の悩み',
      '友達': '友人関係',
      '将来': '将来への不安',
      '健康': '健康の悩み',
    };

    for (const [keyword, title] of Object.entries(keywords)) {
      if (cleanMessage.includes(keyword)) {
        return title;
      }
    }

    // デフォルトタイトル
    return cleanMessage.substring(0, 20) + '...';
  }
}