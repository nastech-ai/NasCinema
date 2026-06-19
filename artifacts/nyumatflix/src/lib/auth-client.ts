import { getApiBase } from "./api";

export interface Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires?: string;
}

export interface SessionState {
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

let cachedSession: SessionState | null = null;
let sessionListeners: Array<(state: SessionState) => void> = [];

function notifyListeners(state: SessionState) {
  sessionListeners.forEach((fn) => fn(state));
}

export async function fetchSession(): Promise<SessionState> {
  try {
    const res = await fetch(`${getApiBase()}/api/auth/session`, {
      credentials: "include",
    });
    if (!res.ok) {
      const state: SessionState = { data: null, status: "unauthenticated" };
      cachedSession = state;
      notifyListeners(state);
      return state;
    }
    const data = await res.json();
    const state: SessionState = {
      data: data.session || null,
      status: data.session ? "authenticated" : "unauthenticated",
    };
    cachedSession = state;
    notifyListeners(state);
    return state;
  } catch {
    const state: SessionState = { data: null, status: "unauthenticated" };
    cachedSession = state;
    notifyListeners(state);
    return state;
  }
}

export function getSession(): SessionState {
  if (cachedSession) return cachedSession;
  return { data: null, status: "loading" };
}

export function subscribeToSession(fn: (state: SessionState) => void) {
  sessionListeners.push(fn);
  return () => {
    sessionListeners = sessionListeners.filter((l) => l !== fn);
  };
}

export function useSession(): SessionState {
  if (typeof window === "undefined") {
    return { data: null, status: "loading" };
  }
  return cachedSession ?? { data: null, status: "loading" };
}

export async function signOut(): Promise<void> {
  try {
    await fetch(`${getApiBase()}/api/auth/signout`, {
      method: "POST",
      credentials: "include",
    });
    cachedSession = { data: null, status: "unauthenticated" };
    notifyListeners(cachedSession);
    window.location.href = "/";
  } catch (e) {
    console.error("Sign out error:", e);
  }
}

export async function sendMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${getApiBase()}/api/auth/magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Failed to send magic link" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function verifyMagicLink(token: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${getApiBase()}/api/auth/verify?token=${encodeURIComponent(token)}`, {
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Verification failed" };
    await fetchSession();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
