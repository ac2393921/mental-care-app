import React from 'react';
import { render } from '@testing-library/react-native';
import MessageBubble from '../MessageBubble';
import { Message } from '../../types';

describe('MessageBubble', () => {
  const mockUserMessage: Message = {
    id: '1',
    conversation_id: 'conv-1',
    content: 'Hello, this is a user message',
    role: 'user',
    created_at: '2024-06-11T10:00:00Z',
  };

  const mockAssistantMessage: Message = {
    id: '2',
    conversation_id: 'conv-1',
    content: 'Hello, this is an assistant message',
    role: 'assistant',
    created_at: '2024-06-11T10:01:00Z',
  };

  it('renders user message correctly', () => {
    const { getByText } = render(<MessageBubble message={mockUserMessage} />);
    
    expect(getByText('Hello, this is a user message')).toBeTruthy();
    // 時刻が表示されることを確認（具体的な値は環境により異なる）
    const timeRegex = /\d{1,2}:\d{2}/;
    expect(getByText(timeRegex)).toBeTruthy();
  });

  it('renders assistant message correctly', () => {
    const { getByText } = render(<MessageBubble message={mockAssistantMessage} />);
    
    expect(getByText('Hello, this is an assistant message')).toBeTruthy();
    // 時刻が表示されることを確認
    const timeRegex = /\d{1,2}:\d{2}/;
    expect(getByText(timeRegex)).toBeTruthy();
  });

  it('renders message content', () => {
    const { getByText } = render(<MessageBubble message={mockUserMessage} />);
    
    // メッセージ内容が表示されることを確認
    expect(getByText('Hello, this is a user message')).toBeTruthy();
  });

  it('renders timestamp', () => {
    const { getByText } = render(<MessageBubble message={mockAssistantMessage} />);
    
    // 時刻フォーマットのパターンをテスト
    const timeRegex = /\d{1,2}:\d{2}/;
    expect(getByText(timeRegex)).toBeTruthy();
  });
});