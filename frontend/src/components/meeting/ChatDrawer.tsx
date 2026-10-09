"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Users, Smile } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSelf: boolean;
}

export interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  className?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  className,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <aside
      className={cn(
        "w-80 sm:w-88 bg-[#1B1B26] border-l border-[#2C2C3E] flex flex-col justify-between shrink-0 z-30 select-none animate-in slide-in-from-right duration-200 shadow-2xl",
        className
      )}
    >
      {/* 1. Header */}
      <div className="p-3.5 border-b border-[#2C2C3E] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-zoom-blue" />
          <h3 className="text-xs font-bold text-zinc-100 tracking-tight">
            In-Meeting Chat
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[#2C2C3E] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close Chat Drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Recipient Selector Banner */}
      <div className="px-3.5 py-2 bg-[#161622] border-b border-[#2C2C3E]/60 flex items-center justify-between text-xs">
        <span className="text-zinc-400 text-[11px] font-medium">To:</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#232333] border border-[#36364A] text-zinc-200 text-[11px] font-semibold">
          <Users className="h-3 w-3 text-zoom-blue" />
          <span>Everyone</span>
        </div>
      </div>

      {/* 3. Message Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 select-text">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col space-y-1",
              msg.isSelf ? "items-end" : "items-start"
            )}
          >
            {/* Sender and Time info */}
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 px-1">
              <span className="font-semibold text-zinc-300">
                {msg.isSelf ? "You" : msg.sender}
              </span>
              <span>•</span>
              <span>{msg.time}</span>
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "rounded-2xl px-3.5 py-2 text-xs leading-relaxed max-w-[85%] break-words shadow-sm",
                msg.isSelf
                  ? "bg-zoom-blue text-white rounded-tr-none"
                  : "bg-[#232333] text-zinc-100 rounded-tl-none border border-[#36364A]"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Input Bar */}
      <div className="p-3 border-t border-[#2C2C3E] bg-[#161622]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Type message here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-[#232333] border border-[#36364A] rounded-xl pl-3 pr-8 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zoom-blue transition-colors"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!inputText.trim()}
            className="rounded-xl px-3 py-2 shrink-0 cursor-pointer disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </aside>
  );
};
