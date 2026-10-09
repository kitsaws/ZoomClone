"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/types/meeting";
import { api } from "@/services/api";

const STORAGE_KEY = "zoom_current_user";

// Fallback demo user if API hasn't loaded yet
export const DEFAULT_DEMO_USER: User = {
  id: "user-swastik-1",
  email: "swastik@zoom.test",
  display_name: "Swastik Nagpal",
  avatar_url: null,
  pmi: "591 793 6498",
};

export function useCurrentUser() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage and validate with backend users
  useEffect(() => {
    let isMounted = true;

    async function initUser() {
      try {
        const storedStr = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        let candidateUser: User | null = null;
        if (storedStr) {
          try {
            candidateUser = JSON.parse(storedStr);
          } catch {}
        }

        // Fetch valid users from backend DB
        const dbUsers = await api.getUsers();
        if (!isMounted) return;

        if (dbUsers && dbUsers.length > 0) {
          // If candidate user matches an existing DB user by email or id, use it
          let matched = candidateUser
            ? dbUsers.find((u) => u.id === candidateUser?.id || u.email === candidateUser?.email)
            : null;

          const activeUser = matched || dbUsers[0];
          setCurrentUserState(activeUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(activeUser));
        } else if (candidateUser) {
          setCurrentUserState(candidateUser);
        } else {
          setCurrentUserState(DEFAULT_DEMO_USER);
        }
      } catch (err) {
        if (isMounted) {
          setCurrentUserState(DEFAULT_DEMO_USER);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const switchUser = useCallback((user: User) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save user to localStorage", e);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUserState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to remove user from localStorage", e);
    }
  }, []);

  return {
    currentUser,
    isLoading,
    switchUser,
    logout,
    isGuest: !currentUser,
  };
}
