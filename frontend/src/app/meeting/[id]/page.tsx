"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMeetingRoom } from "@/hooks/useMeetingRoom";
import { MeetingHeader } from "@/components/meeting/MeetingHeader";
import { VideoStage } from "@/components/meeting/VideoStage";
import { ControlBar } from "@/components/meeting/ControlBar";
import { ParticipantsDrawer } from "@/components/meeting/ParticipantsDrawer";
import { ChatDrawer } from "@/components/meeting/ChatDrawer";
import { HostToolsDrawer } from "@/components/meeting/HostToolsDrawer";
import { LeaveMeetingModal } from "@/components/meeting/LeaveMeetingModal";
import { MeetingEndedModal } from "@/components/meeting/MeetingEndedModal";
import { MeetingLobbyModal } from "@/components/meeting/MeetingLobbyModal";
import { Button } from "@/components/ui/Button";
import { Sparkles, X, ArrowLeft } from "lucide-react";
import { api } from "@/services/api";
import { Meeting, User } from "@/types/meeting";

interface MeetingRoomProps {
  params: Promise<{ id: string }>;
}

interface ActiveRoomProps {
  meetingId: string;
  currentUser: User | null;
  initialName?: string;
  initialAudioMuted: boolean;
  initialVideoOff: boolean;
  passcode?: string;
}

function MeetingRoomContent({
  meetingId,
  currentUser,
  initialName,
  initialAudioMuted,
  initialVideoOff,
  passcode,
}: ActiveRoomProps) {
  const router = useRouter();

  const {
    meeting,
    participants,
    localParticipant,
    isLoading,
    error,
    isHost,
    localVideoTrack,
    remoteVideoTracks,
    speakingParticipantIds,
    isMeetingEndedByHost,
    activeReactions,
    sendReaction,
    isScreenSharing,
    toggleScreenShare,
    isMuted,
    isVideoOff,
    isHandRaised,
    toggleMic,
    toggleVideo,
    toggleHand,
    viewMode,
    setViewMode,
    activeDrawer,
    setActiveDrawer,
    isInfoPopoverOpen,
    setIsInfoPopoverOpen,
    isLeaveModalOpen,
    setIsLeaveModalOpen,
    elapsedSeconds,
    chatMessages,
    sendMessage,
    muteAll,
    leaveMeeting,
    endMeetingForAll,
  } = useMeetingRoom({
    meetingId,
    currentUser,
    initialName,
    initialAudioMuted,
    initialVideoOff,
    passcode,
  });

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4 select-none">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-zoom-blue animate-pulse flex items-center justify-center shadow-[0_0_30px_rgba(45,140,255,0.5)]">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-zinc-100">
            Connecting to Zoom Meeting...
          </p>
          <p className="text-xs text-zinc-400">
            Establishing encrypted media connection
          </p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-[#111119] text-zinc-100 flex flex-col items-center justify-center p-6 space-y-6 select-none">
        <div className="bg-[#1B1B26] border border-[#2C2C3E] rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="h-14 w-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <X className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold">Unable to Join Meeting</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {error || "Meeting does not exist or may have already concluded."}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push("/")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="w-full rounded-xl py-2.5 text-xs font-semibold"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Filter remote participants
  const remoteParticipants = participants.filter((p) => p.id !== localParticipant?.id);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden select-none font-sans">
      {/* Top Header Bar */}
      <MeetingHeader
        meeting={meeting}
        localParticipant={localParticipant}
        isHost={isHost}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        elapsedSeconds={elapsedSeconds}
        isInfoPopoverOpen={isInfoPopoverOpen}
        onToggleInfoPopover={() => setIsInfoPopoverOpen(!isInfoPopoverOpen)}
        onOpenHostTools={() => setActiveDrawer("host-tools")}
      />

      {/* Main Center Video Stage + Slide-over Drawers */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        <VideoStage
          localParticipant={localParticipant}
          remoteParticipants={remoteParticipants}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isHandRaised={isHandRaised}
          isHost={isHost}
          viewMode={viewMode}
          meetingId={meeting.id}
          localVideoTrack={localVideoTrack}
          remoteVideoTracks={remoteVideoTracks}
          speakingParticipantIds={speakingParticipantIds}
          activeReactions={activeReactions}
        />

        {/* Participants Drawer */}
        <ParticipantsDrawer
          isOpen={activeDrawer === "participants"}
          onClose={() => setActiveDrawer(null)}
          participants={participants}
          localParticipant={localParticipant}
          isHost={isHost}
          meetingId={meeting.id}
          onMuteAll={muteAll}
        />

        {/* Chat Drawer */}
        <ChatDrawer
          isOpen={activeDrawer === "chat"}
          onClose={() => setActiveDrawer(null)}
          messages={chatMessages}
          onSendMessage={sendMessage}
        />

        {/* Host Tools Drawer */}
        <HostToolsDrawer
          isOpen={activeDrawer === "host-tools"}
          onClose={() => setActiveDrawer(null)}
          isHost={isHost}
          onMuteAll={muteAll}
          onEndMeetingForAll={endMeetingForAll}
        />
      </div>

      {/* Docked Control Bar */}
      <ControlBar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isHandRaised={isHandRaised}
        participantCount={participants.length || 1}
        unreadChatCount={0}
        isHost={isHost}
        activeDrawer={activeDrawer}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideo}
        onToggleHand={toggleHand}
        isScreenSharing={isScreenSharing}
        onToggleScreenShare={toggleScreenShare}
        onSendReaction={sendReaction}
        onToggleParticipants={() =>
          setActiveDrawer((prev) => (prev === "participants" ? null : "participants"))
        }
        onToggleChat={() =>
          setActiveDrawer((prev) => (prev === "chat" ? null : "chat"))
        }
        onToggleHostTools={() =>
          setActiveDrawer((prev) => (prev === "host-tools" ? null : "host-tools"))
        }
        onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
      />

      {/* Leave / End Meeting Modal */}
      <LeaveMeetingModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        isHost={isHost}
        onLeave={leaveMeeting}
        onEndForAll={endMeetingForAll}
      />

      {/* Meeting Ended by Host Modal for All Remote Attendees */}
      <MeetingEndedModal
        isOpen={isMeetingEndedByHost}
        onGoToDashboard={() => router.push("/")}
      />
    </div>
  );
}

