import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';

export const useAuth = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();

  return {
    user,
    isLoaded,
    isSignedIn,
    userId: user?.id,
    signOut,
  };
};