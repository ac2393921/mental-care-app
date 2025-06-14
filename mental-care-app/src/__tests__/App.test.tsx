import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

// Mock Clerk Provider and hooks
jest.mock('@clerk/clerk-expo', () => ({
  ClerkProvider: ({ children }: any) => children,
  useAuth: () => ({
    isSignedIn: false,
    isLoaded: true,
  }),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children,
  }),
}));

// Mock screens
jest.mock('../screens/LoginScreen', () => 'LoginScreen');
jest.mock('../screens/SignupScreen', () => 'SignupScreen');
jest.mock('../screens/ChatScreen', () => 'ChatScreen');
jest.mock('../screens/HistoryScreen', () => 'HistoryScreen');
jest.mock('../screens/SettingsScreen', () => 'SettingsScreen');

describe('App', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});