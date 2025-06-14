import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ChatScreen from '../ChatScreen';

// Mock dependencies
jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
}));

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
}));

jest.mock('../../stores/chatStore', () => ({
  useChatStore: () => ({
    messages: [
      {
        id: 'welcome-msg',
        conversation_id: null,
        content: 'こんにちは！今日はどんなことでお悩みですか？どんな小さなことでも、お気軽にお話しください。あなたの気持ちに寄り添います。',
        role: 'assistant',
        created_at: new Date().toISOString(),
      },
    ],
    isLoading: false,
    currentConversation: null,
    setCurrentConversation: jest.fn(),
    addMessage: jest.fn(),
    setIsLoading: jest.fn(),
  }),
}));

jest.mock('../../services/conversation', () => ({
  ConversationService: jest.fn().mockImplementation(() => ({
    createConversation: jest.fn().mockResolvedValue({
      id: 'conv-1',
      user_id: 'test-user-id',
      title: '新しい相談',
      created_at: '2024-06-11T10:00:00Z',
      updated_at: '2024-06-11T10:00:00Z',
    }),
    canUserSendMessage: jest.fn().mockResolvedValue({ canSend: true }),
    sendMessage: jest.fn().mockResolvedValue({
      userMessage: {
        id: 'user-msg-1',
        conversation_id: 'conv-1',
        content: 'Test message',
        role: 'user',
        created_at: '2024-06-11T10:00:00Z',
      },
      assistantMessage: {
        id: 'assistant-msg-1',
        conversation_id: 'conv-1',
        content: 'Mock response',
        role: 'assistant',
        created_at: '2024-06-11T10:01:00Z',
      },
    }),
    generateConversationTitle: jest.fn().mockReturnValue('Generated Title'),
  })),
}));

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

describe('ChatScreen', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Console errorsをモックして警告を抑制
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<ChatScreen />);

    expect(getByText('心の相談相手')).toBeTruthy();
    expect(getByText('あなたの話を聞かせてください')).toBeTruthy();
    expect(getByPlaceholderText('どんなことでも気軽にお話しください...')).toBeTruthy();
  });

  it('renders input components correctly', () => {
    const { getByPlaceholderText, getByText } = render(<ChatScreen />);

    // メッセージ入力とボタンが存在することを確認
    expect(getByPlaceholderText('どんなことでも気軽にお話しください...')).toBeTruthy();
    expect(getByText('送信')).toBeTruthy();
    expect(getByText('🎤')).toBeTruthy();
  });

  it('allows text input', () => {
    const { getByPlaceholderText } = render(<ChatScreen />);

    const input = getByPlaceholderText('どんなことでも気軽にお話しください...');
    fireEvent.changeText(input, 'Test message');

    expect(input.props.value).toBe('Test message');
  });
});