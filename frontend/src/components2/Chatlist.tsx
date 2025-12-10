import React, { useEffect, useRef } from 'react';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  isInterim?: boolean;
}

interface ChatListProps {
  messages: ChatMessage[];
}

export const ChatList: React.FC<ChatListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div 
      className="flex-1 w-full overflow-y-auto px-4 custom-scrollbar"
      style={{ 
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)'
      }}
    >
      <div className="max-w-2xl mx-auto flex flex-col pt-4 pb-32">
        {messages.length === 0 && (
            <div className="text-center space-y-2 py-10 mt-10 opacity-40">
               <p className="text-xs text-zinc-400 tracking-wider">Conversation History</p>
            </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isInterim = msg.isInterim;
          
          return (
            <div 
              key={msg.id} 
              className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  relative max-w-[85%] px-6 py-4 text-[16px] leading-7 rounded-[24px]
                  border shadow-sm transition-all duration-300 backdrop-blur-[2px]
                  ${isInterim ? 'opacity-80 scale-[0.99]' : 'opacity-100 scale-100 animate-fade-in-up'}
                  
                  /* --- COLOR LOGIC: User = Blue, AI = Green --- */
                  ${isUser 
                    ? `
                        bg-gradient-to-br from-indigo-50/90 to-white 
                        border-indigo-100 
                        text-indigo-950
                        rounded-tr-sm
                      `
                    : `
                        bg-gradient-to-br from-emerald-50/90 to-white 
                        border-emerald-100 
                        text-emerald-950
                        rounded-tl-sm
                      `
                  }
                `}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};