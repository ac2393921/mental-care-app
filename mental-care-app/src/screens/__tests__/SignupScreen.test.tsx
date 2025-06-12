import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SignupScreen from '../SignupScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all elements', () => {
    const { getAllByText, getByText, getByPlaceholderText } = render(
      <SignupScreen navigation={mockNavigation} />
    );

    expect(getAllByText('新規登録')).toHaveLength(2); // Title and button
    expect(getByText('あなただけの心の相談相手を始めましょう')).toBeTruthy();
    expect(getByPlaceholderText('メールアドレス')).toBeTruthy();
    expect(getByPlaceholderText('パスワード（8文字以上）')).toBeTruthy();
    expect(getByPlaceholderText('パスワード確認')).toBeTruthy();
    expect(getByText('Googleで登録')).toBeTruthy();
    expect(getByText('または')).toBeTruthy();
  });

  it('shows Google signup button', () => {
    const { getByText } = render(
      <SignupScreen navigation={mockNavigation} />
    );

    const googleButton = getByText('Googleで登録');
    expect(googleButton).toBeTruthy();
  });

  it('navigates to login screen when login link is pressed', () => {
    const { getByText } = render(
      <SignupScreen navigation={mockNavigation} />
    );

    const loginLink = getByText('ログイン');
    fireEvent.press(loginLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('allows form input', () => {
    const { getByPlaceholderText } = render(
      <SignupScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('メールアドレス');
    const passwordInput = getByPlaceholderText('パスワード（8文字以上）');
    const confirmPasswordInput = getByPlaceholderText('パスワード確認');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
    expect(confirmPasswordInput.props.value).toBe('password123');
  });
});