function MeetingRoomContainer({ params }: MeetingRoomProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: meetingId } = use(params);
  const { currentUser } = useCurrentUser();

  // Query parameter overrides
  const urlName = searchParams.get("name") || "";
  const urlAudioMuted = searchParams.get("audio") === "0";
  const urlVideoOff = searchParams.get("video") === "0";
  const passcode = searchParams.get("passcode") || searchParams.get("pwd") || undefined;
  const skipLobby = searchParams.get("autojoin") === "1";
  const hostParam = searchParams.get("host") === "1";

  // Check if this browser session was flagged as the host
  const isHostSession =
    hostParam ||
    (typeof window !== "undefined" &&
      sessionStorage.getItem(`zoom_host_${meetingId}`) === "true");

  const [meetingMeta, setMeetingMeta] = useState<Meeting | null>(null);

  useEffect(() => {
    if (!meetingId) return;
    api
      .getMeeting(meetingId)
      .then((m) => setMeetingMeta(m))
      .catch(console.warn);
  }, [meetingId]);

  // Is this user the actual host?
  // Only true if this tab has the hostSession flag AND matches host_id
  const isHostUser = Boolean(
    isHostSession &&
      currentUser?.id &&
      meetingMeta?.host_id &&
      currentUser.id === meetingMeta.host_id
  );

  // Link attendees get guest name prefill or blank so they enter their own name
  const defaultDisplayName = isHostUser
    ? currentUser?.display_name || "Host"
    : urlName ||
      (typeof window !== "undefined"
        ? localStorage.getItem("zoom_guest_name") || ""
        : "");

  // Pre-join Lobby state
  const [hasJoinedLobby, setHasJoinedLobby] = useState(skipLobby);
  const [lobbyOptions, setLobbyOptions] = useState({
    displayName: defaultDisplayName,
    audioMuted: urlAudioMuted,
    videoOff: urlVideoOff,
  });

  if (!hasJoinedLobby) {
    return (
      <MeetingLobbyModal
        meetingTitle={meetingMeta?.title || meetingMeta?.topic || "Zoom Meeting"}
        initialName={defaultDisplayName}
        isHost={isHostUser}
        onJoin={(options) => {
          if (!isHostUser && typeof window !== "undefined" && options.displayName) {
            localStorage.setItem("zoom_guest_name", options.displayName);
          }
          setLobbyOptions(options);
          setHasJoinedLobby(true);
        }}
        onCancel={() => router.push("/")}
      />
    );
  }

  return (
    <MeetingRoomContent
      meetingId={meetingId}
      currentUser={isHostUser ? currentUser : null}
      initialName={lobbyOptions.displayName}
      initialAudioMuted={lobbyOptions.audioMuted}
      initialVideoOff={lobbyOptions.videoOff}
      passcode={passcode}
    />
  );
}

export default function MeetingRoomPage(props: MeetingRoomProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-zoom-blue animate-pulse flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm font-semibold text-zinc-300">
            Loading Meeting Room...
          </p>
        </div>
      }
    >
      <MeetingRoomContainer {...props} />
    </Suspense>
  );
}
