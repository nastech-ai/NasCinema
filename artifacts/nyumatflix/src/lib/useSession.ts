import { useState, useEffect } from "react";
import { fetchSession, getSession, subscribeToSession, type SessionState } from "./auth-client";

let initialized = false;

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>(getSession);

  useEffect(() => {
    const unsub = subscribeToSession(setState);
    if (!initialized) {
      initialized = true;
      fetchSession();
    }
    return unsub;
  }, []);

  return state;
}
