import { renderHook } from '@testing-library/react-native';
import { useAuth } from '../useAuth';

// Mock Clerk hooks
jest.mock('@clerk/clerk-expo', () => ({
  useUser: jest.fn(),
  useAuth: jest.fn(),
}));

import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';

describe('useAuth', () => {
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user data when authenticated', () => {
    const mockUser = {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    };

    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoaded: true,
      isSignedIn: true,
    });

    (useClerkAuth as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.userId).toBe('test-user-id');
    expect(result.current.signOut).toBe(mockSignOut);
  });

  it('should return null user when not authenticated', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    });

    (useClerkAuth as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.userId).toBeUndefined();
    expect(result.current.signOut).toBe(mockSignOut);
  });

  it('should return loading state when not loaded', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: false,
      isSignedIn: false,
    });

    (useClerkAuth as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.userId).toBeUndefined();
    expect(result.current.signOut).toBe(mockSignOut);
  });
});