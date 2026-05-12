import { useUser, useClerk } from "@clerk/react";

export interface AuthUser {
  id: string;
  email: string;
  display_name: string | null;
}

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        display_name: user.fullName ?? user.firstName ?? null,
      }
    : null;

  const signOut = async () => {
    await clerkSignOut();
  };

  return {
    user: authUser,
    loading: !isLoaded,
    signOut,
  };
}
