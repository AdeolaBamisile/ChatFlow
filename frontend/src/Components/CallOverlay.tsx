import { useEffect, useRef, useState } from "react";
import { useMutation } from "@apollo/client/react";
import DailyIframe from "@daily-co/daily-js";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, X } from "lucide-react";

import { END_CALL_MUTATION } from "../services/graphql";
import { useAppStore } from "../store";

type DailyTrack = { state?: string; persistentTrack?: MediaStreamTrack };
type DailyParticipant = {
  local: boolean;
  tracks?: { video?: DailyTrack; audio?: DailyTrack };
};
type DailyParticipantEvent = { participant?: DailyParticipant | null };

const CallOverlay = () => {
  const call = useAppStore((state) => state.call);
  const callIncoming = useAppStore((state) => state.callIncoming);
  const setCall = useAppStore((state) => state.setCall);
  const clearCall = useAppStore((state) => state.clearCall);
  const currentUser = useAppStore((state) => state.currentUser);
  const [endCall] = useMutation(END_CALL_MUTATION);

  const callObjectRef = useRef<ReturnType<
    typeof DailyIframe.createCallObject
  > | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [seconds, setSeconds] = useState(0);

  const otherUser = call
    ? call.caller.id === currentUser?.id
      ? call.receiver
      : call.caller
    : null;

  useEffect(() => {
    if (!call || callIncoming) return;

    const callObject = DailyIframe.createCallObject({
      audioSource: true,
      videoSource: call.type === "video",
    });

    callObjectRef.current = callObject;

    const attachParticipant = (participant: DailyParticipant) => {
      if (!participant) return;

      const video = participant.tracks?.video;
      const audio = participant.tracks?.audio;
      const videoTrack =
        video?.state === "playable" ? video.persistentTrack : null;
      const audioTrack =
        audio?.state === "playable" ? audio.persistentTrack : null;

      if (participant.local) {
        if (videoTrack && localVideoRef.current) {
          localVideoRef.current.srcObject = new MediaStream([videoTrack]);
        }
        return;
      }

      setRemoteJoined(true);

      if (videoTrack && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = new MediaStream([videoTrack]);
      }

      if (audioTrack && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = new MediaStream([audioTrack]);
      }
    };

    const handleJoined = () => {
      setJoined(true);
      setSeconds(0);
      const participants = callObject.participants();
      Object.values(participants).forEach((participant) =>
        attachParticipant(participant as DailyParticipant),
      );
    };

    const handleParticipant = (event: DailyParticipantEvent) => {
      if (event.participant) attachParticipant(event.participant);
    };

    const handleLeft = () => {
      clearCall();
    };

    callObject.on("joined-meeting", handleJoined);
    callObject.on("participant-joined", handleParticipant);
    callObject.on("participant-updated", handleParticipant);
    callObject.on("track-started", handleParticipant);
    callObject.on("participant-left", handleLeft);
    callObject.on("left-meeting", handleLeft);

    void callObject.join({ url: call.roomUrl, token: call.token });

    return () => {
      callObject.off("joined-meeting", handleJoined);
      callObject.off("participant-joined", handleParticipant);
      callObject.off("participant-updated", handleParticipant);
      callObject.off("track-started", handleParticipant);
      callObject.off("participant-left", handleLeft);
      callObject.off("left-meeting", handleLeft);
      void callObject.leave().catch(() => undefined);
      callObject.destroy();
      callObjectRef.current = null;
    };
  }, [call, callIncoming, clearCall]);

  useEffect(() => {
    if (!joined) return;
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [joined]);

  if (!call) return null;

  const formatDuration = (value: number) => {
    const minutes = Math.floor(value / 60)
      .toString()
      .padStart(2, "0");
    const secondsValue = (value % 60).toString().padStart(2, "0");
    return `${minutes}:${secondsValue}`;
  };

  const finishCall = async () => {
    try {
      await endCall({ variables: { callId: call.id } });
    } finally {
      await callObjectRef.current?.leave().catch(() => undefined);
      clearCall();
    }
  };

  const acceptCall = () => setCall(call, false);

  const declineCall = async () => {
    await finishCall();
  };

  const toggleMute = async () => {
    const next = !muted;
    setMuted(next);
    await callObjectRef.current?.setLocalAudio(!next);
  };

  const toggleCamera = async () => {
    const next = !cameraOn;
    setCameraOn(next);
    await callObjectRef.current?.setLocalVideo(next);
  };

  return (
    <div className="call-overlay">
      <section className="call-overlay-panel">
        {callIncoming ? (
          <>
            <button
              className="call-close-button"
              onClick={declineCall}
              title="Decline"
            >
              <X size={21} />
            </button>
            <img
              className="call-avatar"
              src={otherUser?.avatar}
              alt={otherUser?.name}
            />
            <h2>{otherUser?.name}</h2>
            <p>@{otherUser?.username}</p>
            <span className="call-status">Incoming {call.type} call</span>
            <div className="call-incoming-actions">
              <button
                className="call-accept-button"
                onClick={acceptCall}
                title="Accept call"
              >
                <Phone size={22} />
              </button>
              <button
                className="call-decline-button"
                onClick={declineCall}
                title="Decline call"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="call-video-area">
              {call.type === "video" ? (
                <>
                  <video
                    ref={remoteVideoRef}
                    className="call-remote-video"
                    autoPlay
                    playsInline
                  />
                  <video
                    ref={localVideoRef}
                    className="call-local-video"
                    autoPlay
                    muted
                    playsInline
                  />
                  {!remoteJoined && (
                    <div className="call-video-placeholder">
                      <img
                        className="call-avatar"
                        src={otherUser?.avatar}
                        alt={otherUser?.name}
                      />
                      <span>{joined ? "Calling..." : "Connecting..."}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="call-audio-area">
                  <img
                    className="call-avatar"
                    src={otherUser?.avatar}
                    alt={otherUser?.name}
                  />
                  <h2>{otherUser?.name}</h2>
                  <p>@{otherUser?.username}</p>
                </div>
              )}
              <audio ref={remoteAudioRef} autoPlay />
            </div>

            <div className="call-header-info">
              <span>{otherUser?.name}</span>
              <small>{joined ? formatDuration(seconds) : "Calling..."}</small>
            </div>

            <div className="call-controls">
              <button onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
                {muted ? <MicOff /> : <Mic />}
              </button>
              {call.type === "video" && (
                <button
                  onClick={toggleCamera}
                  title={cameraOn ? "Turn camera off" : "Turn camera on"}
                >
                  {cameraOn ? <Video /> : <VideoOff />}
                </button>
              )}
              <button
                className="call-end-button"
                onClick={finishCall}
                title="End call"
              >
                <PhoneOff />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default CallOverlay;
