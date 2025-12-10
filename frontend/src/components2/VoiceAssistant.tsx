import React, { useEffect, useState, useMemo } from 'react';
import {
  useVoiceAssistant,
  useLocalParticipant,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';
import { Track, Participant } from 'livekit-client';
import { Mic, MicOff, PhoneOff } from 'lucide-react';

import { Header } from './Header';
import { VisualizerSection } from './Visualizer';
import { ChatList } from './Chatlist';
import type { ChatMessage } from './Chatlist';

interface VoiceEvent {
  id: string;
  text: string;
  final: boolean;
  participant?: Participant;
  fromParticipant?: Participant;
}

type VisualizerState = 'speaking' | 'listening' | 'connected' | 'disconnected';

function mapAgentToVisualizerState(s: string): VisualizerState {
  if (s === 'connecting') return 'connected';
  if (s === 'speaking' || s === 'listening' || s === 'connected' || s === 'disconnected') return s;
  return 'connected';
}

const VoiceAssistant: React.FC = () => {
  const { state, audioTrack: agentTrack } = useVoiceAssistant();
  const { localParticipant, microphoneTrack } = useLocalParticipant();
  const room = useRoomContext();
  const transcriptions = useTranscriptions() as unknown as VoiceEvent[];

  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const userTrackRef = useMemo(() => {
    if (!localParticipant || !microphoneTrack) return undefined;
    return {
      participant: localParticipant,
      source: Track.Source.Microphone,
      publication: microphoneTrack,
    };
  }, [localParticipant, microphoneTrack]);

  const agentTrackRef = useMemo(() => {
    if (!agentTrack || !agentTrack.participant || !agentTrack.publication) return undefined;
    return {
      participant: agentTrack.participant,
      source: Track.Source.Unknown,
      publication: agentTrack.publication,
    };
  }, [agentTrack]);

  const isAgentSpeaking = state === 'speaking';
  const activeTrack = isAgentSpeaking ? agentTrackRef : userTrackRef;
  const visualizerState = mapAgentToVisualizerState(state as string);

  // Chat History Logic
  const uiMessages = useMemo(() => {
    const liveMessages: ChatMessage[] = transcriptions
      .filter(t => !t.final)
      .map(t => {
        const p = t.participant || t.fromParticipant;
        const isAgent = p?.identity?.includes('agent') || (p && p.identity !== localParticipant?.identity);
        return { id: t.id, text: t.text, sender: isAgent ? 'agent' : 'user', isInterim: true };
      });
    return [...history, ...liveMessages];
  }, [history, transcriptions, localParticipant]);

  useEffect(() => {
    transcriptions.forEach(seg => {
      if (seg.final) {
        setHistory(prev => {
          if (prev.some(m => m.id === seg.id)) return prev;
          const p = seg.participant || seg.fromParticipant;
          const isAgent = p?.identity?.includes('agent') || (p && p.identity !== localParticipant?.identity);
          return [...prev, { id: seg.id, text: seg.text, sender: isAgent ? 'agent' : 'user', isInterim: false }];
        });
      }
    });
  }, [transcriptions, localParticipant]);

  const toggleMic = () => {
    if (!localParticipant) return;
    localParticipant.setMicrophoneEnabled(!isMicMuted);
    setIsMicMuted(!isMicMuted);
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-zinc-50 text-zinc-900 overflow-hidden flex flex-col font-sans">
      
      {/* 1. Header (Fixed Top Left) */}
      <Header status={visualizerState} />

      {/* 2. Visualizer Section (Fixed height, never scrolls) */}
      <div className="flex-none h-[35vh] min-h-[250px] w-full relative z-10 bg-gradient-to-b from-zinc-50 to-zinc-50/0">
         <VisualizerSection 
           state={visualizerState}
           trackRef={activeTrack}
         />
      </div>

      {/* 3. Chat List (Takes remaining space, scrolls independently) */}
      <div className="flex-1 w-full relative z-0 overflow-hidden flex flex-col">
        <ChatList messages={uiMessages} />
      </div>

      {/* 4. Controls (Fixed Bottom) */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="flex items-center gap-6 bg-white/80 backdrop-blur-lg border border-white/20 px-8 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] pointer-events-auto transform hover:scale-[1.02] transition-transform duration-300">
           
          <button 
            onClick={toggleMic}
            className={`p-4 rounded-full transition-all duration-300 shadow-sm ${isMicMuted ? 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
          >
            {isMicMuted ? <MicOff size={20}/> : <Mic size={20}/>}
          </button>

          <div className="w-[1px] h-6 bg-zinc-200" />

          <button 
            onClick={() => room?.disconnect()}
            className="p-4 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors duration-300"
          >
            <PhoneOff size={20}/>
          </button>

        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;