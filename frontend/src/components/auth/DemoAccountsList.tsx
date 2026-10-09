"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types/meeting";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Check, Sparkles } from "lucide-react";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

export interface DemoAccountsListProps {
  currentUserId?: string;
  onSelectUser: (user: User) => void;
  className?: string;
}

export const DemoAccountsList: React.FC<DemoAccountsListProps> = ({
  currentUserId,
  onSelectUser,
  className,
}) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.getUsers().then((res) => {
      if (res && res.length > 0) {
        setUsers(res);
      }
    }).catch((err) => {
      console.warn("Failed to load demo accounts from API:", err);
    });
  }, []);

  return (
    <div className={cn("bg-surface border border-app-border rounded-2xl p-5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-zoom-blue" />
          <span className="text-xs font-bold text-text-primary tracking-wider uppercase">
            1-Click Demo Personas
          </span>
        </div>
        <span className="text-[11px] text-text-muted">Multi-device testing</span>
      </div>

      <p className="text-xs text-text-muted">
        Select any persona below to instantly switch your active account identity:
      </p>

      <div className="grid grid-cols-1 gap-2 pt-1">
        {users.map((persona, index) => {
          const isSelected = currentUserId === persona.id;
          const roleTag = index === 0 ? "host" : index === 1 ? "coHost" : "participant";

          return (
            <button
              key={persona.id}
              onClick={() => onSelectUser(persona)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                isSelected
                  ? "bg-zoom-blue/15 border-zoom-blue text-text-primary ring-1 ring-zoom-blue/30"
                  : "bg-surface-subtle border-app-border hover:border-zoom-blue/50 hover:bg-surface-hover text-text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar name={persona.display_name} size="md" status={isSelected ? "online" : "offline"} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-text-primary">
                      {persona.display_name}
                    </p>
                    <Badge variant={roleTag as any} size="sm">
                      {roleTag}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-muted">{persona.email}</p>
                </div>
              </div>

              {isSelected && (
                <div className="bg-zoom-blue text-white rounded-full p-1 shadow-sm">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
