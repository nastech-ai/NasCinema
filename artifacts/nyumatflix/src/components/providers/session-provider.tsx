
// SessionProvider replaced with custom;
import { ReactNode } from "react";

interface AuthSessionProviderProps {
  children: ReactNode;
}

export const AuthSessionProvider = ({ children }: AuthSessionProviderProps) => {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </SessionProvider>
  );
};
