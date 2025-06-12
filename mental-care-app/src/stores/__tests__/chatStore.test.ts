import { renderHook, act } from '@testing-library/react-native';
import { useChatStore } from '../chatStore';
import { Message, Conversation } from '../../types';

describe('useChatStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useChatStore.getState().resetChat();
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useChatStore());

    expect(result.current.conversations).toEqual([]);
    expect(result.current.currentConversation).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should set conversations', () => {
    const { result } = renderHook(() => useChatStore());

    const mockConversations: Conversation[] = [
      {
        id: 'conv-1',
        user_id: 'user-1',
        title: 'Test Conversation',
        created_at: '2024-06-11T10:00:00Z',
        updated_at: '2024-06-11T10:00:00Z',
      },
    ];

    act(() => {
      result.current.setConversations(mockConversations);
    });

    expect(result.current.conversations).toEqual(mockConversations);
  });

  it('should set current conversation', () => {
    const { result } = renderHook(() => useChatStore());

    const mockConversation: Conversation = {
      id: 'conv-1',
      user_id: 'user-1',
      title: 'Current Conversation',
      created_at: '2024-06-11T10:00:00Z',
      updated_at: '2024-06-11T10:00:00Z',
    };

    act(() => {
      result.current.setCurrentConversation(mockConversation);
    });

    expect(result.current.currentConversation).toEqual(mockConversation);
  });

  it('should set messages', () => {
    const { result } = renderHook(() => useChatStore());

    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        content: 'Hello',
        role: 'user',
        created_at: '2024-06-11T10:00:00Z',
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-1',
        content: 'Hi there!',
        role: 'assistant',
        created_at: '2024-06-11T10:01:00Z',
      },
    ];

    act(() => {
      result.current.setMessages(mockMessages);
    });

    expect(result.current.messages).toEqual(mockMessages);
  });

  it('should add message to existing messages', () => {
    const { result } = renderHook(() => useChatStore());

    const initialMessage: Message = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      content: 'Hello',
      role: 'user',
      created_at: '2024-06-11T10:00:00Z',
    };

    const newMessage: Message = {
      id: 'msg-2',
      conversation_id: 'conv-1',
      content: 'Hi there!',
      role: 'assistant',
      created_at: '2024-06-11T10:01:00Z',
    };

    act(() => {
      result.current.setMessages([initialMessage]);
    });

    act(() => {
      result.current.addMessage(newMessage);
    });

    expect(result.current.messages).toEqual([initialMessage, newMessage]);
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useChatStore());

    act(() => {
      result.current.setIsLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setIsLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should reset chat state', () => {
    const { result } = renderHook(() => useChatStore());

    // Set some state first
    const mockConversation: Conversation = {
      id: 'conv-1',
      user_id: 'user-1',
      title: 'Test',
      created_at: '2024-06-11T10:00:00Z',
      updated_at: '2024-06-11T10:00:00Z',
    };

    const mockMessage: Message = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      content: 'Hello',
      role: 'user',
      created_at: '2024-06-11T10:00:00Z',
    };

    act(() => {
      result.current.setCurrentConversation(mockConversation);
      result.current.setMessages([mockMessage]);
      result.current.setIsLoading(true);
    });

    // Reset
    act(() => {
      result.current.resetChat();
    });

    expect(result.current.conversations).toEqual([]);
    expect(result.current.currentConversation).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should maintain state consistency across multiple operations', () => {
    const { result } = renderHook(() => useChatStore());

    const conversation: Conversation = {
      id: 'conv-1',
      user_id: 'user-1',
      title: 'Test Conversation',
      created_at: '2024-06-11T10:00:00Z',
      updated_at: '2024-06-11T10:00:00Z',
    };

    const message1: Message = {
      id: 'msg-1',
      conversation_id: 'conv-1',
      content: 'First message',
      role: 'user',
      created_at: '2024-06-11T10:00:00Z',
    };

    const message2: Message = {
      id: 'msg-2',
      conversation_id: 'conv-1',
      content: 'Second message',
      role: 'assistant',
      created_at: '2024-06-11T10:01:00Z',
    };

    act(() => {
      result.current.setConversations([conversation]);
      result.current.setCurrentConversation(conversation);
      result.current.addMessage(message1);
      result.current.setIsLoading(true);
      result.current.addMessage(message2);
      result.current.setIsLoading(false);
    });

    expect(result.current.conversations).toEqual([conversation]);
    expect(result.current.currentConversation).toEqual(conversation);
    expect(result.current.messages).toEqual([message1, message2]);
    expect(result.current.isLoading).toBe(false);
  });
});