"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Meeting, MeetingParticipant, User, LiveKitTokenResponse } from "@/types/meeting";
import { api, ApiError } from "@/services/api";
import { useRouter } from "next/navigation";
import {
  Room,
  RoomEvent,
  ConnectionState,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalTrackPublication,
  Participant,
} from "livekit-client";

export type ViewMode = "speaker" | "dynamic" | "gallery";
export type DrawerType = "participants" | "chat" | "host-tools" | null;

export interface ReactionItem {
  id: string;
  emoji: string;
  participantId: string;
}

export interface UseMeetingRoomOptions {
  meetingId: string;
  currentUser: User | null;
  initialName?: string;
  initialAudioMuted?: boolean;
  initialVideoOff?: boolean;
  passcode?: string;
}

export function useMeetingRoom({
  meetingId,
  currentUser,
  initialName,
  initialAudioMuted = false,
  initialVideoOff = false,
  passcode,
}: UseMeetingRoomOptions) {
  const router = useRouter();

  // Core Room State
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<MeetingParticipant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // LiveKit SFU State
  const [liveKitRoom, setLiveKitRoom] = useState<Room | null>(null);
  const [liveKitState, setLiveKitState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [localVideoTrack, setLocalVideoTrack] = useState<Track | null>(null);
  const [remoteVideoTracks, setRemoteVideoTracks] = useState<Map<string, Track>>(new Map());
  const [speakingParticipantIds, setSpeakingParticipantIds] = useState<Set<string>>(new Set());

  // Meeting Ended by Host state
  const [isMeetingEndedByHost, setIsMeetingEndedByHost] = useState<boolean>(false);

  // Reactions & Transient Signaling
  const [activeReactions, setActiveReactions] = useState<ReactionItem[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

  const roomRef = useRef<Room | null>(null);
  const localParticipantIdRef = useRef<string | null>(null);
  const meetingRef = useRef<Meeting | null>(null);
  const isHandRaisedRef = useRef<boolean>(false);
  const remoteHandsRef = useRef<Record<string, boolean>>({});

  // In-Room Interactive Controls State
  const [isMuted, setIsMuted] = useState<boolean>(initialAudioMuted);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(initialVideoOff);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);

  // Sync ref
  isHandRaisedRef.current = isHandRaised;

  // View & UI Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>("dynamic");
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState<boolean>(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Chat state
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: string; text: string; time: string; isSelf: boolean }[]
  >([
    {
      id: "initial-msg",
      sender: "Zoom AI Assistant",
      text: "Meeting started with LiveKit real-time media engine. Encryption active.",
      time: "Just now",
      isSelf: false,
    },
  ]);

  // Keep latest config in ref to avoid re-triggering join lifecycle on persona state update
  const configRef = useRef({
    currentUser,
    initialName,
    initialAudioMuted,
    initialVideoOff,
    passcode,
  });
  configRef.current = {
    currentUser,
    initialName,
    initialAudioMuted,
    initialVideoOff,
    passcode,
  };

  // Live Duration Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Stable sync function referencing ref state without re-rendering triggers
  const syncLiveKitParticipants = useCallback((room?: Room | null) => {
    const activeRoom = room || roomRef.current;
    const meetingData = meetingRef.current;
    if (!activeRoom || !meetingData) return;

    const parts: MeetingParticipant[] = [];
    const hostId = meetingData.host_id;
    const user = configRef.current.currentUser;
    const isUserHost = Boolean(user?.id && hostId && user.id === hostId);

    // 1. Local Participant
    if (activeRoom.localParticipant) {
      const isLocalHost = isUserHost || activeRoom.localParticipant.identity === hostId;
      const localPartObj: MeetingParticipant = {
        id: localParticipantIdRef.current || activeRoom.localParticipant.identity,
        meeting_id: meetingData.id,
        user_id: user?.id || null,
        display_name:
          activeRoom.localParticipant.name ||
          configRef.current.initialName ||
          user?.display_name ||
          "You",
        role: isLocalHost ? "host" : "participant",
        is_guest: !user?.id,
        audio_muted: !activeRoom.localParticipant.isMicrophoneEnabled,
        video_muted: !activeRoom.localParticipant.isCameraEnabled,
        hand_raised: isHandRaisedRef.current,
        is_host: isLocalHost,
      };
      parts.push(localPartObj);
      setLocalParticipant(localPartObj);
    }

    // 2. Remote Participants
    activeRoom.remoteParticipants.forEach((rp) => {
      const isRemoteHost = rp.identity === hostId;
      parts.push({
        id: rp.identity,
        meeting_id: meetingData.id,
        user_id: rp.identity.startsWith("guest_") ? null : rp.identity,
        display_name: rp.name || rp.identity,
        role: isRemoteHost ? "host" : "participant",
        is_guest: rp.identity.startsWith("guest_"),
        audio_muted: !rp.isMicrophoneEnabled,
        video_muted: !rp.isCameraEnabled,
        hand_raised: Boolean(remoteHandsRef.current[rp.identity]),
        is_host: isRemoteHost,
      });
    });

    setParticipants(parts);
  }, []);

  // 1. Initial Room Setup, LiveKit Token Retrieval & Connection (Runs ONLY when meetingId changes)
  useEffect(() => {
    if (!meetingId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setIsMeetingEndedByHost(false);

    async function loadAndJoinRoom() {
      try {
        // 1. Fetch meeting details from backend (REST GET)
        const meetingData = await api.getMeeting(meetingId);
        if (!isMounted) return;

        meetingRef.current = meetingData;
        setMeeting(meetingData);

        // Immediate roster population from meeting payload
        const initialParticipants = (meetingData as any).participants || [];
        if (initialParticipants.length > 0) {
          setParticipants(initialParticipants);
        }

        const {
          currentUser: user,
          initialName: name,
          initialAudioMuted: audioMuted,
          initialVideoOff: videoOff,
        } = configRef.current;

        const displayName =
          name ||
          user?.display_name ||
          (typeof window !== "undefined" ? localStorage.getItem("zoom_saved_name") : null) ||
          "Guest User";

        // Check if current user is already in participant list
        let activeLocal: MeetingParticipant | null = null;
        if (user?.id) {
          activeLocal =
            initialParticipants.find(
              (p: MeetingParticipant) => p.user_id === user.id && !p.left_at
            ) || null;
        }

        if (!activeLocal) {
          activeLocal =
            initialParticipants.find(
              (p: MeetingParticipant) => p.display_name === displayName && !p.left_at
            ) || null;
        }

        // Register participant record in backend DB (REST POST)
        if (!activeLocal) {
          try {
            activeLocal = await api.joinMeeting(meetingData.id, {
              display_name: displayName,
              user_id: user?.id || null,
              is_audio_muted: audioMuted,
              is_video_off: videoOff,
            });
          } catch (joinErr) {
            console.warn("Join API response note:", joinErr);
          }
        }

        if (activeLocal) {
          localParticipantIdRef.current = activeLocal.id;
          if (isMounted) {
            setLocalParticipant(activeLocal);
            setIsMuted(activeLocal.audio_muted ?? activeLocal.is_audio_muted ?? audioMuted);
            setIsVideoOff(activeLocal.video_muted ?? activeLocal.is_video_off ?? videoOff);
          }
        }

        // 2. Request scoped LiveKit Token from backend (REST POST)
        let lkTokenData: LiveKitTokenResponse | null = null;
        try {
          lkTokenData = await api.getLiveKitToken(meetingData.id, {
            display_name: displayName,
            user_id: user?.id || null,
            passcode: configRef.current.passcode,
          });
        } catch (tokenErr) {
          console.warn("LiveKit token request note:", tokenErr);
        }

        // 3. Connect to LiveKit Room & Wire Event Listeners
        if (lkTokenData && isMounted) {
          try {
            const room = new Room({
              adaptiveStream: true,
              dynacast: true,
            });

            roomRef.current = room;
            setLiveKitRoom(room);

            // Connection state change
            room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
              if (isMounted) {
                setLiveKitState(state);
                if (state === ConnectionState.Connected) {
                  syncLiveKitParticipants(room);
                }
              }
            });

            // Participant presence events
            room.on(RoomEvent.ParticipantConnected, () => {
              if (isMounted) syncLiveKitParticipants(room);
            });

            room.on(RoomEvent.ParticipantDisconnected, (rp: RemoteParticipant) => {
              if (isMounted) {
                setRemoteVideoTracks((prev) => {
                  const next = new Map(prev);
                  next.delete(rp.identity);
                  return next;
                });
                delete remoteHandsRef.current[rp.identity];
                syncLiveKitParticipants(room);
              }
            });

            // Track state events (mute/unmute/publish/unpublish)
            room.on(RoomEvent.TrackMuted, () => {
              if (isMounted) syncLiveKitParticipants(room);
            });

            room.on(RoomEvent.TrackUnmuted, () => {
              if (isMounted) syncLiveKitParticipants(room);
            });

            room.on(RoomEvent.TrackPublished, () => {
              if (isMounted) syncLiveKitParticipants(room);
            });

            room.on(RoomEvent.TrackUnpublished, () => {
              if (isMounted) syncLiveKitParticipants(room);
            });

            // Remote Track Subscription & Audio auto-playback
            room.on(
              RoomEvent.TrackSubscribed,
              (
                track: RemoteTrack,
                publication: RemoteTrackPublication,
                participant: RemoteParticipant
              ) => {
                if (track.kind === Track.Kind.Audio) {
                  track.attach();
                } else if (track.kind === Track.Kind.Video) {
                  setRemoteVideoTracks((prev) =>
                    new Map(prev).set(participant.identity, track)
                  );
                }
                if (isMounted) syncLiveKitParticipants(room);
              }
            );

            room.on(
              RoomEvent.TrackUnsubscribed,
              (
                track: RemoteTrack,
                publication: RemoteTrackPublication,
                participant: RemoteParticipant
              ) => {
                if (track.kind === Track.Kind.Audio) {
                  track.detach();
                } else if (track.kind === Track.Kind.Video) {
                  setRemoteVideoTracks((prev) => {
                    const next = new Map(prev);
                    next.delete(participant.identity);
                    return next;
                  });
                }
                if (isMounted) syncLiveKitParticipants(room);
              }
            );

            // Local track publication
            room.on(RoomEvent.LocalTrackPublished, (publication: LocalTrackPublication) => {
              if (publication.track?.kind === Track.Kind.Video) {
                setLocalVideoTrack(publication.track);
              }
              if (isMounted) syncLiveKitParticipants(room);
            });

            room.on(RoomEvent.LocalTrackUnpublished, (publication: LocalTrackPublication) => {
              if (publication.track?.kind === Track.Kind.Video) {
                setLocalVideoTrack(null);
              }
              if (isMounted) syncLiveKitParticipants(room);
            });

            // Active speakers indicator
            room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
              if (isMounted) {
                setSpeakingParticipantIds(new Set(speakers.map((s) => s.identity)));
              }
            });

            // Real-time signaling via LiveKit Data Packets (Mute All, Hand Raise, Reactions, Chat, End Meeting)
            room.on(
              RoomEvent.DataReceived,
              (payload: Uint8Array, participant?: RemoteParticipant) => {
                try {
                  const decoded = new TextDecoder().decode(payload);
                  const data = JSON.parse(decoded);

                  if (data.type === "MEETING_ENDED" || data.type === "END_MEETING") {
                    // Host ended the meeting for all
                    if (isMounted) {
                      setIsMeetingEndedByHost(true);
                      if (roomRef.current) {
                        roomRef.current.disconnect();
                        roomRef.current = null;
                      }
                    }
                  } else if (data.type === "MUTE_ALL") {
                    if (room.localParticipant) {
                      room.localParticipant.setMicrophoneEnabled(false).catch(console.warn);
                      setIsMuted(true);
                    }
                  } else if (data.type === "HAND_RAISE") {
                    remoteHandsRef.current[data.participantId] = data.hand_raised;
                    if (isMounted) syncLiveKitParticipants(room);
                  } else if (data.type === "REACTION") {
                    const reactionId = `react-${Date.now()}-${Math.random()}`;
                    if (isMounted) {
                      setActiveReactions((prev) => [
                        ...prev,
                        {
                          id: reactionId,
                          emoji: data.emoji || "👍",
                          participantId: data.participantId,
                        },
                      ]);
                      setTimeout(() => {
                        setActiveReactions((prev) =>
                          prev.filter((r) => r.id !== reactionId)
                        );
                      }, 3000);
                    }
                  } else if (data.type === "CHAT_MESSAGE") {
                    if (isMounted) {
                      setChatMessages((prev) => [
                        ...prev,
                        {
                          id: data.id || `msg-${Date.now()}`,
                          sender: data.sender || participant?.name || "Participant",
                          text: data.text,
                          time:
                            data.time ||
                            new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                          isSelf: false,
                        },
                      ]);
                    }
                  }
                } catch (e) {
                  console.warn("Failed to parse LiveKit data packet:", e);
                }
              }
            );

            room.on(RoomEvent.Reconnected, () => {
              if (isMounted) syncLiveKitParticipants(room);
            });

            // Connect to LiveKit SFU (falls back gracefully if offline)
            await room.connect(lkTokenData.url, lkTokenData.token).catch((err) => {
              console.warn("LiveKit connect warning:", err);
            });

            if (isMounted) {
              setLiveKitState(room.state);
              if (room.state === ConnectionState.Connected) {
                // Initialize microphone and camera per initial preference
                if (!audioMuted) {
                  room.localParticipant.setMicrophoneEnabled(true).catch(console.warn);
                }
                if (!videoOff) {
                  room.localParticipant
                    .setCameraEnabled(true)
                    .then(() => {
                      const pub = Array.from(
                        room.localParticipant.videoTrackPublications.values()
                      )[0];
                      if (pub?.videoTrack) setLocalVideoTrack(pub.videoTrack);
                    })
                    .catch(console.warn);
                }
                syncLiveKitParticipants(room);
              }
            }
          } catch (lkErr) {
            console.warn("LiveKit room initialization error:", lkErr);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load meeting:", err);
          setError(
            err instanceof ApiError
              ? err.message
              : "Unable to connect to meeting room. Please check meeting ID."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAndJoinRoom();

    return () => {
      isMounted = false;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [meetingId, syncLiveKitParticipants]);

  // 2. Audio Toggle — Pure LiveKit Local Track Action (No REST PATCH, No Page Reload)
  const toggleMic = async () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(!nextMuted);
      } catch (err) {
        console.warn("Failed to toggle microphone track via LiveKit:", err);
      }
    }
    syncLiveKitParticipants();
  };

  // 3. Video Toggle — Pure LiveKit Local Camera Action (No REST PATCH, No Page Reload)
  const toggleVideo = async () => {
    const nextVideoOff = !isVideoOff;
    setIsVideoOff(nextVideoOff);

    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setCameraEnabled(!nextVideoOff);
        const pub = Array.from(roomRef.current.localParticipant.videoTrackPublications.values())[0];
        setLocalVideoTrack(pub?.videoTrack || null);
      } catch (err) {
        console.warn("Failed to toggle camera track via LiveKit:", err);
      }
    }
    syncLiveKitParticipants();
  };

  // 4. Hand Raise Toggle — LiveKit Data Signaling (No REST PATCH, No Page Reload)
  const toggleHand = async () => {
    const nextHand = !isHandRaised;
    setIsHandRaised(nextHand);
    isHandRaisedRef.current = nextHand;

    if (roomRef.current?.localParticipant) {
      try {
        const payload = {
          type: "HAND_RAISE",
          participantId: roomRef.current.localParticipant.identity,
          hand_raised: nextHand,
        };
        const data = new TextEncoder().encode(JSON.stringify(payload));
        await roomRef.current.localParticipant.publishData(data, { reliable: true });
      } catch (err) {
        console.warn("Failed to broadcast hand raise via LiveKit:", err);
      }
    }
    syncLiveKitParticipants();
  };

  // 5. Send Emoji Reaction — LiveKit Data Signaling (No REST, No Page Reload)
  const sendReaction = async (emoji: string) => {
    const myId = localParticipantIdRef.current || roomRef.current?.localParticipant?.identity || "self";
    const reactionId = `react-${Date.now()}-${Math.random()}`;

    // Show reaction locally
    setActiveReactions((prev) => [
      ...prev,
      { id: reactionId, emoji, participantId: myId },
    ]);
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== reactionId));
    }, 3000);

    // Broadcast reaction via LiveKit SFU data packet
    if (roomRef.current?.localParticipant) {
      try {
        const payload = {
          type: "REACTION",
          emoji,
          participantId: roomRef.current.localParticipant.identity,
        };
        const data = new TextEncoder().encode(JSON.stringify(payload));
        await roomRef.current.localParticipant.publishData(data, { reliable: true });
      } catch (err) {
        console.warn("Failed to broadcast reaction via LiveKit:", err);
      }
    }
  };

  // 6. Screen Share Toggle — Pure LiveKit Screen Share (No REST, No Page Reload)
  const toggleScreenShare = async () => {
    if (!roomRef.current?.localParticipant) return;
    const nextShare = !isScreenSharing;
    try {
      await roomRef.current.localParticipant.setScreenShareEnabled(nextShare);
      setIsScreenSharing(nextShare);
    } catch (err) {
      console.warn("Failed to toggle screen share via LiveKit:", err);
      setIsScreenSharing(false);
    }
    syncLiveKitParticipants();
  };

  // 7. Send In-Room Message — LiveKit Data Signaling (No REST POST/PATCH)
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const msgObj = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: localParticipant?.display_name || configRef.current.currentUser?.display_name || "You",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    };
    setChatMessages((prev) => [...prev, msgObj]);

    if (roomRef.current?.localParticipant) {
      try {
        const payload = {
          type: "CHAT_MESSAGE",
          ...msgObj,
          isSelf: false,
        };
        const data = new TextEncoder().encode(JSON.stringify(payload));
        await roomRef.current.localParticipant.publishData(data, { reliable: true });
      } catch (err) {
        console.warn("Failed to broadcast chat message via LiveKit:", err);
      }
    }
  };

  // 8. Host Action: Mute All — LiveKit Data Broadcast (No REST PATCH)
  const muteAll = async () => {
    if (roomRef.current?.localParticipant) {
      try {
        const payload = { type: "MUTE_ALL" };
        const data = new TextEncoder().encode(JSON.stringify(payload));
        await roomRef.current.localParticipant.publishData(data, { reliable: true });
      } catch (err) {
        console.warn("Failed to broadcast mute all via LiveKit:", err);
      }
    }
  };

  // 9. Leave Meeting — LiveKit Disconnect + Persistent DB Exit Record (REST POST)
  const leaveMeeting = async () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    const partId = localParticipantIdRef.current || localParticipant?.id;
    if (partId && meeting) {
      try {
        await api.leaveMeeting(meeting.id, partId);
      } catch {}
    }
    router.push("/");
  };

  // 10. End Meeting for All — LiveKit Broadcast Data Packet + Persistent DB End Record (REST POST)
  const endMeetingForAll = async () => {
    // 1. Broadcast MEETING_ENDED to all participants over LiveKit SFU reliable data channel
    if (roomRef.current?.localParticipant) {
      try {
        const payload = { type: "MEETING_ENDED", hostId: currentUser?.id };
        const data = new TextEncoder().encode(JSON.stringify(payload));
        await roomRef.current.localParticipant.publishData(data, { reliable: true });
      } catch (err) {
        console.warn("Failed to broadcast meeting ended packet:", err);
      }
    }

    // 2. Persist ENDED status in database
    if (meeting) {
      try {
        await api.endMeeting(meeting.id);
      } catch (err) {
        console.warn("Failed to mark meeting ended in database:", err);
      }
    }

    // 3. Disconnect local room and navigate to dashboard
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    router.push("/");
  };

  const isHost =
    Boolean(currentUser?.id && meeting?.host_id && currentUser.id === meeting.host_id) ||
    localParticipant?.role?.toUpperCase() === "HOST";

  return {
    meeting,
    participants,
    localParticipant,
    isLoading,
    error,
    isHost,
    // LiveKit SFU Room & Connection
    liveKitRoom,
    liveKitState,
    localVideoTrack,
    remoteVideoTracks,
    speakingParticipantIds,
    // Meeting Ended by Host Modal State
    isMeetingEndedByHost,
    // Reactions & Screen Sharing
    activeReactions,
    sendReaction,
    isScreenSharing,
    toggleScreenShare,
    // Media states
    isMuted,
    isVideoOff,
    isHandRaised,
    toggleMic,
    toggleVideo,
    toggleHand,
    // View mode
    viewMode,
    setViewMode,
    // Drawers & Modals
    activeDrawer,
    setActiveDrawer,
    isInfoPopoverOpen,
    setIsInfoPopoverOpen,
    isLeaveModalOpen,
    setIsLeaveModalOpen,
    // Time & Chat
    elapsedSeconds,
    chatMessages,
    sendMessage,
    // Host controls
    muteAll,
    leaveMeeting,
    endMeetingForAll,
  };
}
