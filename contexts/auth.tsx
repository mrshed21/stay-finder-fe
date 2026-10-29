"use client";

import { getMe, login, logout } from "@/utils/authService";
import { createContext, useState, useEffect, useContext } from "react";
import type { PropsWithChildren } from "react";

type AuthContextState = {
  user: AuthUser | null;
  isPending: boolean;
  login: (email: string, password: string) => Promise<void | string>;
  logout: () => Promise<void | string>;
  refreshUser: () => Promise<AuthUser | null>;
};

const defaultState: AuthContextState = {
  user: null,
  isPending: true,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  refreshUser: () => Promise.resolve(null),
};

const AuthContext = createContext<AuthContextState>(defaultState);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<typeof defaultState.user>(null);
  const [isPending, setIsPending] = useState(defaultState.isPending)

  const _login: typeof defaultState.login = async (email, password) => {
    try {
        const authenticated = await login(email, password)
        if(!authenticated) {
            return "Invalid credentials"
        }
        const currentUser = await _getMe()
        if (!currentUser) return "Could not load your account"
        return

    } catch {
        return "Could not log in"
    }
  }

  const _getMe = async (): Promise<AuthUser | null> => {
    setIsPending(true)
    try {
        const currentUser = await getMe()
        setUser(currentUser)
        return currentUser
    } catch {
        setUser(null)
        return null
    } finally {
      setIsPending(false)
    }
  }

  const _logout: typeof defaultState.logout = async () => {
    try {
      if (!await logout()) return "Could not log out"
      setUser(null)
    } catch {
      return "Could not log out"
    }
  }

  useEffect(() => {
    _getMe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isPending,
        login: _login,
        logout: _logout,
        refreshUser: _getMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
    return useContext(AuthContext)
}

export {
    AuthProvider,
    useAuth
}
