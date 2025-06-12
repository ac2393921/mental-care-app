import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all elements', () => {
    const { getAllByText, getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getAllByText('ログイン')).toHaveLength(2); // Title and button
    expect(getByText('あなたの心の相談相手へようこそ')).toBeTruthy();
    expect(getByPlaceholderText('メールアドレス')).toBeTruthy();
    expect(getByPlaceholderText('パスワード')).toBeTruthy();
    expect(getByText('Googleでログイン')).toBeTruthy();
    expect(getByText('または')).toBeTruthy();
  });

  it('shows Google login button', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const googleButton = getByText('Googleでログイン');
    expect(googleButton).toBeTruthy();
  });

  it('navigates to signup screen when signup link is pressed', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const signupLink = getByText('新規登録');
    fireEvent.press(signupLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Signup');
  });

  it('allows email and password input', () => {
    const { getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('メールアドレス');
    const passwordInput = getByPlaceholderText('パスワード');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });
});