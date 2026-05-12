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

  const isAdmin = (user?.publicMetadata as Record<string, unknown>)?.role === "admin";

  const signOut = async () => {
    await clerkSignOut();
  };

  return {
    user: authUser,
    isAdmin,
    loading: !isLoaded,
    signOut,
  };
}
