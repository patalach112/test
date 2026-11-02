"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";

type Account = { id: string; username: string };
export function AccountMenu() {
  const router = useRouter();
  const [user, setUser] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  async function logout() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      setUser(null);
      setOpen(false);
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Could not sign out. Try again.");
      setLoading(false);
    }
  }
  if (!user)
    return (
      <div className="auth-header-links">
        <Link href="/login">Sign in</Link>
        <Link className="button" href="/signup">
          Sign up
        </Link>
      </div>
    );
  return (
    <div className="dropdown-host account-menu">
      <button
        className="account-avatar"
        onClick={() => setOpen(!open)}
        aria-label="Your account"
        aria-expanded={open}
      >
        {user.username.slice(0, 1).toUpperCase()}
      </button>
      {open && (
        <>
          <button
            className="account-dismiss"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
          />
          <div className="dropdown right">
            <div className="account-info">
              <span>Signed in as</span>
              <strong>{user.username}</strong>
            </div>
            <Link className="menu-item" href="/">
              <UserRound size={16} />
              Your workspace
            </Link>
            <button className="menu-item" disabled={loading} onClick={logout}>
              <LogOut size={16} />
              {loading ? "Signing out…" : "Sign out"}
            </button>
            {error && (
              <p className="muted" role="alert">
                {error}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
