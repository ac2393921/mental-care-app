import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import MessageInput from '../MessageInput';

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

describe('MessageInput', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <MessageInput onSendMessage={mockOnSendMessage} />
    );

    expect(getByPlaceholderText('メッセージを入力...')).toBeTruthy();
    expect(getByText('送信')).toBeTruthy();
    expect(getByText('🎤')).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <MessageInput 
        onSendMessage={mockOnSendMessage} 
        placeholder="カスタムプレースホルダー"
      />
    );

    expect(getByPlaceholderText('カスタムプレースホルダー')).toBeTruthy();
  });

  it('calls onSendMessage when send button is pressed with valid message', () => {
    const { getByPlaceholderText, getByText } = render(
      <MessageInput onSendMessage={mockOnSendMessage} />
    );

    const textInput = getByPlaceholderText('メッセージを入力...');
    const sendButton = getByText('送信');

    fireEvent.changeText(textInput, 'Test message');
    fireEvent.press(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('clears input after sending message', () => {
    const { getByPlaceholderText, getByText } = render(
      <MessageInput onSendMessage={mockOnSendMessage} />
    );

    const textInput = getByPlaceholderText('メッセージを入力...');
    const sendButton = getByText('送信');

    fireEvent.changeText(textInput, 'Test message');
    fireEvent.press(sendButton);

    expect(textInput.props.value).toBe('');
  });

  it('shows alert for empty message', () => {
    const { getByText } = render(
      <MessageInput onSendMessage={mockOnSendMessage} />
    );

    const sendButton = getByText('送信');
    fireEvent.press(sendButton);

    expect(Alert.alert).toHaveBeenCalledWith('エラー', 'メッセージを入力してください');
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('shows alert for message too long', () => {
    const { getByPlaceholderText, getByText } = render(
      <MessageInput onSendMessage={mockOnSendMessage} />
    );

    const textInput = getByPlaceholderText('メッセージを入力...');
    const sendButton = getByText('送信');
    const longMessage = 'a'.repeat(1001);

    fireEvent.changeText(textInput, longMessage);
    fireEvent.press(sendButton);

    expect(Alert.alert).toHaveBeenCalledWith('エラー', 'メッセージは1000文字以内で入力してください');
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('trims whitespace from message', () => {
    const { getByPlaceholderText, getByText } = render(
      <MessageInput onSendMessage={mockOnSendMessage} />
    );

    const textInput = getByPlaceholderText('メッセージを入力...');
    const sendButton = getByText('送信');

    fireEvent.changeText(textInput, '  Test message  ');
    fireEvent.press(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('disables input and shows loading state', () => {
    const { getByPlaceholderText, getByText } = render(
      <MessageInput onSendMessage={mockOnSendMessage} loading={true} />
    );

    const textInput = getByPlaceholderText('メッセージを入力...');
    const sendButton = getByText('送信中...');

    expect(textInput.props.editable).toBe(false);
    expect(sendButton).toBeTruthy();
  });

  it('disables send button when message is empty', () => {
    const { getByText } = render(
      <MessageInput onSendMessage={mockOnSendMessage} />
    );

    const sendButton = getByText('送信');
    
    // Click the button with empty message - should not call onSendMessage
    fireEvent.press(sendButton);
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });
});