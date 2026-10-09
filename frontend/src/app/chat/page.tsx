"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMeetings } from "@/hooks/useMeetings";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { UserSwitcherModal } from "@/components/modals/UserSwitcherModal";
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Video,
  Smile,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  CheckCheck,
  Calendar,
  Sparkles,
  ArrowLeft,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  senderName: string;
  senderEmail?: string;
  avatarText: string;
  content: string;
  timestamp: string;
  isSelf: boolean;
  reactions?: { emoji: string; count: number }[];
}

interface ChatChannel {
  id: string;
  name: string;
  type: "meeting" | "direct";
  meetingId?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastTime?: string;
  avatarText?: string;
  isOnline?: boolean;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingIdParam = searchParams.get("meetingId");

  const { currentUser, switchUser, logout } = useCurrentUser();
  const { upcomingMeetings, activeMeetings, recentMeetings } = useMeetings();

  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");

  // Combine meetings that have chat enabled
  const allMeetings = [...activeMeetings, ...upcomingMeetings, ...recentMeetings];
  const chatMeetings = allMeetings.filter((m) => m.allow_chat_before_after !== false);

  // Channels state
  const [channels, setChannels] = useState<ChatChannel[]>([
    {
      id: "general",
      name: "Engineering & Architecture",
      type: "meeting",
      lastMessage: "Let's review the WebRTC signaling and LiveKit fallback.",
      lastTime: "12:15 PM",
      unreadCount: 1,
    },
    {
      id: "dm-alex",
      name: "Alex Chen",
      type: "direct",
      lastMessage: "I'll join the Sprint 24 sync in 5 minutes!",
      lastTime: "11:45 AM",
      avatarText: "A",
      isOnline: true,
    },
    {
      id: "dm-sarah",
      name: "Sarah Jenkins",
      type: "direct",
      lastMessage: "Please check the PR for the new Schedule modal.",
      lastTime: "10:30 AM",
      avatarText: "S",
      isOnline: true,
    },
    {
      id: "dm-david",
      name: "David Miller",
      type: "direct",
      lastMessage: "Looks great, verified on dark mode.",
      lastTime: "Yesterday",
      avatarText: "D",
      isOnline: false,
    },
  ]);

  const [activeChannelId, setActiveChannelId] = useState<string>("general");
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({
    general: [
      {
        id: "m1",
        senderName: "Sarah Jenkins",
        avatarText: "S",
        content: "Hey team! Starting our architecture sync thread here.",
        timestamp: "12:10 PM",
        isSelf: false,
        reactions: [{ emoji: "👍", count: 3 }],
      },
      {
        id: "m2",
        senderName: "Alex Chen",
        avatarText: "A",
        content: "Let's review the WebRTC signaling and LiveKit fallback.",
        timestamp: "12:15 PM",
        isSelf: false,
        reactions: [{ emoji: "🚀", count: 2 }],
      },
    ],
  });

  // Sync meeting channels when meetings load or when meetingId is passed in URL
  useEffect(() => {
    if (chatMeetings.length > 0) {
      const meetingChannels: ChatChannel[] = chatMeetings.map((m) => ({
        id: `meeting-${m.id}`,
        name: m.topic || m.title || "Meeting Chat",
        type: "meeting" as const,
        meetingId: m.id,
        lastMessage: "Persistent meeting chat is active.",
        lastTime: "Today",
      }));

      setChannels((prev) => {
        const existingDms = prev.filter((c) => c.type === "direct");
        const existingGeneral = prev.filter((c) => c.id === "general");
        return [...existingGeneral, ...meetingChannels, ...existingDms];
      });

      if (meetingIdParam) {
        const targetChannelId = `meeting-${meetingIdParam}`;
        setActiveChannelId(targetChannelId);

        // Prepopulate empty message thread if new
        setMessagesMap((prev) => {
          if (!prev[targetChannelId]) {
            return {
              ...prev,
              [targetChannelId]: [
                {
                  id: "init-1",
                  senderName: "System",
                  avatarText: "Z",
                  content: "Welcome to the meeting chat! Messages sent here will be preserved before, during, and after the meeting.",
                  timestamp: "Just now",
                  isSelf: false,
                },
              ],
            };
          }
          return prev;
        });
      }
    }
  }, [chatMeetings.length, meetingIdParam]);

  const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const activeMessages = messagesMap[activeChannelId] || [];

