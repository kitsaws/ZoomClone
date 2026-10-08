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
};

export function useCurrentUser() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage or fallback
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCurrentUserState(JSON.parse(stored));
      } else {
        // Fetch default host or assign default demo user
        api.getUsers().then((users) => {
          if (users && users.length > 0) {
            const defaultUser = users[0];
            setCurrentUserState(defaultUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
          } else {
            setCurrentUserState(DEFAULT_DEMO_USER);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_USER));
          }
        }).catch(() => {
          setCurrentUserState(DEFAULT_DEMO_USER);
        });
      }
    } catch {
      setCurrentUserState(DEFAULT_DEMO_USER);
    } finally {
      setIsLoading(false);
    }
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
