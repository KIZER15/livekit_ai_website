import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  useVoiceAssistant,
  BarVisualizer,
  useLocalParticipant,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';
import { Track, Participant } from 'livekit-client';
import { Sparkles, Mic, MicOff, PhoneOff, ChevronLeft, MoreHorizontal } from 'lucide-react';


// --- Types ---
interface VoiceEvent {
  id: string;
  text: string;
  final: boolean;
  firstReceivedTime: number;
  participant?: Participant; 
  fromParticipant?: Participant; 
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: number;
  isFinal: boolean;
}

const VoiceAssistant: React.FC = () => {
  // --- HOOKS ---
  const { state, audioTrack: agentTrack } = useVoiceAssistant();
  const { localParticipant, microphoneTrack } = useLocalParticipant();
  const room = useRoomContext();
  const transcriptions = useTranscriptions() as unknown as VoiceEvent[];

  // --- STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // --- 2. SYNC HISTORY ---
  useEffect(() => {
    transcriptions.forEach((seg) => {
      if (seg.final) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === seg.id)) return prev;
          
          const participant = seg.participant || seg.fromParticipant;
          const isAgent = participant?.identity?.includes('agent') || 
                          (participant && participant.identity !== localParticipant?.identity);

          return [
            ...prev,
            {
              id: seg.id,
              text: seg.text,
              sender: isAgent ? 'agent' : 'user',
              timestamp: seg.firstReceivedTime,
              isFinal: true,
            },
          ];
        });
      }
    });
  }, [transcriptions, localParticipant]);

  // --- 3. AUTO SCROLL ---
  // We scroll only the container, not the window
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, transcriptions]);

  // --- 4. TRACK LOGIC ---
  const isAgentSpeaking = state === 'speaking';
  
  const userTrackRef = useMemo(() => {
    if (!localParticipant || !microphoneTrack) return undefined;
    return {
      participant: localParticipant,
      source: Track.Source.Microphone,
      publication: microphoneTrack,
    };
  }, [localParticipant, microphoneTrack]);

  const activeTrackReference = isAgentSpeaking ? agentTrack : userTrackRef;

  // --- 5. ACTIONS ---
  const toggleMic = () => {
    if (localParticipant) {
      const newVal = !isMicMuted;
      localParticipant.setMicrophoneEnabled(!newVal);
      setIsMicMuted(newVal);
    }
  };

  const handleDisconnect = () => {
    room?.disconnect();
  };

  // --- THEME COLORS (Dynamic) ---
  // Agent = Indigo/Blue, User = Teal/Emerald
  const activeColor = isAgentSpeaking ? '#6366f1' : '#14b8a6'; 
  const activeShadow = isAgentSpeaking ? 'rgba(99, 102, 241, 0.5)' : 'rgba(20, 184, 166, 0.5)';

  // --- RENDER TEXT HELPER ---
  // Unified Theme: Same background, distinct alignment
  const renderMessageBubble = (id: string, text: string, sender: 'user' | 'agent', isInterim = false) => {
    const isUser = sender === 'user';
    return (
      <div key={id} className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`
           relative max-w-[85%] md:max-w-[75%] px-6 py-4 rounded-2xl text-[15px] md:text-base leading-relaxed
           border shadow-sm transition-all duration-300
           ${isInterim ? 'animate-pulse opacity-80' : 'animate-fade-in-up'}
           bg-white border-zinc-100 text-zinc-800
           ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}
        `}>
           {text}
        </div>
      </div>
    );
  };

  return (
    // FIX 1: fixed inset-0 prevents the whole page from moving
    <div className="fixed inset-0 w-full h-[100dvh] bg-zinc-50 text-zinc-900 font-sans overflow-hidden flex flex-col">
      
      {/* --- BACKGROUND ACCENTS --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div 
           className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] rounded-[100%] blur-[100px] opacity-30 transition-colors duration-1000"
           style={{ backgroundColor: activeColor }} 
         />
      </div>

      {/* --- HEADER --- */}
      <header className="absolute top-0 left-0 w-full p-6 z-50 flex items-center justify-between bg-gradient-to-b from-zinc-50/90 to-transparent backdrop-blur-[2px]">
        <div className="flex items-center gap-3">
            <button onClick={handleDisconnect} className="md:hidden text-zinc-400 hover:text-zinc-800 transition-colors">
                <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
                <span 
                  className="p-2 rounded-xl transition-colors duration-500 bg-white shadow-sm border border-zinc-100"
                  style={{ color: activeColor }}
                >
                    <Sparkles size={18} fill="currentColor" />
                </span>
                <span className="font-bold text-lg tracking-tight text-zinc-800">
                    AI Assistant
                </span>
            </div>
        </div>
      </header>

      {/* --- SCROLLABLE CONTENT AREA --- */}
      {/* FIX 1: flex-1 ensures this area takes remaining space, overflow-y-auto allows internal scrolling */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-2xl mx-auto pt-28 pb-36">
        
        {/* --- VISUALIZER (VIBRATION/WAVE) --- */}
        <div className="flex-none flex flex-col items-center justify-center min-h-[160px] mb-4">
           
           {/* Vibration Effect Container */}
           <div className="relative w-[300px] h-[80px] flex items-center justify-center">
              
              {/* The "Vibration" Glow Ring */}
              <div 
                className="absolute inset-0 rounded-full blur-2xl transition-all duration-300 opacity-40 animate-pulse"
                style={{ backgroundColor: activeShadow }}
              />

              {activeTrackReference ? (
                <BarVisualizer
                  state={state}
                  barCount={25}
                  trackRef={activeTrackReference}
                  // FIX 3: Styling the visualizer to look like a fluid wave
                  style={{ height: '100%', width: '100%' }}
                  options={{ minHeight: 10, maxHeight: 60 }} 
                  className="relative z-10"
                >
                    <style>{`
                        .lk-audio-visualizer > rect { 
                            fill: ${activeColor} !important; 
                            rx: 10px; /* Rounded pill shape bars */
                            transition: height 0.1s ease, fill 0.5s ease;
                        } 
                    `}</style>
                </BarVisualizer>
              ) : (
                <div className="flex items-center gap-2 opacity-30">
                   <MoreHorizontal className="animate-bounce text-zinc-400" />
                </div>
              )}
           </div>

           <p 
             className="text-sm font-medium tracking-widest uppercase mt-4 transition-colors duration-500 opacity-60"
             style={{ color: activeColor }}
           >
             {isAgentSpeaking ? "AI Speaking" : "Listening..."}
           </p>
        </div>

        {/* --- TRANSCRIPTION LIST --- */}
        <div 
          className="flex-1 w-full overflow-y-auto px-4 custom-scrollbar scroll-smooth"
          style={{ 
            // Smooth fade mask at top
            maskImage: 'linear-gradient(to bottom, transparent, black 20px)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20px)'
          }}
        >
          {messages.length === 0 && transcriptions.length === 0 && (
             <div className="flex flex-col items-center justify-center h-40 text-zinc-300">
                <p>Start the conversation...</p>
             </div>
          )}

          {/* 1. Finalized History */}
          {messages.map((msg) => renderMessageBubble(msg.id, msg.text, msg.sender, false))}

          {/* 2. Live Interim Text */}
          {transcriptions
            .filter(seg => !seg.final)
            .map(seg => {
              const participant = seg.participant || seg.fromParticipant;
              const isAgent = participant?.identity?.includes('agent') || 
                              (participant && participant.identity !== localParticipant?.identity);
              return renderMessageBubble(seg.id, seg.text, isAgent ? 'agent' : 'user', true);
            })
          }
          
          {/* Dummy div to scroll to */}
          <div ref={transcriptEndRef} className="h-4" />
        </div>

      </main>

      {/* --- FOOTER CONTROLS --- */}
      <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center px-4">
        <div className="flex items-center gap-6 bg-white/90 backdrop-blur-md border border-white/50 p-4 px-8 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] transform transition-transform hover:scale-[1.02]">
           
           <button 
             onClick={toggleMic}
             className={`
               w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md
               ${isMicMuted 
                 ? 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200' 
                 : 'bg-zinc-900 text-white hover:bg-zinc-800'
               }
             `}
           >
             {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
           </button>

           <div className="w-[1px] h-8 bg-zinc-200" />

           <button 
             onClick={handleDisconnect}
             className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm border border-rose-100"
           >
             <PhoneOff size={22} />
           </button>

        </div>
      </div>

    </div>
  );
};

export default VoiceAssistant;