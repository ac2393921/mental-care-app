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
    expect(getByText('10:00')).toBeTruthy();
  });

  it('renders assistant message correctly', () => {
    const { getByText } = render(<MessageBubble message={mockAssistantMessage} />);
    
    expect(getByText('Hello, this is an assistant message')).toBeTruthy();
    expect(getByText('10:01')).toBeTruthy();
  });

  it('applies correct styles for user message', () => {
    const { getByText } = render(<MessageBubble message={mockUserMessage} />);
    
    const messageText = getByText('Hello, this is a user message');
    expect(messageText).toHaveStyle({
      color: '#fff',
    });
  });

  it('applies correct styles for assistant message', () => {
    const { getByText } = render(<MessageBubble message={mockAssistantMessage} />);
    
    const messageText = getByText('Hello, this is an assistant message');
    expect(messageText).toHaveStyle({
      color: '#2c3e50',
    });
  });

  it('formats timestamp correctly', () => {
    const messageWithSpecificTime: Message = {
      ...mockUserMessage,
      created_at: '2024-06-11T15:30:45Z',
    };

    const { getByText } = render(<MessageBubble message={messageWithSpecificTime} />);
    expect(getByText('15:30')).toBeTruthy();
  });
});