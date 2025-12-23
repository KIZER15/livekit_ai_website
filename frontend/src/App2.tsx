import { useState, useCallback } from 'react';
import { LiveKitRoom, RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import VoiceAssistant from './components1_v2/VoiceAssistant';
import { Header } from './components1_v2/Header';
import { Loader2, AlertCircle, Mic, Phone, X } from 'lucide-react';

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

  const getLiveKitToken = async (identityPrefix: string, roomName?: string) => {
    const userId = `${identityPrefix}_${Math.floor(Math.random() * 10000)}`;
    let url = `${TOKEN_ENDPOINT}?name=${userId}`;
    if (roomName) url += `&room=${encodeURIComponent(roomName)}`;
    
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error("Could not get LiveKit access token");
    return await response.text();
  };

  const startWebChat = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      // For Web Chat, we don't pass a roomName, so the backend creates a fresh one
      const accessToken = await getLiveKitToken('web_user');
      setToken(accessToken);
      setMode('web');
    } catch (err: any) {
      setError(err.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  }, []);

  const startPhoneCall = async () => {
    if (!phoneNumber || phoneNumber.length < 5) {
      setError("Please enter a valid phone number");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const callRes = await fetch(`${BACKEND_URL}/api/testCall/${encodeURIComponent(phoneNumber)}`);
      const callData = await callRes.json();
      if (callData.status !== 0) throw new Error(callData.message || "Call failed");

      // Join the specific room created for the phone call
      const accessToken = await getLiveKitToken('monitor_user', callData.roomName);
      setToken(accessToken);
      setMode('phone');
      setShowPhoneModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to start phone session");
    } finally {
      setConnecting(false);
    }
  };

  if (token && mode) {
    return (
      <LiveKitRoom
        video={false}
        audio={mode === 'web'} // Browser Mic ON for web, OFF for phone
        token={token}
        serverUrl={LIVEKIT_URL}
        connect={true}
        className="flex flex-col h-screen bg-[#f8f9fa]"
        onDisconnected={() => { setToken(''); setMode(null); }}
      >
        <VoiceAssistant mode={mode} />
        <RoomAudioRenderer />
        <StartAudio label="Click to allow audio playback" />
      </LiveKitRoom>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-main font-sans">
      <Header status="disconnected" />
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-xl w-full text-center space-y-12 z-10">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl border border-border">
               <Mic size={40} className="text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-primary">Intelligence Assistant</h2>
          </div>

          {error && <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <button onClick={startWebChat} disabled={connecting} className="flex items-center justify-center gap-3 py-5 px-6 bg-primary text-white rounded-3xl font-bold hover:shadow-lg transition-all">
              {connecting && !showPhoneModal ? <Loader2 className="animate-spin" /> : <Mic />} Web Chat
            </button>
            <button onClick={() => setShowPhoneModal(true)} className="flex items-center justify-center gap-3 py-5 px-6 bg-white border-2 border-border text-text-main rounded-3xl font-bold hover:bg-zinc-50 transition-all">
              <Phone /> Phone Call
            </button>
          </div>
        </div>
      </main>

      {showPhoneModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl border border-border">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-primary">Call Phone</h3>
              <button onClick={() => setShowPhoneModal(false)} className="p-2"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-6 py-4 bg-zinc-50 border-2 border-border rounded-2xl text-xl outline-none focus:border-primary" />
              <button onClick={startPhoneCall} disabled={connecting} className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3">
                {connecting ? <Loader2 className="animate-spin" /> : <Phone />} Call Me Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}