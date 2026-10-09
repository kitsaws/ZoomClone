"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { User } from "@/types/meeting";
import { UserCheck, ShieldCheck } from "lucide-react";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" maxWidth="md">
      <div className="space-y-6 text-text-primary">
        {/* User Persona Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            <UserCheck className="h-4 w-4 text-zoom-blue" />
            <span>Active Account Persona</span>
          </div>

          <div className="p-3 bg-surface-subtle border border-app-border rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B1A2B] text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {(currentUser?.display_name?.[0] || "S").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">
                {currentUser?.display_name || "Swastik Nagpal"}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {currentUser?.email || "swastik@zoom.us"}
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Host
            </span>
          </div>
        </div>

        {/* App Info */}
        <div className="pt-3 border-t border-app-border flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Zoom Workplace v6.2.0</span>
          </div>
          <span className="text-[11px] text-text-muted">Desktop Client Build</span>
        </div>
      </div>
    </Modal>
  );
};
