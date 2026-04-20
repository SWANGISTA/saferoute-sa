import { useEffect, useRef, useState } from 'react';
import { FiPhone, FiXCircle } from 'react-icons/fi';
import { loadAlertHistory, pushAlertHistory } from '../utils/alertStorage';

const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const triggerGlobalSOS = (detail = {}) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('safeRouteSOS', { detail }));
};

const defaultSOSContact = { name: 'Clifford', phone: '0792343333' };

const GlobalSOS = () => {
  const [sosActive, setSosActive] = useState(false);
  const [sosData, setSosData] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [history, setHistory] = useState([]);
  const countdownRef = useRef(null);

  useEffect(() => {
    setHistory(loadAlertHistory());

    const handleSOS = (event) => {
      const detail = event?.detail || {};
      const now = new Date();
      const location = detail.location || 'Soshanguve Block L';
      const coords = detail.coords || { lat: -25.5272, lng: 28.0945 };
      const score = detail.score ?? 42;
      const contact = detail.contact || defaultSOSContact;
      const entry = {
        timestamp: now.toISOString(),
        type: detail.type || 'SOS',
        location,
        coords,
        safetyScore: score
      };
      pushAlertHistory(entry);
      setHistory((current) => [entry, ...current]);
      setSosData({
        ...entry,
        contact,
        time: formatTime(now),
        message: `EMERGENCY ALERT: [User] needs help!\nLocation: ${location}, Pretoria\nTime: ${formatTime(now)}\nSafety Score: ${score}/100 — Moderate Risk\nGoogle Maps: https://maps.google.com/?q=${coords.lat},${coords.lng}`
      });
      setCountdown(60);
      setSosActive(true);
    };

    window.addEventListener('safeRouteSOS', handleSOS);
    return () => {
      window.removeEventListener('safeRouteSOS', handleSOS);
    };
  }, []);

  useEffect(() => {
    if (!sosActive) return;
    setCountdown(60);
    countdownRef.current = window.setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [sosActive]);

  useEffect(() => {
    if (!sosActive) return;
    if (typeof window === 'undefined' || !window.AudioContext) return;
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    const stopTimeout = window.setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, 800);
    return () => {
      window.clearTimeout(stopTimeout);
      oscillator.stop();
      audioCtx.close();
    };
  }, [sosActive]);

  const closeSOS = () => {
    setSosActive(false);
    setCountdown(60);
    setSosData(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => triggerGlobalSOS({ type: 'SOS' })}
        className="fixed bottom-24 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-[0_0_25px_rgba(248,113,113,0.4)] ring-4 ring-rose-500/30 transition hover:scale-105 active:scale-95"
      >
        <span className="text-sm font-bold">SOS</span>
      </button>

      {sosActive && sosData ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#8B0000]/95 px-4 py-6 text-white">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-[#8B0000] p-6 shadow-[0_0_80px_rgba(0,0,0,0.65)]">
            <div className="absolute inset-0 animate-pulse bg-red-900/20" />
            <div className="relative space-y-6">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-rose-200">🚨 SOS ALERT ACTIVATED</p>
                <h2 className="text-3xl font-semibold text-white">Emergency alert sent</h2>
                <p className="text-sm text-slate-200">Your emergency contacts have been notified.</p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#3c0206] p-5 text-sm text-slate-100">
                <p className="font-semibold">📍 Your location: {sosData.location}</p>
                <p className="mt-1 text-slate-300">[{sosData.coords.lat}, {sosData.coords.lng}]</p>
                <p className="mt-3 font-semibold">⏰ Time: {sosData.time}</p>
                <p className="mt-4 text-slate-200">Message sent to:</p>
                <p className="mt-2 font-semibold text-white">👤 {sosData.contact.name} — {sosData.contact.phone}</p>
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-200">"{sosData.message}"</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <a href="tel:10111" className="rounded-3xl bg-white px-5 py-4 text-center font-semibold text-[#8B0000] transition hover:bg-slate-100">
                  📞 CALL 10111 POLICE
                </a>
                <a href="tel:10177" className="rounded-3xl bg-white px-5 py-4 text-center font-semibold text-[#8B0000] transition hover:bg-slate-100">
                  📞 CALL 10177 AMBULANCE
                </a>
                <a href="tel:112" className="rounded-3xl bg-white px-5 py-4 text-center font-semibold text-[#8B0000] transition hover:bg-slate-100">
                  📞 CALL 112 EMERGENCY
                </a>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-[#5a0000] p-4 text-sm text-slate-200">
                <span>Alert will repeat in {countdown} seconds</span>
                <button
                  type="button"
                  onClick={closeSOS}
                  className="rounded-3xl bg-emerald-500 px-5 py-3 font-semibold text-[#0f2027] transition hover:bg-emerald-400"
                >
                  ✅ I AM SAFE — Cancel Alert
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={closeSOS}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <FiXCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default GlobalSOS;
