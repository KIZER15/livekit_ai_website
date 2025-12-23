import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  useVoiceAssistant,
  useLocalParticipant,
  useRoomContext,
  useParticipants,
} from '@livekit/components-react';
import { Participant, Track } from 'livekit-client';
import { Mic, MicOff, PhoneOff, PhoneForwarded, Activity } from 'lucide-react';

import { Header } from './Header';
import { VisualizerSection } from './Visualizer';
import { ChatList } from './Chatlist';
import { useChatTranscriptions } from '../hooks/useChatTranscriptions';

type VisualizerState = 'speaking' | 'listening' | 'connected' | 'disconnected';

interface VoiceAssistantProps {
  mode: 'web' | 'phone';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ mode }) => {
  const room = useRoomContext();
  const { state, audioTrack: agentTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  
  const [isMicMuted, setIsMicMuted] = useState(mode === 'phone');
  const uiMessages = useChatTranscriptions();

  // --- 1. Find the Phone Participant (SIP) ---
  // In LiveKit, phone callers usually have a specific 'kind' or metadata
  const phoneParticipant = useMemo(() => {
    return participants.find(p => 
      p.identity.includes('sip') || 
      p.attributes['sip.phoneNumber'] ||
      p.identity.startsWith('phone_') // Depends on your backend naming
    );
  }, [participants]);

  // --- 2. Monitor Mode Track Logic ---
  const activeTrack = useMemo(() => {
    // If Agent is speaking, always show Agent
    if (state === 'speaking' && agentTrack?.publication) {
      return {
        participant: agentTrack.participant as Participant,
        source: Track.Source.Unknown,
        publication: agentTrack.publication,
      };
    }

    // PHONE MODE: Visualize the REMOTE phone participant's voice
    if (mode === 'phone' && phoneParticipant) {
      const micTrack = phoneParticipant.getTrackPublication(Track.Source.Microphone);
      if (micTrack) {
        return {
          participant: phoneParticipant,
          source: Track.Source.Microphone,
          publication: micTrack,
        };
      }
    }

    // WEB MODE: Visualize local browser mic
    if (mode === 'web' && !isMicMuted) {
      const localMic = localParticipant?.getTrackPublication(Track.Source.Microphone);
      if (localMic) {
        return {
          participant: localParticipant,
          source: Track.Source.Microphone,
          publication: localMic,
        };
      }
    }

    return undefined;
  }, [state, agentTrack, phoneParticipant, mode, isMicMuted, localParticipant]);

  // --- 3. Auto-Mute Browser Mic ---
  useEffect(() => {
    if (mode === 'phone' && localParticipant) {
      localParticipant.setMicrophoneEnabled(false);
      setIsMicMuted(true);
    }
  }, [mode, localParticipant]);

  const handleDisconnect = useCallback(() => room?.disconnect(), [room]);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-background text-text-main overflow-hidden flex flex-col font-sans">
      <Header status={mode === 'phone' ? 'connected' : (state as VisualizerState)} />

      {/* Status Bar */}
      <div className="flex justify-center pt-4 px-4">
        <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border shadow-sm transition-all ${
          mode === 'phone' 
            ? 'bg-amber-50/50 border-amber-200 text-amber-700 backdrop-blur-md' 
            : 'bg-primary/5 border-primary/10 text-primary'
        }`}>
          {mode === 'phone' ? (
            <>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <PhoneForwarded size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black leading-none opacity-60">Live Monitor</span>
                <span className="text-sm font-bold leading-tight">Phone Call Active</span>
              </div>
            </>
          ) : (
            <><Mic size={16} /> <span className="text-sm font-bold">Web Voice Active</span></>
          )}
        </div>
      </div>

      {/* Chat List - This will now show transcriptions from the Phone + Agent */}
      <div className="flex-1 w-full relative overflow-hidden flex flex-col mt-2">
        <ChatList messages={uiMessages} />
      </div>

      {/* Bottom Dock */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="flex items-center gap-6 px-6 py-4 rounded-[40px] pointer-events-auto bg-white/90 backdrop-blur-2xl border border-border shadow-2xl transition-all">
          
          {/* Mic Button (Disabled in Phone Mode) */}
          <div className="relative group">
            <button 
              disabled={mode === 'phone'}
              onClick={() => !isMicMuted} // simplified toggle
              className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${
                mode === 'phone' 
                  ? 'bg-zinc-100 text-zinc-300' 
                  : isMicMuted ? 'bg-zinc-100 text-zinc-400' : 'bg-primary text-white'
              }`}
            >
              {mode === 'phone' ? <Activity size={22} /> : (isMicMuted ? <MicOff size={22}/> : <Mic size={22}/>)}
            </button>
            {mode === 'phone' && (
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Using Phone Mic
              </span>
            )}
          </div>

          <div className="h-10 w-[1px] bg-border mx-1" />
          
          {/* Visualizer: Now pulses to the Phone/Agent voice, not the browser mic */}
          <VisualizerSection 
            state={mode === 'phone' ? (state === 'speaking' ? 'speaking' : 'listening') : (state as VisualizerState)}
            trackRef={activeTrack}
          />
          
          <div className="h-10 w-[1px] bg-border mx-1" />

          <button onClick={handleDisconnect} className="w-14 h-14 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all">
            <PhoneOff size={22}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;