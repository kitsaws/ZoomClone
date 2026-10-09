"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MeetingParticipant } from "@/types/meeting";
import { ViewMode, ReactionItem } from "@/hooks/useMeetingRoom";
import { VideoTile } from "@/components/ui/VideoTile";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

interface ParticipantEntry {
  id: string;
  displayName: string;
  isSelf: boolean;
  isHost: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  videoTrack?: Track | null;
  reactions: string[];
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
  // Gallery view pagination state (16 per page)
  const [galleryPage, setGalleryPage] = useState(0);

  // Speaker view top strip pagination state (4 per page)
  const [speakerStripPage, setSpeakerStripPage] = useState(0);

  // Speaker view active spotlighted participant ID
  const [spotlightParticipantId, setSpotlightParticipantId] = useState<string | null>(null);

  // Build unified list of all participants in room
  const allParticipants: ParticipantEntry[] = useMemo(() => {
    const list: ParticipantEntry[] = [];

    // 1. Local User
    const localId = localParticipant?.id || "local-user";
    const isLocalSpeaking =
      !isMuted && Boolean(localId && speakingParticipantIds?.has(localId));
    const selfReactions = activeReactions
      .filter(
        (r) =>
          r.participantId === localId ||
          r.participantId === "self" ||
          r.participantId === localParticipant?.user_id
      )
      .map((r) => r.emoji);

    list.push({
      id: localId,
      displayName: localParticipant?.display_name || "You",
      isSelf: true,
      isHost: isHost,
      isAudioMuted: isMuted,
      isVideoMuted: isVideoOff,
      isHandRaised: isHandRaised,
      isSpeaking: isLocalSpeaking,
      videoTrack: localVideoTrack,
      reactions: selfReactions,
    });

    // 2. Remote Participants
    remoteParticipants.forEach((p) => {
      const isAudioMuted = p.audio_muted ?? p.is_audio_muted ?? true;
      const isVideoMuted = p.video_muted ?? p.is_video_off ?? false;
      const track = remoteVideoTracks?.get(p.id);
      const isSpeaking = !isAudioMuted && Boolean(speakingParticipantIds?.has(p.id));
      const remoteReactions = activeReactions
        .filter(
          (r) =>
            r.participantId === p.id ||
            (p.user_id && r.participantId === p.user_id)
        )
        .map((r) => r.emoji);

      list.push({
        id: p.id,
        displayName: p.display_name,
        isSelf: false,
        isHost: p.role?.toUpperCase() === "HOST",
        isAudioMuted: isAudioMuted,
        isVideoMuted: isVideoMuted,
        isHandRaised: p.hand_raised ?? p.is_hand_raised ?? false,
        isSpeaking: isSpeaking,
        videoTrack: track,
        reactions: remoteReactions,
      });
    });

    return list;
  }, [
    localParticipant,
    remoteParticipants,
    isMuted,
    isVideoOff,
    isHandRaised,
    isHost,
    localVideoTrack,
    remoteVideoTracks,
    speakingParticipantIds,
    activeReactions,
  ]);

  const totalCount = allParticipants.length;

  // Track dynamic active speaker
  useEffect(() => {
    if (speakingParticipantIds && speakingParticipantIds.size > 0) {
      const activeId = Array.from(speakingParticipantIds)[0];
      if (activeId) {
        setSpotlightParticipantId(activeId);
      }
    }
  }, [speakingParticipantIds]);

  // Reset page bounds when participant count changes
  useEffect(() => {
    const maxGalleryPage = Math.max(0, Math.ceil(totalCount / 16) - 1);
    if (galleryPage > maxGalleryPage) {
      setGalleryPage(maxGalleryPage);
    }

    const maxStripPage = Math.max(0, Math.ceil(totalCount / 4) - 1);
    if (speakerStripPage > maxStripPage) {
      setSpeakerStripPage(maxStripPage);
    }
  }, [totalCount, galleryPage, speakerStripPage]);

  // Determine current active speaker for Speaker View spotlight
  const currentSpeaker: ParticipantEntry = useMemo(() => {
    if (spotlightParticipantId) {
      const found = allParticipants.find((p) => p.id === spotlightParticipantId);
      if (found) return found;
    }
    // Fallback to first speaking participant
    const speaking = allParticipants.find((p) => p.isSpeaking);
    if (speaking) return speaking;
    // Fallback to first remote participant
    if (allParticipants.length > 1) return allParticipants[1];
    // Fallback to local
    return allParticipants[0];
  }, [allParticipants, spotlightParticipantId]);

  // Helper renderer for a participant tile
  const renderParticipantTile = (entry: ParticipantEntry, isThumbnail = false) => (
    <VideoTile
      key={entry.id}
      name={entry.displayName}
      isHost={entry.isHost}
      isSelf={entry.isSelf}
      isSpeaking={entry.isSpeaking}
      isAudioMuted={entry.isAudioMuted}
      isVideoMuted={entry.isVideoMuted}
      isHandRaised={entry.isHandRaised}
      videoTrack={entry.videoTrack}
      reactions={entry.reactions}
      isThumbnail={isThumbnail}
    />
  );

