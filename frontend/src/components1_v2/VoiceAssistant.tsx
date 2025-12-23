import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { 
  useVoiceAssistant, 
  useLocalParticipant, 
  useRoomContext, 
  useParticipants 
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

// Helper to normalize state strings for the UI
function mapAgentToVisualizerState(s: string): VisualizerState {
  if (s === 'connecting') return 'connected';
  if (s === 'speaking' || s === 'listening' || s === 'connected' || s === 'disconnected') return s;
  return 'connected';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ mode }) => {
  const room = useRoomContext();
  const participants = useParticipants();
  const { state, audioTrack: agentTrack } = useVoiceAssistant();
  const { localParticipant, microphoneTrack } = useLocalParticipant();
  
  // Logic: Get messages from your hook (this should now show both sides)
  const uiMessages = useChatTranscriptions();

  // Logic: Identify the Phone Caller (SIP)
  const phoneParticipant = useMemo(() => {
    return participants.find(p => 
      p.identity.includes('sip') || 
      p.identity.startsWith('+') // common for phone numbers
    );
  }, [participants]);

  // Logic: Initialize mute state correctly
  // If phone mode: we mute the browser mic so we don't hear the computer's room noise
  const [isMicMuted, setIsMicMuted] = useState(mode === 'phone');

  // --- Logic: Track Selection for Visualizer ---
  const activeTrack = useMemo(() => {
    // 1. If Agent is speaking, always show Agent's waves
    if (state === 'speaking' && agentTrack?.publication) {
      return { 
        participant: agentTrack.participant as Participant, 
        source: Track.Source.Unknown, 
        publication: agentTrack.publication 
      };
    }

    // 2. In Phone Mode, visualize the REMOTE phone caller's voice
    if (mode === 'phone' && phoneParticipant) {
      const micTrack = phoneParticipant.getTrackPublication(Track.Source.Microphone);
      if (micTrack) return { 
        participant: phoneParticipant, 
        source: Track.Source.Microphone, 
        publication: micTrack 
      };
    }

    // 3. In Web Mode, visualize the LOCAL browser mic
    if (mode === 'web' && !isMicMuted && localParticipant && microphoneTrack) {
      return { 
        participant: localParticipant, 
        source: Track.Source.Microphone, 
        publication: microphoneTrack 
      };
    }

    return undefined;
  }, [state, agentTrack, phoneParticipant, mode, isMicMuted, localParticipant, microphoneTrack]);

  // Sync microphone state based on mode
  useEffect(() => {
    if (mode === 'phone' && localParticipant) {
      localParticipant.setMicrophoneEnabled(false);
      setIsMicMuted(true);
    } else if (mode === 'web' && localParticipant) {
      localParticipant.setMicrophoneEnabled(true);
      setIsMicMuted(false);
    }
  }, [mode, localParticipant]);

  // Robust Mute Toggle from Version 2
  const toggleMic = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!localParticipant || mode === 'phone') return;
    
    const nextMuteState = !isMicMuted;
    try {
      await localParticipant.setMicrophoneEnabled(!nextMuteState);
      setIsMicMuted(nextMuteState);
    } catch (error) {
      console.error("Mic toggle failed:", error);
    }
  }, [localParticipant, isMicMuted, mode]);

  const visualizerState = mapAgentToVisualizerState(state as string);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-zinc-50 text-zinc-900 overflow-hidden flex flex-col font-sans">
      
      {/* Header with status mapping */}
      <Header status={mode === 'phone' ? 'connected' : visualizerState} />
      
      {/* Mode Indicator Badge */}
      <div className="flex justify-center pt-4 px-4">
        <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border shadow-sm transition-colors duration-500 ${
          mode === 'phone' 
            ? 'bg-amber-50 border-amber-200 text-amber-700' 
            : 'bg-zinc-900 text-white'
        }`}>
          {mode === 'phone' ? (
            <><PhoneForwarded size={16} /><span className="text-sm font-bold">Phone Call Monitor</span></>
          ) : (
            <><Mic size={16} /><span className="text-sm font-bold">Web Voice Active</span></>
          )}
        </div>
      </div>

      {/* Chat List (Transcriptions) */}
      <div className="flex-1 w-full relative overflow-hidden flex flex-col mt-2">
        <ChatList messages={uiMessages} />
      </div>

      {/* Bottom Dock (Premium V2 Style) */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="flex items-center gap-6 px-6 py-4 rounded-[40px] pointer-events-auto bg-white/90 backdrop-blur-2xl border border-zinc-200 shadow-2xl transition-all duration-500">
          
          {/* Mic Toggle Button */}
          <button 
            onClick={toggleMic}
            disabled={mode === 'phone'} 
            className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${
              mode === 'phone' ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' : 
              isMicMuted ? 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:scale-105'
            }`}
          >
            {mode === 'phone' ? <Activity size={22} /> : (isMicMuted ? <MicOff size={22}/> : <Mic size={22}/>)}
          </button>

          <div className="h-10 w-[1px] bg-zinc-200 mx-1" />
          
          {/* Visualizer Section */}
          <VisualizerSection 
            state={mode === 'phone' ? (state === 'speaking' ? 'speaking' : 'listening') : visualizerState} 
            trackRef={activeTrack} 
          />
          
          <div className="h-10 w-[1px] bg-zinc-200 mx-1" />
          
          {/* Disconnect Button */}
          <button 
            onClick={() => room?.disconnect()} 
            className="w-14 h-14 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 hover:scale-105 transition-all duration-300"
          >
            <PhoneOff size={22}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;