'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Landscape from '@/components/Landscape';
import InputModal from '@/components/InputModal';
import FloatingCapsules from '@/components/FloatingCapsules';

export default function Home() {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [selectedTime, setSelectedTime] = useState('night');
  const [selectedWeather, setSelectedWeather] = useState('sunny');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capsules, setCapsules] = useState([]);
  const [planeTrigger, setPlaneTrigger] = useState(0);
  const [fireworksTrigger, setFireworksTrigger] = useState(0);

  // Fetch Cuaca Real-Time Arga Makmur
  useEffect(() => {
    const fetchArgaMakmurWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-3.43&longitude=102.25&current_weather=true'
        );
        const data = await res.json();
        if (data && data.current_weather) {
          const code = data.current_weather.weathercode;
          if (code === 0) setSelectedWeather('sunny');
          else if (code === 1 || code === 2) setSelectedWeather('partly_cloudy');
          else if (code === 3) setSelectedWeather('cloudy');
          else if ((code >= 51 && code <= 55) || code === 80) setSelectedWeather('drizzle');
          else if ((code >= 61 && code <= 67) || code === 81 || code === 82) setSelectedWeather('rainy');
          else if (code >= 95) setSelectedWeather('thunderstorm');
        }
      } catch (err) {
        console.log('Gagal ambil data cuaca:', err);
      }
    };

    fetchArgaMakmurWeather();
    const weatherInterval = setInterval(fetchArgaMakmurWeather, 600000);
    return () => clearInterval(weatherInterval);
  }, []);

  // Hitung Otomatis Fase Waktu Berdasarkan Jam
  const getTimePhase = (hour) => {
    if (hour >= 5 && hour < 6) return 'dawn';
    if (hour >= 6 && hour < 8) return 'sunrise';
    if (hour >= 8 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 15) return 'day';
    if (hour >= 15 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 19) return 'sunset';
    if (hour >= 19 && hour < 23) return 'night';
    return 'midnight';
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      const hours = String(currentHour).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);

      setSelectedTime(getTimePhase(currentHour));

      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];

      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      const yearNum = now.getFullYear();

      setDateStr(`${dayName}, ${dayNum} ${monthName} ${yearNum}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateCapsule = (newCapsule) => {
    // Tambahkan kapsul baru ke state lokal lanskap
    setCapsules((prev) => [
      ...prev,
      {
        ...newCapsule,
        id: Date.now(),
        // Memberikan posisi acak di langit
        posX: `${Math.floor(Math.random() * 70) + 12}%`,
        posY: `${Math.floor(Math.random() * 32) + 14}%`,
      },
    ]);

    // Peluncuran mercon otomatis
    setFireworksTrigger((prev) => prev + 1);
  };

  return (
    <main className="fixed inset-0 w-full h-[100dvh] flex flex-col justify-between p-5 sm:p-8 overflow-hidden select-none">
      
      <style jsx>{`
        @keyframes lockAuraFlicker {
          0%, 100% { opacity: 0.25; transform: scale(0.9); filter: blur(10px); }
          50% { opacity: 0.95; transform: scale(1.4); filter: blur(20px); }
        }
        .lock-aura-flicker { animation: lockAuraFlicker 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes lockIconTwinkle {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(254,240,138,0.5)); }
          50% { filter: drop-shadow(0 0 16px rgba(254,240,138,1)); }
        }
        .lock-icon-twinkle { animation: lockIconTwinkle 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* Background Lanskap */}
      <Landscape 
        timeOfDay={selectedTime} 
        weather={selectedWeather}
        triggerPlane={planeTrigger} 
        triggerFireworks={fireworksTrigger}
      />

      {/* LAPISAN KAPSUL MELAYANG DI LANGIT */}
      <FloatingCapsules capsules={capsules} />

      {/* Header Jam & Tanggal */}
      <motion.header 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="z-20 flex justify-between items-start pointer-events-auto"
      >
        <div className="flex flex-col gap-0.5 text-white/80 tracking-widest font-light pointer-events-none">
          <span className="text-base sm:text-xl font-medium text-white/90 font-mono tracking-wider">
            {timeStr}
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase text-white/50 tracking-[0.2em]">
            {dateStr}
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="relative group p-3 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Nitip Kapsul Waktu"
        >
          <div className="lock-aura-flicker absolute w-8 h-8 bg-amber-300/80 rounded-full pointer-events-none" />
          <div className="absolute inset-0 rounded-full bg-amber-100/10 blur-sm scale-90 group-hover:scale-110 transition-all duration-500" />
          <svg className="lock-icon-twinkle relative z-10 w-6 h-6 text-amber-100 group-hover:text-white transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </button>
      </motion.header>

      {/* Modal Popup Input */}
      <InputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCapsule}
      />
    </main>
  );
}