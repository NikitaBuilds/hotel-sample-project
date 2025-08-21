"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/services/supabase/use-user";
import { usePostLoginRedirect } from "@/services/group/hooks";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail } = useUser();

  // Post-login redirection logic
  const { hasGroups, hasPendingInvitations, isChecking } = usePostLoginRedirect(
    {
      enabled: false, // We'll handle redirection manually after successful login
    }
  );

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = isSignUp
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (error) {
        setError(error.message);
      } else {
        if (isSignUp) {
          setError("Check your email for a confirmation link!");
        } else {
          // Check if user has groups, if not and has invitations, redirect to invitations page
          if (!hasGroups && hasPendingInvitations) {
            router.push("/dashboard/profile/my-invitations");
          } else {
            router.push("/dashboard");
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleEmailAuth}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {isSignUp ? "Start Your Holiday Journey" : "Welcome Back, Explorer"}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {isSignUp
            ? "Create your account to book the best holidays with your friends"
            : "Sign in to discover and book amazing holidays with your friends"}
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {!isSignUp && (
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            )}
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600"
          size="lg"
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : isSignUp
            ? "Start Planning"
            : "Let's Explore"}
        </Button>
      </div>
      <div className="text-center text-sm">
        {isSignUp ? "Already have an account?" : "New to holiday planning?"}
        <Button
          type="button"
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          className="underline underline-offset-4 text-yellow-500 font-bold hover:text-yellow-600"
          size="sm"
          disabled={loading}
        >
          {isSignUp ? "Sign in" : "Join the adventure"}
        </Button>
      </div>
    </form>
  );
}
