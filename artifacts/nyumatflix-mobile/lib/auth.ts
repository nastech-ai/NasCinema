import { apiJson } from "./api";

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
let listeners: Array<(s: SessionState) => void> = [];

function notify(state: SessionState) {
  cachedSession = state;
  listeners.forEach((fn) => fn(state));
}

export async function fetchSession(): Promise<SessionState> {
  try {
    const data = await apiJson<{ session: Session | null }>("/api/auth/session");
    const state: SessionState = {
      data: data.session || null,
      status: data.session ? "authenticated" : "unauthenticated",
    };
    notify(state);
    return state;
  } catch {
    const state: SessionState = { data: null, status: "unauthenticated" };
    notify(state);
    return state;
  }
}

export function getSession(): SessionState {
  return cachedSession ?? { data: null, status: "loading" };
}

export function subscribe(fn: (s: SessionState) => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
}

export async function sendMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : ""}/api/auth/magic-link`, {
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

export async function signOut(): Promise<void> {
  try {
    await apiJson("/api/auth/signout", { method: "POST" });
    notify({ data: null, status: "unauthenticated" });
  } catch {}
}
