"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const supabase = React.useMemo(() => supabaseBrowser(), []);

  const [name, setName] = React.useState(""); // signup only
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();

      if (!trimmedEmail) {
        setLoading(false);
        setError("Email is required.");
        return;
      }
      if (!password) {
        setLoading(false);
        setError("Password is required.");
        return;
      }
      if (!isLogin && !trimmedName) {
        setLoading(false);
        setError("Name is required.");
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        setLoading(false);
        if (error) return setError(error.message);

        router.push("/home");
        return;
      }

      // Signup
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: { data: { name: trimmedName } },
      });

      setLoading(false);
      if (error) return setError(error.message);

      router.push("/home");
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-2 text-center">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground text-balance">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isLogin
              ? "Sign in to continue where you left off."
              : "Start tracking your goals today."}
          </p>
        </header>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-foreground">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isLogin ? "Enter your password" : "Create a password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600 leading-relaxed">{error}</p>
          ) : null}

          <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
            {loading ? (isLogin ? "Signing in..." : "Creating...") : isLogin ? "Sign in" : "Sign up"}
          </Button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              {"Don't have an account? "}
              <Link
                href="/signup"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              {"Already have an account? "}
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
