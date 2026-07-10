"use client";

import { Loader2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthStatus =
  | { type: "idle"; message?: string }
  | { type: "loading"; message?: string }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

export function AccountClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [status, setStatus] = useState<AuthStatus>({ type: "idle" });

  useEffect(() => {
    try {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    } catch {
      queueMicrotask(() => {
        setStatus({ type: "error", message: "Supabase Auth is not configured for this environment yet." });
      });
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading" });

    try {
      const supabase = createSupabaseBrowserClient();
      const action =
        mode === "sign-in"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password });

      const { data, error } = await action;

      if (error) {
        setStatus({ type: "error", message: error.message });
        return;
      }

      setUserEmail(data.user?.email ?? email);
      setStatus({
        type: "success",
        message: mode === "sign-in" ? "You are signed in." : "Account created. Check your inbox if email confirmation is enabled."
      });
    } catch {
      setStatus({ type: "error", message: "Unable to reach Supabase Auth right now." });
    }
  }

  async function handleSignOut() {
    setStatus({ type: "loading" });
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUserEmail(null);
    setStatus({ type: "idle" });
  }

  if (userEmail) {
    return (
      <div className="w-full max-w-md rounded-[35px] border border-gold/20 p-8">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">Client account</p>
        <h1 className="font-display text-5xl">Welcome back.</h1>
        <p className="mt-5 text-sm leading-7 text-ivory/68">{userEmail}</p>
        {status.type === "success" ? <p className="mt-4 text-sm text-gold-soft">{status.message}</p> : null}
        <button
          type="button"
          onClick={handleSignOut}
          className="gold-focus mt-8 inline-flex min-h-12 w-full items-center justify-center gap-3 bg-gold px-5 text-xs font-bold uppercase tracking-[0] text-obsidian"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-[35px] border border-gold/20 p-8">
      <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">Client account</p>
      <h1 className="font-display text-5xl">Welcome back.</h1>
      <div className="mt-8 grid grid-cols-2 rounded-full border border-ivory/10 p-1 text-xs font-bold uppercase tracking-[0]">
        {[
          ["sign-in", "Sign in"],
          ["sign-up", "Create account"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value as "sign-in" | "sign-up")}
            className={`gold-focus rounded-full px-3 py-2 transition ${mode === value ? "bg-gold text-obsidian" : "text-ivory/58 hover:text-gold-soft"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0] text-ivory/70">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            className="gold-focus min-h-12 border border-ivory/10 bg-ivory/5 px-4 text-base font-normal normal-case text-ivory"
          />
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0] text-ivory/70">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            minLength={6}
            className="gold-focus min-h-12 border border-ivory/10 bg-ivory/5 px-4 text-base font-normal normal-case text-ivory"
          />
        </label>
        {status.type === "error" ? <p className="text-sm text-red-300">{status.message}</p> : null}
        {status.type === "success" ? <p className="text-sm text-gold-soft">{status.message}</p> : null}
        <button
          disabled={status.type === "loading"}
          className="gold-focus inline-flex min-h-12 items-center justify-center gap-3 bg-gold px-5 text-xs font-bold uppercase tracking-[0] text-obsidian disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