  return (
    <main
      className={cn(
        "flex-1 p-3 sm:p-4 flex items-center justify-center overflow-hidden relative bg-black select-none",
        className
      )}
    >
      {/* ========================================================
          CASE 1: GALLERY VIEW
          ======================================================== */}
      {viewMode === "gallery" && (() => {
        const PAGE_SIZE = 16;
        const totalGalleryPages = Math.ceil(totalCount / PAGE_SIZE);
        const startIndex = galleryPage * PAGE_SIZE;
        const visibleParticipants = allParticipants.slice(
          startIndex,
          startIndex + PAGE_SIZE
        );
        const visibleCount = visibleParticipants.length;

        return (
          <div className="w-full h-full max-w-7xl flex items-center justify-center relative">
            {/* Left Page Button if Paginated */}
            {totalGalleryPages > 1 && galleryPage > 0 && (
              <button
                type="button"
                onClick={() => setGalleryPage((p) => Math.max(0, p - 1))}
                className="absolute left-2 z-20 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/15 transition-all shadow-lg cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Gallery Grid Matrix */}
            <div
              className={cn(
                "w-full h-full max-h-[84vh] gap-2.5 sm:gap-3.5 items-center justify-center",
                // 1 User: Full Stage
                visibleCount === 1 && "flex w-full h-full",
                // 2 Users: 2 Columns, Full Height (side-by-side)
                visibleCount === 2 && "grid grid-cols-1 md:grid-cols-2 grid-rows-1 h-full",
                // 3 to 4 Users: 2 Columns x 2 Rows (at most 2 per row)
                visibleCount >= 3 && visibleCount <= 4 && "grid grid-cols-1 sm:grid-cols-2 grid-rows-2 h-full",
                // 5 to 6 Users: 3 Columns x 2 Rows
                visibleCount >= 5 && visibleCount <= 6 && "grid grid-cols-2 sm:grid-cols-3 grid-rows-2 h-full",
                // 7 to 9 Users: 3 Columns x 3 Rows
                visibleCount >= 7 && visibleCount <= 9 && "grid grid-cols-2 sm:grid-cols-3 grid-rows-3 h-full",
                // 10 to 16 Users: 4 Columns x 4 Rows
                visibleCount >= 10 && "grid grid-cols-2 sm:grid-cols-4 grid-rows-4 h-full"
              )}
            >
              {visibleParticipants.map((p) => renderParticipantTile(p))}
            </div>

            {/* Right Page Button if Paginated */}
            {totalGalleryPages > 1 && galleryPage < totalGalleryPages - 1 && (
              <button
                type="button"
                onClick={() =>
                  setGalleryPage((p) => Math.min(totalGalleryPages - 1, p + 1))
                }
                className="absolute right-2 z-20 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/15 transition-all shadow-lg cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      })()}

      {/* ========================================================
          CASE 2: SPEAKER VIEW
          ======================================================== */}
      {viewMode === "speaker" && (() => {
        const STRIP_PAGE_SIZE = 4;
        const totalStripPages = Math.ceil(totalCount / STRIP_PAGE_SIZE);
        const stripStartIndex = speakerStripPage * STRIP_PAGE_SIZE;
        const visibleStripParticipants = allParticipants.slice(
          stripStartIndex,
          stripStartIndex + STRIP_PAGE_SIZE
        );

        return (
          <div className="w-full h-full max-w-6xl flex flex-col gap-2.5 justify-center items-center">
            {/* Top Carousel Bar (max 4 tiles with < and > paging arrows) */}
            {totalCount > 1 && (
              <div className="w-full flex items-center justify-center gap-2 max-h-28 shrink-0 relative px-8">
                {/* Left Arrow if more than 4 participants */}
                {totalCount > STRIP_PAGE_SIZE && (
                  <button
                    type="button"
                    disabled={speakerStripPage === 0}
                    onClick={() =>
                      setSpeakerStripPage((p) => Math.max(0, p - 1))
                    }
                    className={cn(
                      "p-1.5 rounded-full bg-black/70 text-white border border-white/15 transition-all cursor-pointer",
                      speakerStripPage === 0
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-black/90 opacity-80 hover:opacity-100 shadow-md"
                    )}
                    title="Previous participants"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                {/* Top strip 4 thumbnails */}
                <div className="flex items-center gap-2 overflow-x-hidden justify-center max-w-full">
                  {visibleStripParticipants.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSpotlightParticipantId(p.id)}
                      className="w-36 sm:w-44 h-22 sm:h-26 shrink-0 cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                      {renderParticipantTile(p, true)}
                    </div>
                  ))}
                </div>

                {/* Right Arrow if more than 4 participants */}
                {totalCount > STRIP_PAGE_SIZE && (
                  <button
                    type="button"
                    disabled={speakerStripPage >= totalStripPages - 1}
                    onClick={() =>
                      setSpeakerStripPage((p) =>
                        Math.min(totalStripPages - 1, p + 1)
                      )
                    }
                    className={cn(
                      "p-1.5 rounded-full bg-black/70 text-white border border-white/15 transition-all cursor-pointer",
                      speakerStripPage >= totalStripPages - 1
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:bg-black/90 opacity-80 hover:opacity-100 shadow-md"
                    )}
                    title="Next participants"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Main Center Spotlight Speaker */}
            <div className="flex-1 w-full max-h-[72vh] flex items-center justify-center">
              <div className="w-full h-full max-w-5xl max-h-[70vh] flex items-center justify-center">
                {renderParticipantTile(currentSpeaker, false)}
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
};
