"use client";

import * as React from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  firebaseWebConfigured,
} from "../lib/firebase";
import type { AppUserProfile } from "../lib/types";
import { subscribeToAuthSession } from "../lib/repository";

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  profile: AppUserProfile | null;
};

const AuthContext = React.createContext<AuthContextValue>({
  configured: firebaseWebConfigured,
  loading: firebaseWebConfigured,
  user: null,
  profile: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = React.useState<AuthContextValue>({
    configured: firebaseWebConfigured,
    loading: firebaseWebConfigured,
    user: null,
    profile: null,
  });

  React.useEffect(() => {
    if (!firebaseWebConfigured) {
      setState({
        configured: false,
        loading: false,
        user: null,
        profile: null,
      });
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    subscribeToAuthSession((session) => {
      if (!mounted) return;
      setState({
        configured: true,
        loading: session.loading,
        user: session.user,
        profile: session.profile,
      });
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  return React.useContext(AuthContext);
}
