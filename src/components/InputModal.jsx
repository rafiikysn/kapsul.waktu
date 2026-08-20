'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InputModal({ isOpen, onClose, onSubmit }) {
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [contactInfo, setContactInfo] = useState('');
  const [showNotificationInput, setShowNotificationInput] = useState(false);
  
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  
  // Fitur Tambahan: Pilihan Variasi Efek Pengiriman & State Loading
  const [animationType, setAnimationType] = useState('lampion');
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  const animations = [
    { id: 'lampion', label: 'Lampion', icon: '🏮' },
    { id: 'star', label: 'Bintang', icon: '🌠' },
    { id: 'firefly', label: 'Kunang', icon: '✨' },
  ];

  // Helper konversi Tanggal Lokal (WIB) tanpa offset UTC
  const formatLocalISO = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const handleDurationSelect = (type, value) => {
    setSelectedDuration(type);
    const targetDate = new Date();
    
    if (type !== 'instant') {
      targetDate.setMonth(targetDate.getMonth() + value);
    }

    setUnlockDate(formatLocalISO(targetDate));
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Ukuran media maksimal 25MB');
      return;
    }

    setMedia(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview('video');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;

    setLoading(true);

    const finalUnlockDate = unlockDate || formatLocalISO(new Date());

    try {
      // 1. KIRIM DATA KE TELEGRAM BOT VIA API ENDPOINT
      const formData = new FormData();
      formData.append('senderName', senderName || 'Someone');
      formData.append('message', message);
      formData.append('unlockDate', finalUnlockDate);
      formData.append('contactInfo', contactInfo || 'Tidak Ada');
      formData.append('animationType', animationType);
      formData.append('isPublic', isPublic ? 'true' : 'false');
      if (media) {
        formData.append('file', media);
      }

      const res = await fetch('/api/capsule', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!result.success) {
        console.warn('Telegram Notification Warning:', result.error);
      }
    } catch (err) {
      console.error('Gagal mengirim ke Telegram API:', err);
    } finally {
      setLoading(false);
    }

    // 2. JALANKAN FUNGSI UTAMA WEB (STATE & ANIMASI LANSKAP)
    onSubmit({
      senderName: senderName || 'Someone',
      message,
      unlockDate: finalUnlockDate,
      contactInfo: contactInfo || null,
      media: media || null,
      isPublic,
      animationType,
      createdAt: new Date().toISOString(),
    });

    // Reset Form
    setSenderName('');
    setMessage('');
    setUnlockDate('');
    setSelectedDuration(null);
    setContactInfo('');
    setMedia(null);
    setMediaPreview(null);
    setShowNotificationInput(false);
    setIsPublic(false);
    setAnimationType('lampion');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
          <style jsx>{`
            @keyframes pulsePlaceholder {
              0%, 100% { opacity: 0.35; }
              50% { opacity: 0.85; }
            }
            .animate-placeholder-pulse::placeholder {
              animation: pulsePlaceholder 2.2s ease-in-out infinite;
            }
          `}</style>

          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Kartu Kaca Minimalis */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-sm sm:max-w-md bg-slate-950/80 border border-white/10 p-6 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-white my-auto overflow-hidden"
          >
            {/* Header: Title + Saklar Geser Clean + Close */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-medium tracking-wide text-white/90">
                  Message
                </h2>

                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative flex items-center w-14 h-7 p-0.5 rounded-full cursor-pointer transition-all duration-300 border ${
                    isPublic 
                      ? 'bg-sky-500/20 border-sky-400/40' 
                      : 'bg-white/5 border-white/15'
                  }`}
                  title={isPublic ? 'Mode Publik (🌐)' : 'Mode Privat (🔒)'}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    className={`relative z-10 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md ${
                      isPublic ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {isPublic ? (
                        <motion.span
                          key="public-icon"
                          initial={{ scale: 0.4, rotate: -60, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0.4, rotate: 60, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="text-xs"
                        >
                          🌐
                        </motion.span>
                      ) : (
                        <motion.span
                          key="private-icon"
                          initial={{ scale: 0.4, rotate: 60, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0.4, rotate: -60, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="text-xs"
                        >
                          🔒
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-white/40 hover:text-white text-base p-1 transition"
              >
                ✕
              </button>
            </div>

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Someone"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="animate-placeholder-pulse w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none transition"
              />

              <div className="relative">
                <textarea
                  required
                  rows={4}
                  placeholder="Messages"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="animate-placeholder-pulse w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl p-3.5 pb-10 text-sm text-white placeholder-white/40 focus:outline-none transition resize-none leading-relaxed"
                />

                <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleMediaUpload} className="hidden" />

                <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className={`p-1.5 rounded-lg transition-all ${
                      media
                        ? 'text-amber-300 bg-amber-400/20'
                        : 'text-white/40 hover:text-white hover:bg-white/10'
                    }`}
                    title="Lampirkan Media (Foto/Video s.d 25MB)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNotificationInput((prev) => !prev)}
                    className={`p-1.5 rounded-lg transition-all ${
                      showNotificationInput || contactInfo
                        ? 'text-amber-300 bg-amber-400/20'
                        : 'text-white/40 hover:text-white hover:bg-white/10'
                    }`}
                    title="Aktifkan Pengingat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                </div>
              </div>

              {mediaPreview && (
                <div className="relative border border-white/10 rounded-xl overflow-hidden bg-black/40 h-14 flex items-center px-3 gap-3">
                  {mediaPreview === 'video' ? (
                    <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-200 text-xs">▶</div>
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                  )}
                  <span className="text-xs text-white/70 truncate flex-1 font-mono">{media.name}</span>
                  <button 
                    type="button"
                    onClick={() => { setMedia(null); setMediaPreview(null); }}
                    className="text-xs text-rose-300 hover:text-rose-100 p-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              <AnimatePresence>
                {showNotificationInput && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Telegram (@user) or Email"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="w-full bg-white/5 border border-amber-400/30 rounded-xl px-4 py-2 text-xs text-amber-100 placeholder-white/30 focus:outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Opsi 3 Efek Pengiriman (Lampion, Bintang, Kunang-kunang) */}
              <div>
                <span className="block text-xs text-white/40 mb-1.5 font-light">
                  Animation Style
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {animations.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAnimationType(a.id)}
                      className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                        animationType === a.id
                          ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-md'
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span>{a.icon}</span>
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting Durasi */}
              <div className="mt-0.5">
                <span className="block text-xs text-white/40 mb-1.5 font-light">
                  Duration
                </span>
                
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => handleDurationSelect('instant', 0)}
                    className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                      selectedDuration === 'instant'
                        ? 'bg-white text-black border-white shadow-md'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Instant Send
                  </button>
                  {[
                    { label: '1 Month', key: '1m', value: 1 },
                    { label: '6 Months', key: '6m', value: 6 },
                    { label: '1 Year', key: '1y', value: 12 },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleDurationSelect(item.key, item.value)}
                      className={`py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                        selectedDuration === item.key
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <input
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(e) => {
                    setUnlockDate(e.target.value);
                    setSelectedDuration(null);
                  }}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl px-4 py-2 text-xs text-white/80 focus:outline-none transition [color-scheme:dark]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 bg-white hover:bg-white/90 disabled:opacity-50 text-black font-medium text-xs sm:text-sm rounded-xl shadow-lg active:scale-[0.98] transition-all tracking-wider uppercase"
              >
                {loading ? 'Sending Capsule...' : 'Secure This Capsule'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}