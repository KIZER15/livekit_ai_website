import { useState, useCallback } from 'react';
import { LiveKitRoom, RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import VoiceAssistant from './components1_v2/VoiceAssistant';
import { Header } from './components1_v2/Header';
import { Loader2, AlertCircle, Mic, Phone, X, ArrowRight } from 'lucide-react';

const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
const LIVEKIT_URL = import.meta.env?.VITE_LIVEKIT_URL || '';
const TOKEN_ENDPOINT = `${BACKEND_URL}/api/getToken`;

type ConnectionMode = 'web' | 'phone' | null;

export default function App() {
  const [token, setToken] = useState<string>('');
  const [mode, setMode] = useState<ConnectionMode>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+91');

  // Helper to get token
  const getLiveKitToken = async (identityPrefix: string) => {
    const userId = `${identityPrefix}_${Math.floor(Math.random() * 10000)}`;
    const response = await fetch(`${TOKEN_ENDPOINT}?name=${userId}`, { mode: 'cors' });
    if (!response.ok) throw new Error("Could not get LiveKit access token");
    return await response.text();
  };

  // --- PATH 1: Web Chat ---
  const startWebChat = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const accessToken = await getLiveKitToken('web_user');
      setToken(accessToken);
      setMode('web');
    } catch (err: any) {
      setError(err.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  }, []);

  // --- PATH 2: Phone Call ---
  const startPhoneCall = async () => {
    if (!phoneNumber || phoneNumber.length < 5) {
      setError("Please enter a valid phone number");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      // 1. Trigger Twilio Call
      const encodedPhone = encodeURIComponent(phoneNumber);
      const callRes = await fetch(`${BACKEND_URL}/api/testCall/${encodedPhone}`);
      const callData = await callRes.json();
      if (callData.status !== 0) throw new Error(callData.message || "Call failed");

      // 2. Join Web UI as "Monitor" to see transcripts
      const accessToken = await getLiveKitToken('monitor_user');
      setToken(accessToken);
      setMode('phone');
      setShowPhoneModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to start phone session");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setToken('');
    setMode(null);
  };

  // --- RENDER: Active Session ---
  if (token && mode) {
    return (
      <LiveKitRoom
        video={false}
        // IMPORTANT: If mode is phone, we don't want the browser mic active
        audio={mode === 'web'} 
        token={token}
        serverUrl={LIVEKIT_URL}
        connect={true}
        className="flex flex-col h-screen bg-[#f8f9fa]"
        onError={(err) => {
          setError(err.message);
          handleDisconnect();
        }}
        onDisconnected={handleDisconnect}
      >
        {/* 
          Pass the mode to VoiceAssistant. 
          If mode === 'phone', it should only show transcripts and not try to 'start' the agent.
        */}
        <VoiceAssistant mode={mode} />
        
        <RoomAudioRenderer />
        <StartAudio label="Click to allow audio playback" />
      </LiveKitRoom>
    );
  }

  // --- RENDER: Landing Page ---
  return (
    <div className="flex flex-col min-h-screen bg-background text-text-main font-sans">
      <Header status="disconnected" />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full text-center space-y-12 relative z-10">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl border border-border">
               <Mic size={40} className="text-primary" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Intelligence Assistant</h2>
              <p className="text-text-muted text-lg">Choose how you'd like to connect.</p>
            </div>
          </div>

          {error && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 text-sm font-medium">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={startWebChat}
              disabled={connecting}
              className="flex items-center justify-center gap-3 py-5 px-6 bg-primary text-white rounded-3xl font-bold hover:bg-primary-hover transition-all shadow-lg hover:-translate-y-1 disabled:opacity-70"
            >
              {connecting && !showPhoneModal ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
              Web Chat
            </button>

            <button
              onClick={() => setShowPhoneModal(true)}
              disabled={connecting}
              className="flex items-center justify-center gap-3 py-5 px-6 bg-white border-2 border-border text-text-main rounded-3xl font-bold hover:bg-zinc-50 transition-all shadow-sm hover:-translate-y-1 disabled:opacity-70"
            >
              <Phone size={20} />
              Phone Call
            </button>
          </div>
        </div>
      </main>

      {/* --- Phone Modal (Themed) --- */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-primary">Call Phone</h3>
              <button onClick={() => setShowPhoneModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-50 border-2 border-border rounded-2xl focus:border-primary focus:ring-0 transition-all text-xl font-mono outline-none"
                  autoFocus
                />
              </div>
              
              <button 
                onClick={startPhoneCall}
                disabled={connecting}
                className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-hover transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-70"
              >
                {connecting ? <Loader2 className="animate-spin" size={20} /> : <Phone size={20} fill="currentColor" />}
                {connecting ? 'Connecting...' : 'Call Me Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}