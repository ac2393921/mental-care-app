import { DatabaseService } from '../database';
import { supabase } from '../supabase';

describe('DatabaseService', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('getOrCreateUser race condition handling', () => {
    it('should use upsert to handle concurrent user creation', async () => {
      const mockClerkId = 'test-clerk-id';
      const mockUserId = 'test-user-id';

      // Mock supabase behavior for user not found, then upsert
      const mockFrom = jest.mocked(supabase.from);
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }),
      });
      const mockUpsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: mockUserId },
            error: null,
          }),
        }),
      });
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'conv-id',
              user_id: mockUserId,
              title: 'Test Conversation',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: mockSelect,
            upsert: mockUpsert,
          } as any;
        } else if (table === 'conversations') {
          return {
            insert: mockInsert,
          } as any;
        }
        return {} as any;
      });

      const result = await DatabaseService.createConversation(mockClerkId, 'Test Conversation');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockUpsert).toHaveBeenCalledWith(
        { clerk_id: mockClerkId },
        { onConflict: 'clerk_id' }
      );
    });

    it('should return existing user without calling upsert', async () => {
      const mockClerkId = 'existing-clerk-id';
      const mockUserId = 'existing-user-id';

      const mockFrom = jest.mocked(supabase.from);
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: mockUserId },
            error: null,
          }),
        }),
      });
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'conv-id',
              user_id: mockUserId,
              title: 'Test Conversation',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: mockSelect,
          } as any;
        } else if (table === 'conversations') {
          return {
            insert: mockInsert,
          } as any;
        }
        return {} as any;
      });

      const result = await DatabaseService.createConversation(mockClerkId, 'Test Conversation');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(result).toHaveProperty('id', 'conv-id');
    });
  });
});