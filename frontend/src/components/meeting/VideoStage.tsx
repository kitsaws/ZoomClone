"use client";

import React from "react";
import { MeetingParticipant } from "@/types/meeting";
import { ViewMode, ReactionItem } from "@/hooks/useMeetingRoom";
import { VideoTile } from "@/components/ui/VideoTile";
import { Button } from "@/components/ui/Button";
import { Users, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Track } from "livekit-client";

export interface VideoStageProps {
  localParticipant: MeetingParticipant | null;
  remoteParticipants: MeetingParticipant[];
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isHost: boolean;
  viewMode: ViewMode;
  meetingId: string;
  className?: string;
  localVideoTrack?: Track | null;
  remoteVideoTracks?: Map<string, Track>;
  speakingParticipantIds?: Set<string>;
  activeReactions?: ReactionItem[];
}

export const VideoStage: React.FC<VideoStageProps> = ({
  localParticipant,
  remoteParticipants,
  isMuted,
  isVideoOff,
  isHandRaised,
  isHost,
  viewMode,
  meetingId,
  className,
  localVideoTrack,
  remoteVideoTracks,
  speakingParticipantIds,
  activeReactions = [],
}) => {
  const [copied, setCopied] = React.useState(false);

  const totalCount = 1 + remoteParticipants.length;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLocalSpeaking =
    !isMuted &&
    Boolean(
      localParticipant?.id && speakingParticipantIds?.has(localParticipant.id)
    );

  // Self Reactions
  const selfReactions = activeReactions
    .filter(
      (r) =>
        r.participantId === localParticipant?.id ||
        r.participantId === "self" ||
        r.participantId === localParticipant?.user_id
    )
    .map((r) => r.emoji);

  // Self Tile Component
  const renderSelfTile = (isSpotlight = false) => (
    <VideoTile
      key="local-user-tile"
      name={localParticipant?.display_name || "You"}
      isHost={isHost}
      isSelf={true}
      isSpeaking={isLocalSpeaking}
      isAudioMuted={isMuted}
      isVideoMuted={isVideoOff}
      isHandRaised={isHandRaised}
      videoTrack={localVideoTrack}
      reactions={selfReactions}
      className={cn("h-full w-full", isSpotlight && "max-h-[75vh]")}
    />
  );

  // Remote Participant Tile Component
  const renderRemoteTile = (p: MeetingParticipant, isSpotlight = false) => {
    const isAudioMuted = p.audio_muted ?? p.is_audio_muted ?? true;
    const isVideoMuted = p.video_muted ?? p.is_video_off ?? false;
    const track = remoteVideoTracks?.get(p.id);
    const isSpeaking =
      !isAudioMuted && Boolean(speakingParticipantIds?.has(p.id));
    const remoteReactions = activeReactions
      .filter((r) => r.participantId === p.id || (p.user_id && r.participantId === p.user_id))
      .map((r) => r.emoji);

    return (
      <VideoTile
        key={p.id}
        name={p.display_name}
        isHost={p.role?.toUpperCase() === "HOST"}
        isSelf={false}
        isSpeaking={isSpeaking}
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
        isHandRaised={p.hand_raised ?? p.is_hand_raised ?? false}
        videoTrack={track}
        reactions={remoteReactions}
        className={cn("h-full w-full", isSpotlight && "max-h-[75vh]")}
      />
    );
  };

  return (
    <main
      className={cn(
        "flex-1 p-3 sm:p-5 flex items-center justify-center overflow-hidden relative bg-black",
        className
      )}
    >
      {/* CASE 1: SPEAKER VIEW */}
      {viewMode === "speaker" && (
        <div className="w-full h-full max-w-6xl flex flex-col gap-3 justify-center">
          {/* Top/Side Strip for other participants if > 1 */}
          {remoteParticipants.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-h-32 shrink-0 justify-center">
              <div className="w-40 h-24 shrink-0">
                {renderSelfTile(false)}
              </div>
              {remoteParticipants.slice(1).map((p) => (
                <div key={p.id} className="w-40 h-24 shrink-0">
                  {renderRemoteTile(p, false)}
                </div>
              ))}
            </div>
          )}

          {/* Main Spotlight Speaker */}
          <div className="flex-1 w-full max-h-[78vh] flex items-center justify-center">
            {remoteParticipants.length > 0
              ? renderRemoteTile(remoteParticipants[0], true)
              : renderSelfTile(true)}
          </div>
        </div>
      )}

      {/* CASE 2: DYNAMIC GALLERY (2 Users 50/50, 3-4 Users 2x2 Grid) */}
      {viewMode === "dynamic" && (
        <div
          className={cn(
            "w-full h-full max-w-6xl max-h-[82vh] grid gap-3 items-center justify-center",
            totalCount === 1
              ? "grid-cols-1"
              : totalCount === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2"
          )}
        >
          {renderSelfTile()}
          {remoteParticipants.map((p) => renderRemoteTile(p))}

          {/* If alone in room, show waiting buddy card */}
          {totalCount === 1 && (
            <div className="hidden sm:flex border border-dashed border-[#36364A] rounded-2xl h-full min-h-[220px] max-h-[80vh] flex-col items-center justify-center p-6 text-center space-y-2.5 bg-[#161622]/60">
              <div className="h-10 w-10 rounded-full bg-zoom-blue/20 text-zoom-blue flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  Waiting for others to join...
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Share the meeting link to start collaborating.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyLink}
                leftIcon={copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                className="rounded-xl px-3 text-xs"
              >
                {copied ? "Link Copied!" : "Copy Invite Link"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* CASE 3: GALLERY VIEW (Uniform Grid for 5+ Participants) */}
      {viewMode === "gallery" && (
        <div
          className={cn(
            "w-full h-full max-w-6xl max-h-[82vh] grid gap-3 items-center justify-center",
            totalCount <= 2
              ? "grid-cols-1 sm:grid-cols-2"
              : totalCount <= 4
              ? "grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-3"
          )}
        >
          {renderSelfTile()}
          {remoteParticipants.map((p) => renderRemoteTile(p))}
        </div>
      )}
    </main>
  );
};
