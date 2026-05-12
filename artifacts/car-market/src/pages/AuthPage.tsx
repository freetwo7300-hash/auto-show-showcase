import { SignIn, SignUp } from "@clerk/react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [location] = useLocation();
  const isSignUp = location === "/sign-up";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {isSignUp ? (
        <SignUp fallbackRedirectUrl="/" />
      ) : (
        <SignIn fallbackRedirectUrl="/" />
      )}
    </div>
  );
}
