"use client";

import React from "react";
import { User } from "@/types/meeting";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const DEMO_PERSONAS: (User & { roleDesc: string; roleVariant: "host" | "coHost" | "participant" })[] = [
  {
    id: "user-swastik-1",
    email: "swastik@zoom.test",
    display_name: "Swastik Nagpal",
    roleDesc: "Default Host (Primary Account)",
    roleVariant: "host",
    avatar_url: null,
  },
  {
    id: "user-alex-2",
    email: "alex@zoom.test",
    display_name: "Alex Chen",
    roleDesc: "Co-Host Persona",
    roleVariant: "coHost",
    avatar_url: null,
  },
  {
    id: "user-sarah-3",
    email: "sarah@zoom.test",
    display_name: "Sarah Miller",
    roleDesc: "Active Participant",
    roleVariant: "participant",
    avatar_url: null,
  },
  {
    id: "user-david-4",
    email: "david@zoom.test",
    display_name: "David Kumar",
    roleDesc: "Attendee Persona",
    roleVariant: "participant",
    avatar_url: null,
  },
];

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
  return (
    <div className={cn("bg-zoom-card-surface border border-zoom-border rounded-2xl p-5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-zoom-blue" />
          <span className="text-xs font-bold text-zoom-white tracking-wider uppercase">
            1-Click Demo Personas
          </span>
        </div>
        <span className="text-[11px] text-zoom-muted-text">Multi-device testing</span>
      </div>

      <p className="text-xs text-zoom-muted-text">
        Select any persona below to instantly switch your active account identity:
      </p>

      <div className="grid grid-cols-1 gap-2 pt-1">
        {DEMO_PERSONAS.map((persona) => {
          const isSelected = currentUserId === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => onSelectUser(persona)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                isSelected
                  ? "bg-zoom-blue/15 border-zoom-blue text-zoom-white ring-1 ring-zoom-blue/30"
                  : "bg-zoom-dark-surface/60 border-zoom-border/60 hover:border-zoom-border hover:bg-zoom-dark-surface text-zoom-subtle-text hover:text-zoom-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar name={persona.display_name} size="md" status={isSelected ? "online" : "offline"} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-zoom-white">
                      {persona.display_name}
                    </p>
                    <Badge variant={persona.roleVariant} size="sm">
                      {persona.roleVariant}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zoom-muted-text">{persona.email}</p>
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
