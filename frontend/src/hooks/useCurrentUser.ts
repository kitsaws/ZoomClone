"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/types/meeting";
import { api } from "@/services/api";

const STORAGE_KEY = "zoom_current_user";

// Fallback demo user
export const DEFAULT_DEMO_USER: User = {
  id: "user-swastik-1",
  email: "swastik@zoom.test",
  display_name: "Swastik Nagpal",
  avatar_url: null,
  pmi: "591 793 6498",
};

// Module-level in-memory cache to prevent duplicate /users network requests
let cachedDbUsers: User[] | null = null;
let dbUsersPromise: Promise<User[]> | null = null;

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function useCurrentUser() {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getStoredUser() || DEFAULT_DEMO_USER);
  const [isLoading, setIsLoading] = useState(() => !getStoredUser());

  useEffect(() => {
    let isMounted = true;

    async function initUser() {
      try {
        const candidateUser = getStoredUser();

        let dbUsers: User[] = [];
        if (cachedDbUsers) {
          dbUsers = cachedDbUsers;
        } else {
          if (!dbUsersPromise) {
            dbUsersPromise = api.getUsers().then((res) => {
              cachedDbUsers = res;
              return res;
            });
          }
          dbUsers = await dbUsersPromise;
        }

        if (!isMounted) return;

        if (dbUsers && dbUsers.length > 0) {
          const matched = candidateUser
            ? dbUsers.find((u) => u.id === candidateUser.id || u.email === candidateUser.email)
            : null;

          const activeUser = matched || dbUsers[0];
          setCurrentUserState(activeUser);
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(activeUser));
          }
        } else if (candidateUser) {
          setCurrentUserState(candidateUser);
        } else {
          setCurrentUserState(DEFAULT_DEMO_USER);
        }
      } catch (err) {
        if (isMounted) {
          const fallback = getStoredUser() || DEFAULT_DEMO_USER;
          setCurrentUserState(fallback);
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
