"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GitBranch,
  LoaderCircle,
} from "lucide-react";

type Mode = "login" | "signup" | "reset";

export function AuthForm({
  mode,
  configured,
}: {
  mode: Mode;
  configured: boolean;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const signup = mode === "signup";
  const reset = mode === "reset";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !configured) return;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/auth/${signup ? "register" : reset ? "reset" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(form)),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Something went wrong. Please try again.");
        return;
      }
      if (reset || result.requiresVerification) {
        setSuccess(
          reset
            ? "If an account exists with this email, you’ll receive a password reset link."
            : "Check your email to verify your account before signing in.",
        );
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to connect. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <main className={`auth-page ${signup ? "signup-page" : ""}`}>
      {signup && (
        <aside className="signup-story">
          <Link href="/" className="forge-wordmark">
            <GitBranch size={28} />
            Forge
          </Link>
          <div>
            <span className="eyebrow">YOUR NEXT GREAT IDEA STARTS HERE</span>
            <h1>
              Build together.
              <br />
              Make something
              <br />
              <span>that matters.</span>
            </h1>
            <p>
              A home for your code, your projects, and the people who make them
              possible.
            </p>
            <ul>
              <li>
                <CheckCircle2 size={18} />
                Host and manage your repositories
              </li>
              <li>
                <CheckCircle2 size={18} />
                Collaborate through issues and pull requests
              </li>
              <li>
                <CheckCircle2 size={18} />
                Keep your work in one place
              </li>
            </ul>
          </div>
          <small>Your code. Your community. Your server.</small>
        </aside>
      )}
      <div className="auth-main">
        <div className="auth-topline">
          <Link href="/" className="auth-back">
            ← Back to repository
          </Link>
          <span>
            {signup ? "Already have an account?" : "New here?"}{" "}
            <Link href={signup ? "/login" : "/signup"}>
              {signup ? "Sign in" : "Create an account"}
              <ArrowRight size={14} />
            </Link>
          </span>
        </div>
        <div className="auth-content">
          <Link href="/" className="auth-logo" aria-label="Forge home">
            <GitBranch size={34} />
          </Link>
          <h1>
            {signup
              ? "Create your account"
              : reset
                ? "Reset your password"
                : "Sign in to Forge"}
          </h1>
          <p className="auth-subtitle">
            {signup
              ? "Your code deserves a home."
              : reset
                ? "We’ll email you a link to reset your password."
                : "Welcome back. Let’s build something."}
          </p>
          <div className="instance-label">
            <span />
            Independent GitHub-style workspace · not GitHub.com
          </div>
          {!configured && (
            <div className="auth-notice">
              <AlertCircle size={17} />
              <div>
                <strong>Authentication is not connected</strong>
                <p>
                  This is your self-hosted workspace. Connect your server to
                  enable accounts. Do not enter GitHub credentials here.
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="auth-error" role="alert">
              <AlertCircle size={18} />
              {error}
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
          {success ? (
            <div className="auth-success" role="status">
              <CheckCircle2 size={24} />
              <p>{success}</p>
              <Link href="/login">Return to sign in</Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={submit}>
              {signup && (
                <>
                  <label htmlFor="email">
                    Email <span>*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    maxLength={254}
                    disabled={!configured || pending}
                  />
                  <label htmlFor="username">
                    Username <span>*</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    autoComplete="username"
                    placeholder="Choose a username"
                    required
                    maxLength={39}
                    pattern="[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?"
                    disabled={!configured || pending}
                  />
                  <p className="field-hint">
                    Letters, numbers, and hyphens only.
                  </p>
                </>
              )}
              {!signup && (
                <>
                  <label htmlFor="login">
                    {reset ? "Email address" : "Username or email address"}
                  </label>
                  <input
                    id="login"
                    name={reset ? "email" : "login"}
                    type={reset ? "email" : "text"}
                    autoComplete={reset ? "email" : "username"}
                    required
                    maxLength={254}
                    disabled={!configured || pending}
                  />
                </>
              )}
              {!reset && (
                <>
                  <div className="password-label">
                    <label htmlFor="password">
                      Password {signup && <span>*</span>}
                    </label>
                    {!signup && (
                      <Link href="/password-reset">Forgot password?</Link>
                    )}
                  </div>
                  <div className="password-field">
                    <input
                      id="password"
                      name="password"
                      type={visible ? "text" : "password"}
                      autoComplete={
                        signup ? "new-password" : "current-password"
                      }
                      minLength={signup ? 12 : 1}
                      maxLength={128}
                      required
                      disabled={!configured || pending}
                    />
                    <button
                      type="button"
                      onClick={() => setVisible(!visible)}
                      aria-label={visible ? "Hide password" : "Show password"}
                    >
                      {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {signup && (
                    <p className="field-hint">
                      Use at least 12 characters for a strong password.
                    </p>
                  )}
                </>
              )}
              <button
                className="auth-submit"
                type="submit"
                disabled={!configured || pending}
              >
                {pending ? (
                  <>
                    <LoaderCircle className="spin" size={16} />
                    Please wait…
                  </>
                ) : signup ? (
                  <>
                    Create account
                    <ArrowRight size={16} />
                  </>
                ) : reset ? (
                  "Send password reset email"
                ) : (
                  "Sign in"
                )}
              </button>
              <p className="auth-form-note">
                {configured
                  ? "Your credentials are sent securely to this workspace’s server."
                  : "Sign-in will be available after the server is configured."}
              </p>
            </form>
          )}
          {!signup && !reset && (
            <div className="auth-create">
              New to Forge? <Link href="/signup">Create an account</Link>
            </div>
          )}
          <p className="auth-bottom-note">
            This workspace uses its own accounts.
            <br />
            It is not affiliated with GitHub and does not sign you into GitHub.
          </p>
        </div>
        <div className="auth-footer">
          <span>Forge · Your development workspace</span>
          <Link href="/">Repository</Link>
          <a href="https://docs.github.com" target="_blank" rel="noreferrer">
            Git documentation ↗
          </a>
        </div>
      </div>
    </main>
  );
}