  const handleSendMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: currentUser?.display_name || "You",
      avatarText: (currentUser?.display_name?.[0] || "U").toUpperCase(),
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMessage],
    }));

    // Update last message in channels list
    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId
          ? { ...c, lastMessage: trimmed, lastTime: "Just now" }
          : c
      )
    );

    setMessageInput("");
  };

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-row antialiased select-none">
      {/* 1. Left Vertical Sidebar Navigation */}
      <SidebarNav
        currentUser={currentUser}
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
        activeNav="chat"
      />

      {/* 2. Main Chat Workspace */}
      <div className="flex-1 flex flex-row overflow-hidden max-h-screen">
        {/* Left Column: Channels & Direct Messages List */}
        <div className="w-72 sm:w-80 bg-surface border-r border-app-border flex flex-col shrink-0">
          {/* Top Header */}
          <div className="p-4 border-b border-app-border/80 flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-zoom-blue" />
              <span>Team Chat</span>
            </h2>
            <button
              type="button"
              onClick={() => alert("Start a new direct message or group conversation.")}
              className="p-1.5 rounded-xl hover:bg-surface-subtle text-text-muted hover:text-zoom-blue transition-colors cursor-pointer"
              title="New Chat"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-app-border/60">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search chats, meetings, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-subtle border border-app-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-zoom-blue"
              />
            </div>
          </div>

          {/* Scrollable Channels & DMs List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
            {/* Meeting Chats Section */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2 block">
                Meeting Chats
              </span>
              {filteredChannels
                .filter((c) => c.type === "meeting")
                .map((ch) => {
                  const isActive = ch.id === activeChannelId;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setActiveChannelId(ch.id)}
                      className={cn(
                        "w-full px-2.5 py-2 rounded-xl text-left flex items-start gap-2.5 transition-all cursor-pointer",
                        isActive
                          ? "bg-zoom-blue/10 border border-zoom-blue/30 text-zoom-blue font-bold shadow-sm"
                          : "hover:bg-surface-subtle text-text-primary"
                      )}
                    >
                      <div className="w-7 h-7 rounded-lg bg-zoom-blue/20 text-zoom-blue flex items-center justify-center shrink-0 mt-0.5">
                        <Video className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-xs font-semibold">{ch.name}</span>
                          <span className="text-[10px] text-text-muted">{ch.lastTime}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary truncate mt-0.5">
                          {ch.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Direct Messages Section */}
            <div className="space-y-1 pt-2 border-t border-app-border/40">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2 block">
                Direct Messages
              </span>
              {filteredChannels
                .filter((c) => c.type === "direct")
                .map((ch) => {
                  const isActive = ch.id === activeChannelId;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setActiveChannelId(ch.id)}
                      className={cn(
                        "w-full px-2.5 py-2 rounded-xl text-left flex items-start gap-2.5 transition-all cursor-pointer",
                        isActive
                          ? "bg-zoom-blue/10 border border-zoom-blue/30 text-zoom-blue font-bold shadow-sm"
                          : "hover:bg-surface-subtle text-text-primary"
                      )}
                    >
                      <div className="relative">
                        <div className="w-7 h-7 rounded-lg bg-[#8B1A2B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {ch.avatarText}
                        </div>
                        {ch.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-xs font-semibold">{ch.name}</span>
                          <span className="text-[10px] text-text-muted">{ch.lastTime}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary truncate mt-0.5">
                          {ch.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Conversation Pane */}
        <div className="flex-1 flex flex-col bg-surface-subtle/20 justify-between overflow-hidden">
          {/* Active Chat Top Bar */}
          <div className="px-6 py-3.5 bg-surface border-b border-app-border flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle sm:hidden cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
                  <span>{currentChannel?.name}</span>
                  {currentChannel?.type === "meeting" && (
                    <span className="bg-zoom-blue/10 text-zoom-blue text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Persistent Meeting Chat
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-text-muted">
                  {currentChannel?.type === "meeting"
                    ? "Available before, during, and after meeting"
                    : "Direct encrypted message"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {currentChannel?.meetingId && (
                <button
                  type="button"
                  onClick={() => router.push(`/meeting/${currentChannel.meetingId}`)}
                  className="bg-zoom-blue hover:bg-zoom-blue-hover text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Join Meeting</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => alert("Conversation Details")}
                className="p-2 rounded-xl hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="More Details"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3 max-w-xl",
                  msg.isSelf ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {/* Sender Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm",
                    msg.isSelf ? "bg-zoom-blue" : "bg-[#8B1A2B]"
                  )}
                >
                  {msg.avatarText}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div
                    className={cn(
                      "flex items-center gap-2 text-[11px]",
                      msg.isSelf ? "justify-end" : "justify-start"
                    )}
                  >
                    <span className="font-bold text-text-primary">{msg.senderName}</span>
                    <span className="text-text-muted">{msg.timestamp}</span>
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl p-3 text-xs shadow-sm leading-relaxed",
                      msg.isSelf
                        ? "bg-zoom-blue text-white rounded-tr-none"
                        : "bg-surface border border-app-border text-text-primary rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Reactions */}
                  {msg.reactions && (
                    <div
                      className={cn(
                        "flex items-center gap-1 pt-0.5",
                        msg.isSelf ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.reactions.map((r, i) => (
                        <span
                          key={i}
                          className="bg-surface border border-app-border rounded-full px-2 py-0.5 text-[10px] font-semibold text-text-secondary flex items-center gap-1 shadow-sm"
                        >
                          <span>{r.emoji}</span>
                          <span>{r.count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Message Composer */}
          <div className="p-4 bg-surface border-t border-app-border">
            <div className="bg-surface-subtle border border-app-border rounded-2xl p-2.5 space-y-2 shadow-inner">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Message #${currentChannel?.name || "chat"}...`}
                className="w-full bg-transparent text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none px-1"
              />

              <div className="flex items-center justify-between pt-1 text-text-muted border-t border-app-border/40">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMessageInput((prev) => `${prev} 👍`)}
                    className="p-1 rounded-lg hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
                    title="Add Emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Attach file")}
                    className="p-1 rounded-lg hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
                    title="Attach File"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Send screenshot or image")}
                    className="p-1 rounded-lg hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
                    title="Upload Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-zoom-blue hover:bg-zoom-blue-hover text-white p-1.5 rounded-xl disabled:opacity-40 transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Switcher Modal */}
      <UserSwitcherModal
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        currentUser={currentUser}
        onSelectUser={switchUser}
        onSignOut={logout}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Loading Team Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
