import { useUser } from '@clerk/clerk-expo';

export const useAuth = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  return {
    user,
    isLoaded,
    isSignedIn,
    userId: user?.id,
  };
};