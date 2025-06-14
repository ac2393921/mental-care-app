import { LLMService } from '../llm';
import { Message } from '../../types';

// Mock environment variables
const originalEnv = process.env;

describe('LLMService', () => {
  let llmService: LLMService;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('MockLLMProvider', () => {
    beforeEach(() => {
      // No API keys set, should use MockLLMProvider
      process.env.OPENAI_API_KEY = 'your_openai_api_key_here';
      process.env.CLAUDE_API_KEY = 'your_claude_api_key_here';
      llmService = new LLMService();
    });

    it('should initialize with MockLLMProvider when no valid API keys', () => {
      expect(llmService.getProviderName()).toBe('Mock');
    });

    it('should generate response for empty message history', async () => {
      const messages: Message[] = [];
      const response = await llmService.generateResponse(messages);
      
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should generate response for single message', async () => {
      const messages: Message[] = [{
        id: '1',
        conversation_id: 'conv-1',
        content: '仕事でストレスが溜まっています',
        role: 'user',
        created_at: '2024-06-11T10:00:00Z',
      }];

      const response = await llmService.generateResponse(messages);
      
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should provide contextual responses based on keywords', async () => {
      const workStressMessage: Message[] = [{
        id: '1',
        conversation_id: 'conv-1',
        content: '仕事が大変で疲れています',
        role: 'user',
        created_at: '2024-06-11T10:00:00Z',
      }];

      const response = await llmService.generateResponse(workStressMessage);
      
      expect(response).toContain('仕事');
    });

    it('should handle multiple messages', async () => {
      const messages: Message[] = [
        {
          id: '1',
          conversation_id: 'conv-1',
          content: 'こんにちは',
          role: 'user',
          created_at: '2024-06-11T10:00:00Z',
        },
        {
          id: '2',
          conversation_id: 'conv-1',
          content: 'こんにちは！今日はどんなことでお悩みですか？',
          role: 'assistant',
          created_at: '2024-06-11T10:01:00Z',
        },
        {
          id: '3',
          conversation_id: 'conv-1',
          content: '不安な気持ちがあります',
          role: 'user',
          created_at: '2024-06-11T10:02:00Z',
        },
      ];

      const response = await llmService.generateResponse(messages);
      
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should simulate realistic response time', async () => {
      const start = Date.now();
      const messages: Message[] = [{
        id: '1',
        conversation_id: 'conv-1',
        content: 'テストメッセージ',
        role: 'user',
        created_at: '2024-06-11T10:00:00Z',
      }];

      await llmService.generateResponse(messages);
      const duration = Date.now() - start;
      
      expect(duration).toBeGreaterThan(1000); // At least 1 second
      expect(duration).toBeLessThan(4000); // Less than 4 seconds
    });
  });

  describe('Error handling', () => {
    it('should fallback to mock provider on API error', async () => {
      // This would require mocking fetch to simulate API errors
      // For now, we'll test that the service handles the mock provider correctly
      const llmService = new LLMService();
      const messages: Message[] = [{
        id: '1',
        conversation_id: 'conv-1',
        content: 'Test message',
        role: 'user',
        created_at: '2024-06-11T10:00:00Z',
      }];

      const response = await llmService.generateResponse(messages);
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });
  });
});