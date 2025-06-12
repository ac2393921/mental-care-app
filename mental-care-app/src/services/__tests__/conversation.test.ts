import { ConversationService } from '../conversation';

// Mock DatabaseService
jest.mock('../database', () => ({
  DatabaseService: {
    createConversation: jest.fn(),
    getConversations: jest.fn(),
    createMessage: jest.fn(),
    getMessages: jest.fn(),
    incrementDailyUsage: jest.fn(),
    getDailyUsage: jest.fn(),
  },
}));

// Mock LLMService
jest.mock('../llm', () => ({
  LLMService: jest.fn().mockImplementation(() => ({
    generateResponse: jest.fn().mockResolvedValue('Mock LLM response'),
  })),
}));

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

import { DatabaseService } from '../database';

describe('ConversationService', () => {
  let conversationService: ConversationService;
  const mockUserId = 'test-user-id';
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    conversationService = new ConversationService();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('createConversation', () => {
    it('should create a new conversation', async () => {
      const mockConversation = {
        id: 'conv-1',
        user_id: mockUserId,
        title: 'New conversation',
        created_at: '2024-06-11T10:00:00Z',
        updated_at: '2024-06-11T10:00:00Z',
      };

      (DatabaseService.createConversation as jest.Mock).mockResolvedValue(mockConversation);

      const result = await conversationService.createConversation(mockUserId, 'New conversation');

      expect(DatabaseService.createConversation).toHaveBeenCalledWith(mockUserId, 'New conversation');
      expect(result).toEqual(mockConversation);
    });

    it('should handle database errors', async () => {
      (DatabaseService.createConversation as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(conversationService.createConversation(mockUserId))
        .rejects.toThrow('会話の作成に失敗しました');
    });
  });

  describe('getConversations', () => {
    it('should return conversations for user', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          user_id: mockUserId,
          title: 'Conversation 1',
          created_at: '2024-06-11T10:00:00Z',
          updated_at: '2024-06-11T10:00:00Z',
        },
      ];

      (DatabaseService.getConversations as jest.Mock).mockResolvedValue(mockConversations);

      const result = await conversationService.getConversations(mockUserId);

      expect(DatabaseService.getConversations).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockConversations);
    });

    it('should return empty array on error', async () => {
      (DatabaseService.getConversations as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await conversationService.getConversations(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getUserDailyUsage', () => {
    it('should return daily usage count', async () => {
      (DatabaseService.getDailyUsage as jest.Mock).mockResolvedValue(5);

      const result = await conversationService.getUserDailyUsage(mockUserId);

      expect(DatabaseService.getDailyUsage).toHaveBeenCalledWith(mockUserId);
      expect(result).toBe(5);
    });

    it('should return 0 on error', async () => {
      (DatabaseService.getDailyUsage as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await conversationService.getUserDailyUsage(mockUserId);

      expect(result).toBe(0);
    });
  });

  describe('canUserSendMessage', () => {
    it('should allow message when under limit', async () => {
      (DatabaseService.getDailyUsage as jest.Mock).mockResolvedValue(5);

      const result = await conversationService.canUserSendMessage(mockUserId);

      expect(result.canSend).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block message when at limit', async () => {
      (DatabaseService.getDailyUsage as jest.Mock).mockResolvedValue(10);

      const result = await conversationService.canUserSendMessage(mockUserId);

      expect(result.canSend).toBe(false);
      expect(result.reason).toContain('本日の利用制限');
    });

    it('should allow message on error', async () => {
      (DatabaseService.getDailyUsage as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await conversationService.canUserSendMessage(mockUserId);

      expect(result.canSend).toBe(true);
    });
  });

  describe('generateConversationTitle', () => {
    it('should return short message as is', () => {
      const shortMessage = 'こんにちは';
      const title = conversationService.generateConversationTitle(shortMessage);
      expect(title).toBe(shortMessage);
    });

    it('should generate keyword-based title for long messages', () => {
      const workMessage = '仕事のことで相談があります。上司との関係がうまくいかず、毎日が憂鬱です。';
      const title = conversationService.generateConversationTitle(workMessage);
      expect(title).toBe('仕事について');
    });

    it('should truncate long messages without keywords', () => {
      const longMessage = 'これは非常に長いメッセージで、タイトルとしては適切ではありません。適切に切り詰められる必要があります。';
      const title = conversationService.generateConversationTitle(longMessage);
      expect(title).toBe('これは非常に長いメッセージで、タイトルと...');
    });

    it('should handle family keyword for long messages', () => {
      const familyMessage = '家族との関係について悩んでいます。特に父親との距離感がわからず困っています。';
      const title = conversationService.generateConversationTitle(familyMessage);
      expect(title).toBe('家族の関係');
    });

    it('should return short messages as-is', () => {
      const shortWorkMessage = '仕事のことで相談があります';
      const title = conversationService.generateConversationTitle(shortWorkMessage);
      expect(title).toBe('仕事のことで相談があります');
    });
  });
});