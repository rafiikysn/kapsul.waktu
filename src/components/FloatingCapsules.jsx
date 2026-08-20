'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingCapsules({ capsules }) {
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  // Filter hanya kapsul publik yang ditampilkan di langit
  const publicCapsules = capsules.filter((c) => c.isPublic);

  const isUnlocked = (unlockDate) => {
    if (!unlockDate) return true;
    return new Date() >= new Date(unlockDate);
  };

  const formatCountdown = (unlockDate) => {
    const diff = new Date(unlockDate) - new Date();
    if (diff <= 0) return 'Siap Dibaca!';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    if (days > 0) return `Terbuka dalam ${days} hari ${hours} jam`;
    return `Terbuka dalam ${hours} jam ${minutes} mnt`;
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      
      {/* RENDER SEMUA LAMPION/BINTANG PESAN DI LANGIT */}
      {publicCapsules.map((capsule, index) => {
        const unlocked = isUnlocked(capsule.unlockDate);
        
        // Penentuan posisi acak tapi stabil berdasarkan index
        const posX = capsule.posX || `${(index * 23 + 15) % 75 + 10}%`;
        const posY = capsule.posY || `${(index * 17 + 12) % 35 + 15}%`;

        return (
          <motion.div
            key={capsule.id || index}
            initial={{ scale: 0, opacity: 0, y: 30 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: [0, -8, 0],
            }}
            transition={{
              scale: { duration: 1.2, ease: 'easeOut' },
              opacity: { duration: 1.2 },
              y: {
                duration: 4 + (index % 3),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.5,
              },
            }}
            style={{ left: posX, top: posY }}
            className="absolute pointer-events-auto cursor-pointer group"
            onClick={() => setSelectedCapsule(capsule)}
          >
            {/* Efek Pendar Lampion/Bintang */}
            <div className={`relative flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full transition-all duration-300 group-hover:scale-125 ${
              unlocked 
                ? 'bg-amber-300/30 shadow-[0_0_20px_6px_rgba(251,191,36,0.6)]' 
                : 'bg-sky-400/20 shadow-[0_0_15px_4px_rgba(56,189,248,0.4)]'
            }`}>
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                unlocked ? 'bg-amber-200 animate-pulse' : 'bg-sky-200'
              }`} />

              {/* Label Nama Kecil Saat Hover */}
              <span className="absolute -bottom-6 whitespace-nowrap text-[9px] font-medium tracking-wider text-white/70 bg-black/60 px-2 py-0.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                {unlocked ? '🔓' : '🔒'} {capsule.senderName}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* MODAL POPUP SAAT LAMPION DIKLIK */}
      <AnimatePresence>
        {selectedCapsule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-slate-950/90 border border-white/15 p-6 rounded-3xl text-white shadow-2xl backdrop-blur-xl"
            >
              <button
                onClick={() => setSelectedCapsule(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white text-sm"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-white/10 border border-white/10 text-amber-200">
                  {isUnlocked(selectedCapsule.unlockDate) ? '🔓 Terbuka' : '🔒 Kapsul Terkunci'}
                </span>
                <span className="text-[10px] text-white/40">
                  {new Date(selectedCapsule.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>

              <h3 className="text-base font-medium text-white/90 mb-1">
                Dari: <span className="text-amber-200 font-semibold">{selectedCapsule.senderName}</span>
              </h3>

              {isUnlocked(selectedCapsule.unlockDate) ? (
                // ISI PESAN JIKA SUDAH TERBUKA
                <div className="mt-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-xs leading-relaxed text-white/90 whitespace-pre-wrap">
                    "{selectedCapsule.message}"
                  </p>
                </div>
              ) : (
                // WAKTU TUNGGU JIKA MASIH TERKUNCI
                <div className="mt-3 p-4 bg-sky-500/10 border border-sky-400/20 rounded-2xl text-center">
                  <p className="text-xs text-sky-200 font-mono mb-1">
                    {formatCountdown(selectedCapsule.unlockDate)}
                  </p>
                  <p className="text-[10px] text-white/50">
                    Pesan rahasia ini baru bisa dibaca oleh umum pada tanggal tujuan.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
