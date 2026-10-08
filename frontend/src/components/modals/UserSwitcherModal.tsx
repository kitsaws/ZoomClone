"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DemoAccountsList } from "@/components/auth/DemoAccountsList";
import { User } from "@/types/meeting";
import { LogOut } from "lucide-react";

export interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSelectUser: (user: User) => void;
  onSignOut: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onSignOut,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Account Persona"
      description="Quickly test multi-device and host/participant interactions."
      maxWidth="md"
      footer={
        <div className="w-full flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="text-zoom-danger hover:bg-zoom-danger/10 border-zoom-danger/30"
            leftIcon={<LogOut className="h-3.5 w-3.5" />}
          >
            Sign Out (Become Guest)
          </Button>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <DemoAccountsList
        currentUserId={currentUser?.id}
        onSelectUser={(user) => {
          onSelectUser(user);
          onClose();
        }}
      />
    </Modal>
  );
};
