import React from 'react';
import { BarVisualizer } from '@livekit/components-react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';

interface VisualizerSectionProps {
  state: 'speaking' | 'listening' | 'connected' | 'disconnected';
  trackRef?: TrackReferenceOrPlaceholder;
}

export const VisualizerSection: React.FC<VisualizerSectionProps> = ({ state, trackRef }) => {
  // Logic: AI Speaking = Green (Emerald), User Listening = Blue (Indigo)
  const isAgent = state === 'speaking';
  
  const themeColor = isAgent ? '#10b981' : '#6366f1'; // Emerald vs Indigo
  const glowColor = isAgent ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative transition-colors duration-1000">
      
      {/* 1. Large Ambient Cloud Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[160px] rounded-[100%] blur-[80px] transition-all duration-1000 pointer-events-none opacity-60 mix-blend-multiply"
        style={{ backgroundColor: glowColor }}
      />

      {/* 2. Visualizer Bars (Centered) */}
      <div className="relative z-20 w-[260px] h-[80px] flex items-center justify-center">
         {trackRef ? (
            <BarVisualizer
              barCount={20}
              track={trackRef}
              style={{ height: '100%', width: '100%' }}
              options={{ minHeight: 12, maxHeight: 60 }} 
            >
             <style>{`
                .lk-audio-visualizer > rect { 
                    fill: ${themeColor} !important; 
                    rx: 99px !important;
                    transition: height 0.1s ease, fill 0.8s ease;
                } 
             `}</style>
            </BarVisualizer>
         ) : (
           <div className="flex gap-1.5 items-center justify-center h-full opacity-40">
              <div className="w-1.5 h-2 bg-zinc-400 rounded-full animate-pulse" />
              <div className="w-1.5 h-4 bg-zinc-400 rounded-full animate-pulse delay-75" />
              <div className="w-1.5 h-2 bg-zinc-400 rounded-full animate-pulse delay-150" />
           </div>
         )}
      </div>

      {/* 3. Text label embedded INSIDE the cloud area (Absolute positioned center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 z-30 pointer-events-none">
        <p className={`
           text-[10px] font-bold tracking-[0.25em] uppercase text-center transition-colors duration-500
           ${isAgent ? 'text-emerald-700/70' : 'text-indigo-700/70'}
        `}>
          {isAgent ? 'AI Speaking' : 'Listening'}
        </p>
      </div>
      
    </div>
  );
};