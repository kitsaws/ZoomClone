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

export type ViewMode = "gallery" | "speaker";
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

  // Refs for stable callbacks without triggering effect re-connections
  const roomRef = useRef<Room | null>(null);
  const localParticipantIdRef = useRef<string | null>(null);
  const meetingRef = useRef<Meeting | null>(null);
  const isHandRaisedRef = useRef<boolean>(false);
  const remoteHandsRef = useRef<Record<string, boolean>>({});
  const isMutedRef = useRef<boolean>(initialAudioMuted);
  const isVideoOffRef = useRef<boolean>(initialVideoOff);

  // In-Room Interactive Controls State
  const [isMuted, setIsMuted] = useState<boolean>(initialAudioMuted);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(initialVideoOff);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);

  // Keep refs in sync with state
  isMutedRef.current = isMuted;
  isVideoOffRef.current = isVideoOff;
  isHandRaisedRef.current = isHandRaised;

  // View & UI Navigation State
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
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
      sender: "Zoom Assistant",
      text: "Meeting started. Secure real-time media session active.",
      time: "Just now",
      isSelf: false,
    },
  ]);

  // Keep latest config in ref
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

  // Stable, 100% SFU-driven participant synchronization
  const syncLiveKitParticipants = useCallback((roomInstance?: Room | null) => {
    const activeRoom = roomInstance || roomRef.current;
    const meetingData = meetingRef.current;
    if (!meetingData) return;

    const hostId = meetingData.host_id;
    const user = configRef.current.currentUser;
    const isUserHost = Boolean(user?.id && hostId && user.id === hostId);

    // 1. Local Participant
    const localPartId =
      localParticipantIdRef.current ||
      (activeRoom?.localParticipant
        ? activeRoom.localParticipant.identity
        : `user_${user?.id || "guest"}`);
    const isLocalHost =
      isUserHost ||
      (activeRoom?.localParticipant
        ? activeRoom.localParticipant.identity === hostId
        : false);

    const isLocalMicMuted = activeRoom?.localParticipant
      ? !activeRoom.localParticipant.isMicrophoneEnabled
      : isMutedRef.current;
    const isLocalCamMuted = activeRoom?.localParticipant
      ? !activeRoom.localParticipant.isCameraEnabled
      : isVideoOffRef.current;

    const localDisplayName =
      configRef.current.initialName ||
      user?.display_name ||
      (typeof window !== "undefined"
        ? (isLocalHost
            ? localStorage.getItem("zoom_saved_name")
            : localStorage.getItem("zoom_guest_name"))
        : null) ||
      (isLocalHost ? "Host" : "You");

    const localPartObj: MeetingParticipant = {
      id: localPartId,
      meeting_id: meetingData.id,
      user_id: user?.id || null,
      display_name: localDisplayName,
      role: isLocalHost ? "host" : "participant",
      is_guest: !isLocalHost,
      audio_muted: isLocalMicMuted,
      video_muted: isLocalCamMuted,
      hand_raised: isHandRaisedRef.current,
      is_host: isLocalHost,
    };

    setLocalParticipant(localPartObj);

    // 2. Remote Participants directly from LiveKit SFU Room
    const parts: MeetingParticipant[] = [localPartObj];

    if (activeRoom) {
      activeRoom.remoteParticipants.forEach((rp) => {
        const isRemoteHost = Boolean(rp.identity === hostId || rp.name?.toLowerCase().includes("host"));
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
    }

    setParticipants(parts);
  }, []);

  // Initial Room Setup & SFU Connection (strictly runs ONCE per meetingId)
  useEffect(() => {
    if (!meetingId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setIsMeetingEndedByHost(false);

    async function loadAndJoinRoom() {
      try {
        // 1. Fetch meeting details from backend
        const meetingData = await api.getMeeting(meetingId);
        if (!isMounted) return;

        meetingRef.current = meetingData;
        setMeeting(meetingData);

        const {
          currentUser: user,
          initialName: name,
          initialAudioMuted: audioMuted,
          initialVideoOff: videoOff,
        } = configRef.current;

        const displayName =
          name ||
          user?.display_name ||
          (typeof window !== "undefined"
            ? (user?.id
                ? localStorage.getItem("zoom_saved_name")
                : localStorage.getItem("zoom_guest_name"))
            : null) ||
          (user?.id ? "Host" : "Guest User");

        // Persistent guest session ID to avoid identity collisions
        let guestSessionId = "";
        if (typeof window !== "undefined") {
          guestSessionId = sessionStorage.getItem(`zoom_guest_id_${meetingData.id}`) || "";
          if (!guestSessionId) {
            guestSessionId = `guest_${Math.random().toString(36).substring(2, 8)}`;
            sessionStorage.setItem(`zoom_guest_id_${meetingData.id}`, guestSessionId);
          }
        }

        // Register initial participant record in DB
        let activeLocal: MeetingParticipant | null = null;
        try {
          activeLocal = await api.joinMeeting(meetingData.id, {
            display_name: displayName,
            user_id: user?.id || null,
            is_audio_muted: audioMuted,
            is_video_off: videoOff,
          });
        } catch (joinErr) {
          console.warn("Join API note:", joinErr);
        }

        if (activeLocal && isMounted) {
          localParticipantIdRef.current = activeLocal.id;
          setLocalParticipant(activeLocal);
        }

        // 2. Request scoped LiveKit Token from backend
        let lkTokenData: LiveKitTokenResponse | null = null;
        try {
          lkTokenData = await api.getLiveKitToken(meetingData.id, {
            display_name: displayName,
            user_id: user?.id || (activeLocal?.id || guestSessionId),
            passcode: configRef.current.passcode,
          });
        } catch (tokenErr) {
          console.warn("LiveKit token request note:", tokenErr);
        }

        // 3. Connect to LiveKit SFU Room
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
                syncLiveKitParticipants(room);
              }
            });

            // Remote Participant joins SFU
            room.on(RoomEvent.ParticipantConnected, (rp: RemoteParticipant) => {
              console.log("[SFU] Remote participant connected:", rp.identity, rp.name);
              if (isMounted) {
                syncLiveKitParticipants(room);
              }
            });

            // Remote Participant leaves SFU
            room.on(RoomEvent.ParticipantDisconnected, (rp: RemoteParticipant) => {
              console.log("[SFU] Remote participant disconnected:", rp.identity);
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

            // Track mute / unmute events from remote peers
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

            // Remote Track Subscription (Audio & Video)
            room.on(
              RoomEvent.TrackSubscribed,
              (
                track: RemoteTrack,
                publication: RemoteTrackPublication,
                participant: RemoteParticipant
              ) => {
                console.log("[SFU] Remote track subscribed:", track.kind, participant.identity);
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
                console.log("[SFU] Remote track unsubscribed:", track.kind, participant.identity);
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

            // Local track publication events
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

            // Active speakers for green audio highlighting
            room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
              if (isMounted) {
                setSpeakingParticipantIds(new Set(speakers.map((s) => s.identity)));
              }
            });

            // Real-time SFU Data Channel Signaling
            room.on(
              RoomEvent.DataReceived,
              (payload: Uint8Array, participant?: RemoteParticipant) => {
                try {
                  const decoded = new TextDecoder().decode(payload);
                  const data = JSON.parse(decoded);

                  if (data.type === "MEETING_ENDED" || data.type === "END_MEETING") {
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
                      isMutedRef.current = true;
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
                  console.warn("LiveKit data packet parse error:", e);
                }
              }
            );

            // Connect to SFU
            await room.connect(lkTokenData.url, lkTokenData.token);

            if (isMounted) {
              setLiveKitState(room.state);
              if (room.state === ConnectionState.Connected) {
                // Publish local tracks based on initial settings
                if (!audioMuted) {
                  await room.localParticipant.setMicrophoneEnabled(true).catch(console.warn);
                } else {
                  await room.localParticipant.setMicrophoneEnabled(false).catch(console.warn);
                }

                if (!videoOff) {
                  await room.localParticipant.setCameraEnabled(true).catch(console.warn);
                  const pub = Array.from(
                    room.localParticipant.videoTrackPublications.values()
                  )[0];
                  if (pub?.videoTrack) setLocalVideoTrack(pub.videoTrack);
                } else {
                  await room.localParticipant.setCameraEnabled(false).catch(console.warn);
                  setLocalVideoTrack(null);
                }

                // Check and attach any already subscribed remote tracks
                const existingTracks = new Map<string, Track>();
                room.remoteParticipants.forEach((rp) => {
                  rp.trackPublications.forEach((pub) => {
                    if (pub.track) {
                      if (pub.track.kind === Track.Kind.Audio) {
                        pub.track.attach();
                      } else if (pub.track.kind === Track.Kind.Video) {
                        existingTracks.set(rp.identity, pub.track);
                      }
                    }
                  });
                });
                if (existingTracks.size > 0) {
                  setRemoteVideoTracks((prev) => {
                    const merged = new Map(prev);
                    existingTracks.forEach((t, id) => merged.set(id, t));
                    return merged;
                  });
                }

                syncLiveKitParticipants(room);
              }
            }
          } catch (lkErr) {
            console.warn("LiveKit room initialization note:", lkErr);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load meeting:", err);
          setError(
            err instanceof ApiError
              ? err.message
              : err?.message || "Unable to connect to meeting room. Please check meeting ID."
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
  }, [meetingId]); // Strictly depends ONLY on meetingId!

  // Audio Toggle (Pure SFU track operation)
  const toggleMic = async () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(!nextMuted);
      } catch (err) {
        console.warn("Failed to toggle microphone track via LiveKit:", err);
      }
    }
    syncLiveKitParticipants();
  };

  // Video Toggle (Pure SFU track operation)
  const toggleVideo = async () => {
    const nextVideoOff = !isVideoOff;
    setIsVideoOff(nextVideoOff);
    isVideoOffRef.current = nextVideoOff;

    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setCameraEnabled(!nextVideoOff);
        const pub = Array.from(
          roomRef.current.localParticipant.videoTrackPublications.values()
        )[0];
        setLocalVideoTrack(!nextVideoOff ? (pub?.videoTrack || null) : null);
      } catch (err) {
        console.warn("Failed to toggle camera track via LiveKit:", err);
      }
    }
    syncLiveKitParticipants();
  };

  // Hand Raise Toggle
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

  // Send Emoji Reaction
  const sendReaction = async (emoji: string) => {
    const myId = localParticipantIdRef.current || roomRef.current?.localParticipant?.identity || "self";
    const reactionId = `react-${Date.now()}-${Math.random()}`;

    setActiveReactions((prev) => [
      ...prev,
      { id: reactionId, emoji, participantId: myId },
    ]);
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== reactionId));
    }, 3000);

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

  // Screen Share Toggle
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

  // Send In-Room Message
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const msgObj = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

  // Host Action: Mute All
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

  // Leave Meeting
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

  // End Meeting for All
  const endMeetingForAll = async () => {
    if (roomRef.current?.localParticipant) {
      try {
        const payload = { type: "MEETING_ENDED", hostId: currentUser?.id };
        const data = new TextEncoder().encode(JSON.stringify(payload));
        await roomRef.current.localParticipant.publishData(data, { reliable: true });
      } catch (err) {
        console.warn("Failed to broadcast meeting ended packet:", err);
      }
    }

    if (meeting) {
      try {
        await api.endMeeting(meeting.id);
      } catch (err) {
        console.warn("Failed to mark meeting ended in database:", err);
      }
    }

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
    liveKitRoom,
    liveKitState,
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
  };
}
