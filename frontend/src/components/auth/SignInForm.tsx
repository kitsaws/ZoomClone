"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, ArrowRight, Info, Video, UserCheck } from "lucide-react";
import { User } from "@/types/meeting";
import { api } from "@/services/api";

export interface SignInFormProps {
  onSuccess: (user: User) => void;
  onJoinAsGuest: () => void;
  className?: string;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSuccess,
  onJoinAsGuest,
  className,
}) => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      // Find existing user by email or create mock profile
      const users = await api.getUsers();
      const existing = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existing) {
        onSuccess(existing);
      } else {
        // Construct new persona session
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: email.trim(),
          display_name: displayName.trim() || email.split("@")[0],
          avatar_url: null,
        };
        onSuccess(newUser);
      }
    } catch {
      // Offline / fallback fallback
      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        email: email.trim(),
        display_name: displayName.trim() || email.split("@")[0],
        avatar_url: null,
      };
      onSuccess(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          error={error || undefined}
          required
        />

        <Input
          label="Display Name (Optional)"
          type="text"
          placeholder="Your full name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          leftIcon={<UserCheck className="h-4 w-4" />}
          helperText="Appears on your video tile in meetings"
        />

        {/* Notice of simulated authentication */}
        <div className="bg-zoom-blue/10 border border-zoom-blue/20 rounded-xl p-3 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-zoom-blue shrink-0 mt-0.5" />
          <p className="text-xs text-zoom-subtle-text leading-relaxed">
            <strong className="text-zoom-white font-medium">Demo Mode:</strong> Multi-device testing is enabled. No password required — simply enter an email to sign in or use the 1-click accounts below.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Guest join fallback option */}
      <div className="mt-6 pt-6 border-t border-zoom-border/60 text-center space-y-3">
        <p className="text-xs text-zoom-muted-text">Don&apos;t have an account or joining as an external attendee?</p>
        <Button
          type="button"
          variant="outline"
          size="md"
          className="w-full"
          onClick={onJoinAsGuest}
          leftIcon={<Video className="h-4 w-4 text-zoom-blue" />}
        >
          Join a Meeting as Guest
        </Button>
      </div>
    </div>
  );
};
