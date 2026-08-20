'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMoonPhase } from '@/utils/moonPhase';

export default function Landscape({ timeOfDay, weather = 'sunny', triggerPlane, triggerFireworks }) {
  const [moonData, setMoonData] = useState({ phaseRatio: 0.5, phaseName: 'Full Moon' });
  const [showAirplane, setShowAirplane] = useState(false);
  const [rocketData, setRocketData] = useState(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [fireworkParticles, setFireworkParticles] = useState(null);
  
  const [lightningFlash, setLightningFlash] = useState(false);
  const [lightningBolt, setLightningBolt] = useState(null);

  useEffect(() => {
    const currentPhase = getMoonPhase(new Date());
    setMoonData(currentPhase);
  }, []);

  // Sambaran Petir Bercabang untuk Thunderstorm
  useEffect(() => {
    if (weather !== 'thunderstorm') {
      setLightningFlash(false);
      setLightningBolt(null);
      return;
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        const strikeOffset = Math.floor(Math.random() * 60) + 20;
        setLightningBolt({
          x: `${strikeOffset}%`,
          scale: 0.85 + Math.random() * 0.45,
        });

        setLightningFlash(true);
        setTimeout(() => setLightningFlash(false), 80);

        setTimeout(() => {
          if (Math.random() > 0.4) {
            setLightningFlash(true);
            setTimeout(() => {
              setLightningFlash(false);
              setLightningBolt(null);
            }, 60);
          } else {
            setLightningBolt(null);
          }
        }, 140);
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [weather]);

  const launchSkyrocket = () => {
    setShowExplosion(false);

    const startX = Math.floor(Math.random() * 60) + 20;
    const targetY = Math.floor(Math.random() * 20) + 18;
    const tiltAngle = (Math.random() - 0.5) * 12;

    setRocketData({
      startX: `${startX}%`,
      targetY: `${targetY}%`,
      tiltAngle,
    });
  };

  const handleRocketReachPeak = () => {
    if (!rocketData) return;
    
    const explosionX = rocketData.startX;
    const explosionY = rocketData.targetY;
    setRocketData(null);

    const palette = [
      ['#f43f5e', '#ffe4e6', '#fbbf24'],
      ['#38bdf8', '#e0f2fe', '#ffffff'],
      ['#34d399', '#ecfdf5', '#fef08a'],
      ['#c084fc', '#fae8ff', '#ffffff'],
      ['#fb923c', '#fef3c7', '#ef4444'],
    ];
    const selectedPalette = palette[Math.floor(Math.random() * palette.length)];

    const newParticles = Array.from({ length: 32 }).map((_, i) => {
      const angle = (i / 32) * 360 + Math.random() * 10;
      const distance = 65 + Math.random() * 110;
      const rad = (angle * Math.PI) / 180;
      return {
        id: i,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        color: selectedPalette[Math.floor(Math.random() * selectedPalette.length)],
        scale: 0.5 + Math.random() * 1.15,
        duration: 1.0 + Math.random() * 0.75,
      };
    });

    setFireworkParticles({
      x: explosionX,
      y: explosionY,
      items: newParticles,
    });
    setShowExplosion(true);
  };

  useEffect(() => {
    if (triggerPlane > 0) {
      setShowAirplane(false);
      setTimeout(() => setShowAirplane(true), 100);
    }
  }, [triggerPlane]);

  useEffect(() => {
    if (triggerFireworks > 0) {
      launchSkyrocket();
    }
  }, [triggerFireworks]);

  const skyGradients = {
    dawn: 'from-[#0a1128] via-[#1c2541] to-[#475b74]',
    sunrise: 'from-[#1a0c2e] via-[#633a6e] to-[#e88873]',
    morning: 'from-[#65a0fd] via-[#94beff] to-[#e8f1ff]',
    day: 'from-[#3b82f6] via-[#60a5fa] to-[#93c5fd]',
    afternoon: 'from-[#2a1b40] via-[#8b4468] to-[#f39c6b]',
    sunset: 'from-[#1e1e38] via-[#7b3252] to-[#f26a4f]',
    night: 'from-[#0b132b] via-[#1c2541] to-[#1e293b]',
    midnight: 'from-[#03071e] via-[#0f172a] to-[#182232]',
  };

  const sunPositions = {
    dawn:      { x: '12%', y: '65%', opacity: 0.9 },
    sunrise:   { x: '25%', y: '32%', opacity: 1 },
    morning:   { x: '42%', y: '16%', opacity: 1 },
    day:       { x: '50%', y: '10%', opacity: 1 },
    afternoon: { x: '68%', y: '22%', opacity: 1 },
    sunset:    { x: '88%', y: '75%', opacity: 0.8 },
  };

  const moonPositions = {
    night:     { x: '75%', y: '18%', opacity: 1 },
    midnight:  { x: '82%', y: '25%', opacity: 0.85 },
    dawn:      { x: '92%', y: '70%', opacity: 0.3 },
  };

  const isDayTime = ['dawn', 'sunrise', 'morning', 'day', 'afternoon', 'sunset'].includes(timeOfDay);
  const isNightTime = ['night', 'midnight', 'dawn'].includes(timeOfDay);

  const sunPos = sunPositions[timeOfDay] || sunPositions.sunset;
  const moonPos = moonPositions[timeOfDay] || moonPositions.night;

  const r = 50;
  const phase = moonData.phaseRatio;
  const sweep = Math.cos(phase * 2 * Math.PI) * r;
  const isWaxing = phase <= 0.5;

  const moonPath = isWaxing
    ? `M 50,0 A 50,50 0 0,1 50,100 A ${Math.abs(sweep)},50 0 0,${sweep > 0 ? 0 : 1} 50,0`
    : `M 50,0 A 50,50 0 0,0 50,100 A ${Math.abs(sweep)},50 0 0,${sweep > 0 ? 1 : 0} 50,0`;

  const isStormy = ['rainy', 'thunderstorm'].includes(weather);
  const isRainyWeather = ['drizzle', 'rainy', 'thunderstorm'].includes(weather);
  const isPartlyCloudy = weather === 'partly_cloudy';

  // LOGIKA API UNGGUN: MATI SAAT SIANG ATAU HUJAN/BADAI
  const isDayOffTime = ['morning', 'day', 'afternoon'].includes(timeOfDay);
  const isFireActive = !isDayOffTime && !isRainyWeather;

  return (
    <div className={`fixed inset-0 w-full h-[100dvh] bg-gradient-to-b ${skyGradients[timeOfDay] || skyGradients.night} transition-all duration-[2500ms] ease-in-out overflow-hidden select-none pointer-events-none -z-10`}>
      
      {/* Overlay Kilatan Petir */}
      {lightningFlash && (
        <div className="absolute inset-0 bg-white/40 z-30 transition-opacity duration-75" />
      )}

      {/* Overlay Langit Gelap Mendung/Badai */}
      {['cloudy', 'drizzle', 'rainy', 'thunderstorm'].includes(weather) && (
        <div className={`absolute inset-0 z-10 transition-opacity duration-1000 ${
          weather === 'cloudy' ? 'bg-slate-950/25' : weather === 'drizzle' ? 'bg-slate-950/40' : 'bg-slate-950/65'
        }`} />
      )}

      <style jsx>{`
        @keyframes trueTwinkle {
          0%, 100% { opacity: 0; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .star-true {
          animation: trueTwinkle var(--duration, 4s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
        @keyframes sparkFlicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.6); }
        }
        .spark-flicker {
          animation: sparkFlicker 0.15s ease-in-out infinite alternate;
        }

        @keyframes tailBurnLive {
          0% { height: 50px; filter: blur(0.2px) drop-shadow(0 0 3px #fbbf24); opacity: 1; }
          30% { height: 75px; filter: blur(0.3px) drop-shadow(0 0 5px #fff); opacity: 0.7; }
          60% { height: 60px; filter: blur(0.2px) drop-shadow(0 0 4px #fbbf24); opacity: 0.9; }
          100% { height: 70px; filter: blur(0.3px) drop-shadow(0 0 5px #fef3c7); opacity: 0.8; }
        }
        .rocket-tail-live {
          animation: tailBurnLive 0.12s infinite alternate;
          transform-origin: top center;
        }

        /* PARALLAX DRIFT AWAN */
        @keyframes floatCloudLoop1 { 0% { transform: translateX(-35vw); } 100% { transform: translateX(135vw); } }
        @keyframes floatCloudLoop2 { 0% { transform: translateX(-40vw); } 100% { transform: translateX(130vw); } }
        @keyframes floatCloudLoop3 { 0% { transform: translateX(-30vw); } 100% { transform: translateX(140vw); } }

        .cloud-drift-1 { animation: floatCloudLoop1 48s linear infinite; }
        .cloud-drift-2 { animation: floatCloudLoop2 75s linear infinite; animation-delay: -25s; }
        .cloud-drift-3 { animation: floatCloudLoop3 105s linear infinite; animation-delay: -60s; }
        .cloud-drift-4 { animation: floatCloudLoop1 60s linear infinite; animation-delay: -15s; }
        .cloud-drift-5 { animation: floatCloudLoop2 90s linear infinite; animation-delay: -45s; }

        /* HUJAN JATUH DARI PERUT AWAN */
        @keyframes rainFallFromCloud {
          0% { transform: translateY(0) translateX(0); opacity: 0.9; }
          100% { transform: translateY(90vh) translateX(-30px); opacity: 0; }
        }
        .rain-drop-cloud-child {
          animation: rainFallFromCloud var(--speed, 0.6s) linear infinite;
          animation-delay: var(--delay, 0s);
          will-change: transform;
        }

        /* ANIMASI API UNGGUN MENARI */
        @keyframes fireFlicker {
          0%, 100% { transform: scale(1) rotate(-2deg); filter: drop-shadow(0 0 6px #f59e0b); }
          50% { transform: scale(1.15, 0.9) rotate(3deg); filter: drop-shadow(0 0 12px #ef4444); }
        }
        .fire-flame-flicker {
          animation: fireFlicker 0.25s ease-in-out infinite alternate;
          transform-origin: bottom center;
        }

        @keyframes fireGlowPulse {
          0%, 100% { opacity: 0.6; transform: scale(0.9); }
          50% { opacity: 0.95; transform: scale(1.2); }
        }
        .fire-glow-pulse { animation: fireGlowPulse 1.8s ease-in-out infinite; }
      `}</style>

      {/* Bintang-bintang */}
      {isNightTime && !isStormy && (
        <div className="absolute inset-0">
          <div className="star-true absolute top-[10%] left-[10%] w-1.5 h-1.5 bg-white rounded-full" style={{ '--duration': '5s', '--delay': '0s' }} />
          <div className="star-true absolute top-[25%] left-[30%] w-1 h-1 bg-amber-100 rounded-full" style={{ '--duration': '7s', '--delay': '2s' }} />
          <div className="star-true absolute top-[40%] left-[15%] w-1.5 h-1.5 bg-white rounded-full" style={{ '--duration': '6s', '--delay': '1s' }} />
          <div className="star-true absolute top-[15%] left-[50%] w-1 h-1 bg-white rounded-full" style={{ '--duration': '6.5s', '--delay': '3s' }} />
          <div className="star-true absolute top-[30%] left-[70%] w-1.5 h-1.5 bg-amber-50 rounded-full" style={{ '--duration': '4.8s', '--delay': '1.5s' }} />
          <div className="star-true absolute top-[20%] left-[85%] w-1.5 h-1.5 bg-white rounded-full" style={{ '--duration': '5.5s', '--delay': '0.9s' }} />
        </div>
      )}

      {/* SISTEM AWAN ORGANIK */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* AWAN 1 */}
        <div className={`cloud-drift-1 absolute top-[8%] left-0 transition-all duration-1000 ${
          isStormy ? 'text-slate-900 opacity-95' : isNightTime ? 'opacity-45 text-slate-200' : isPartlyCloudy ? 'opacity-70 text-white' : 'opacity-60 text-white'
        }`}>
          <div className="relative">
            <svg className="w-60 h-24 sm:w-96 sm:h-36 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" viewBox="0 0 200 80" fill="currentColor">
              <path d="M20 60 C10 60 0 50 0 40 C0 30 15 25 25 28 C30 15 50 10 70 20 C80 5 110 0 135 18 C150 10 175 15 180 32 C195 32 205 45 195 60 Z" />
            </svg>

            {lightningBolt && (
              <div 
                className="absolute top-[60%] left-[40%] z-20 pointer-events-none drop-shadow-[0_0_25px_rgba(255,255,255,1)]"
                style={{ transform: `scale(${lightningBolt.scale})` }}
              >
                <svg className="w-20 h-56 text-amber-100" viewBox="0 0 100 240" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M50 0 L35 80 L60 90 L20 180 L45 185 L10 240 M35 80 L15 110 M20 180 L5 200" />
                </svg>
              </div>
            )}

            {isRainyWeather && (
              <div className="absolute bottom-2 left-6 right-6 h-0">
                {Array.from({ length: isStormy ? 22 : 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rain-drop-cloud-child absolute bg-gradient-to-b from-sky-200/50 via-sky-100/90 to-white"
                    style={{
                      left: `${(i / (isStormy ? 22 : 8)) * 100}%`,
                      width: weather === 'drizzle' ? '1px' : '1.5px',
                      height: weather === 'drizzle' ? '14px' : '26px',
                      '--speed': `${0.4 + Math.random() * 0.3}s`,
                      '--delay': `${-Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AWAN 2 */}
        <div className={`cloud-drift-2 absolute top-[20%] left-0 transition-all duration-1000 ${
          isStormy ? 'text-slate-950 opacity-95' : isNightTime ? 'opacity-40 text-slate-300' : isPartlyCloudy ? 'opacity-65 text-white' : 'opacity-50 text-white'
        }`}>
          <div className="relative">
            <svg className="w-72 h-18 sm:w-[32rem] sm:h-28 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" viewBox="0 0 260 50" fill="currentColor">
              <path d="M10 40 Q30 20 70 28 Q110 8 160 22 Q200 12 235 28 Q250 25 255 40 Z" />
            </svg>

            {isRainyWeather && (
              <div className="absolute bottom-2 left-8 right-8 h-0">
                {Array.from({ length: isStormy ? 26 : 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="rain-drop-cloud-child absolute bg-gradient-to-b from-sky-200/50 via-sky-100/90 to-white"
                    style={{
                      left: `${(i / (isStormy ? 26 : 10)) * 100}%`,
                      width: weather === 'drizzle' ? '1px' : '1.5px',
                      height: weather === 'drizzle' ? '14px' : '26px',
                      '--speed': `${0.35 + Math.random() * 0.3}s`,
                      '--delay': `${-Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AWAN 3 */}
        <div className={`cloud-drift-3 absolute top-[30%] left-0 transition-all duration-1000 ${
          isStormy ? 'text-slate-800 opacity-90' : isNightTime ? 'opacity-35 text-slate-400' : isPartlyCloudy ? 'opacity-55 text-white' : 'opacity-45 text-white'
        }`}>
          <div className="relative">
            <svg className="w-56 h-20 sm:w-80 sm:h-28 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" viewBox="0 0 160 60" fill="currentColor">
              <path d="M15 45 C5 45 0 35 10 25 C20 15 45 20 55 12 C75 2 105 10 115 22 C130 18 150 28 145 45 Z" />
            </svg>

            {isRainyWeather && (
              <div className="absolute bottom-2 left-4 right-4 h-0">
                {Array.from({ length: isStormy ? 20 : 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rain-drop-cloud-child absolute bg-gradient-to-b from-sky-200/50 via-sky-100/90 to-white"
                    style={{
                      left: `${(i / (isStormy ? 20 : 6)) * 100}%`,
                      width: weather === 'drizzle' ? '1px' : '1.5px',
                      height: weather === 'drizzle' ? '14px' : '26px',
                      '--speed': `${0.42 + Math.random() * 0.3}s`,
                      '--delay': `${-Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AWAN EXTRA 4 & 5 */}
        {(isStormy || isPartlyCloudy) && (
          <>
            <div className={`cloud-drift-4 absolute top-[5%] left-0 transition-all duration-1000 ${
              isStormy ? 'text-slate-900 opacity-90' : 'text-white opacity-50'
            }`}>
              <div className="relative">
                <svg className="w-80 h-28 sm:w-[36rem] sm:h-36 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" viewBox="0 0 260 50" fill="currentColor">
                  <path d="M10 40 Q30 20 70 28 Q110 8 160 22 Q200 12 235 28 Q250 25 255 40 Z" />
                </svg>
              </div>
            </div>

            <div className={`cloud-drift-5 absolute top-[18%] left-0 transition-all duration-1000 ${
              isStormy ? 'text-slate-950 opacity-95' : 'text-white opacity-45'
            }`}>
              <div className="relative">
                <svg className="w-64 h-24 sm:w-96 sm:h-32 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" viewBox="0 0 200 80" fill="currentColor">
                  <path d="M20 60 C10 60 0 50 0 40 C0 30 15 25 25 28 C30 15 50 10 70 20 C80 5 110 0 135 18 C150 10 175 15 180 32 C195 32 205 45 195 60 Z" />
                </svg>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Mercon & Kembang Api */}
      {rocketData && (
        <motion.div
          initial={{ left: rocketData.startX, top: '85%', opacity: 1 }}
          animate={{ left: rocketData.startX, top: rocketData.targetY, opacity: 1 }}
          transition={{ duration: 0.95, ease: [0.15, 0.85, 0.35, 1] }}
          onAnimationComplete={handleRocketReachPeak}
          style={{ transform: `rotate(${rocketData.tiltAngle}deg)` }}
          className="absolute z-0 flex flex-col items-center -translate-x-1/2 pointer-events-none"
        >
          <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_14px_6px_rgba(255,255,255,1)]" />
          <div className="rocket-tail-live w-[2.5px] bg-gradient-to-t from-transparent via-amber-300 to-white" />
        </motion.div>
      )}

      {showExplosion && fireworkParticles && (
        <div className="absolute z-0 pointer-events-none" style={{ left: fireworkParticles.x, top: fireworkParticles.y }} >
          <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: [0, 3.8, 0], opacity: [1, 0.9, 0] }} transition={{ duration: 0.45, ease: 'easeOut' }} className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full blur-md shadow-[0_0_60px_25px_rgba(255,255,255,1)]" />
          {fireworkParticles.items.map((p) => (
            <motion.div key={p.id} initial={{ x: 0, y: 0, opacity: 1, scale: p.scale }} animate={{ x: p.x, y: p.y + 24, opacity: [1, 0.9, 0], scale: [p.scale, p.scale * 1.15, 0], }} transition={{ duration: p.duration, ease: [0.16, 1, 0.3, 1] }} style={{ backgroundColor: p.color }} className="spark-flicker absolute -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
          ))}
        </div>
      )}

      {/* Animasi Pesawat Uji Coba */}
      {showAirplane && (
        <motion.div key={triggerPlane} initial={{ x: '-10vw', y: '22vh', opacity: 0 }} animate={{ x: '110vw', y: '22vh', opacity: [0, 0.85, 0.85, 0] }} transition={{ duration: 16, ease: 'linear' }} onAnimationComplete={() => setShowAirplane(false)} className="absolute z-0 flex items-center pointer-events-none" >
          <div className="w-28 sm:w-40 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-white/60 blur-[0.3px]" />
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 rotate-90 -ml-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </motion.div>
      )}

      {/* Matahari & Bulan */}
      <AnimatePresence> {isDayTime && ( <motion.div key="sun" initial={{ left: '5%', top: '80%', opacity: 0 }} animate={{ left: sunPos.x, top: sunPos.y, opacity: sunPos.opacity }} exit={{ left: '95%', top: '90%', opacity: 0 }} transition={{ duration: 2.2, ease: [0.25, 1, 0.5, 1] }} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full w-14 h-14 sm:w-22 sm:h-22 bg-yellow-100/90 shadow-[0_0_90px_35px_rgba(255,223,0,0.25)] z-0" /> )} </AnimatePresence>
      <AnimatePresence> {isNightTime && ( <motion.div key="moon" initial={{ left: '60%', top: '85%', opacity: 0 }} animate={{ left: moonPos.x, top: moonPos.y, opacity: moonPos.opacity }} exit={{ left: '98%', top: '90%', opacity: 0 }} transition={{ duration: 2.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }} className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-22 sm:h-22 z-0 flex items-center justify-center" > <div className="absolute inset-0 rounded-full bg-amber-100/20 blur-xl scale-125" /> <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,250,220,0.85)]"> <circle cx="50" cy="50" r="50" fill="#1c2541" opacity="0.3" /> <path d={moonPath} fill="#fef3c7" /> </svg> </motion.div> )} </AnimatePresence>

      {/* PERBUKITAN + ELEMEN TANAH TERDEPAN */}
      <div className="absolute inset-0 z-10">
        
        {/* Bukit Latar Belakang 1 */}
        <div className="absolute bottom-0 w-full h-[42vh] sm:h-[58vh] opacity-25">
          <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
            <path fill="#0d1b2a" d="M0,192 C360,100 720,240 1080,140 C1260,90 1380,130 1440,120 L1440,320 L0,320 Z"></path>
          </svg>
        </div>

        {/* Bukit Latar Belakang 2 */}
        <div className="absolute bottom-0 w-full h-[32vh] sm:h-[44vh] opacity-50">
          <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
            <path fill="#152238" d="M0,210 C400,120 800,220 1200,150 L1440,180 L1440,320 L0,320 Z"></path>
          </svg>
        </div>

        {/* Bukit Tengah */}
        <div className="absolute bottom-0 w-full h-[22vh] sm:h-[32vh] opacity-75">
          <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
            <path fill="#0d1b2a" d="M0,180 C480,100 960,220 1440,140 L1440,320 L0,320 Z"></path>
          </svg>
        </div>

        {/* BUKIT TERDEPAN TERMASUK POHON & PONDOK KAYU + API UNGGUN */}
        <div className="absolute bottom-0 w-full h-[14vh] sm:h-[20vh] z-20">
          
          {/* 1. POHON PINUS */}
          <div className="absolute left-[3%] sm:left-[5%] bottom-[42%] z-30 flex items-end gap-1 opacity-95">
            <svg className="w-10 h-16 sm:w-14 sm:h-24 text-[#08101d] drop-shadow-md" viewBox="0 0 100 160" fill="currentColor">
              <polygon points="50,0 20,50 35,50 10,90 30,90 0,130 100,130 70,90 90,90 65,50 80,50" />
              <rect x="42" y="130" width="16" height="30" />
            </svg>

            <svg className="w-7 h-11 sm:w-10 sm:h-16 text-[#08101d] -ml-2 drop-shadow-md mb-[7%]" viewBox="0 0 100 160" fill="currentColor">
              <polygon points="50,0 20,50 35,50 10,90 30,90 0,130 100,130 70,90 90,90 65,50 80,50" />
              <rect x="42" y="130" width="16" height="30" />
            </svg>
          </div>

          {/* 2. PONDOK KAYU + CEROBONG MENATU + ASAP BERJIWA BUMBUNG TINGGI */}
          <div className="absolute right-[6%] sm:right-[10%] bottom-[50%] z-30 flex items-end gap-3">
            
            <div className="relative flex flex-col items-center">
              
              {/* ANIMASI ASAP DINAMIK & BERJIWA (MEMBERI KESAN HIDUP) */}
              <div className="absolute top-[10%] right-[22%] w-2 h-2 pointer-events-none flex items-center justify-center">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0, x: 0, scale: 0.25, opacity: 0 }}
                    animate={{
                      y: [0, -25, -60, -95],
                      x: [0, 4, -6, 12],
                      scale: [0.25, 0.9, 1.8, 2.8],
                      opacity: [0, 0.6, 0.35, 0],
                    }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      delay: i * 1.1,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="absolute w-2.5 h-2.5 rounded-full bg-white/50 blur-[1px]"
                  />
                ))}
              </div>

              {/* SILUET PONDOK */}
              <svg className="w-12 h-10 sm:w-16 sm:h-14 text-[#08101d] drop-shadow-md" viewBox="0 0 60 50" fill="currentColor">
                <rect x="42" y="8" width="5" height="18" />
                <polygon points="30,8 2,28 58,28" />
                <rect x="8" y="28" width="44" height="22" />
                {isNightTime && (
                  <rect x="15" y="34" width="8" height="8" fill="#fef08a" className="opacity-90 blur-[0.3px]" />
                )}
                <rect x="34" y="34" width="8" height="16" fill="#030712" />
              </svg>
            </div>

            {/* API UNGGUN */}
            <div className="relative flex flex-col items-center mb-1 min-h-[24px] justify-end">
              
              <AnimatePresence>
                {isFireActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="fire-glow-pulse absolute -top-3 w-10 h-10 rounded-full bg-amber-400/50 blur-md z-0" />

                    <svg className="fire-flame-flicker w-4 h-5 sm:w-5 sm:h-6 text-amber-400 relative z-10" viewBox="0 0 20 24" fill="currentColor">
                      <path d="M10 0 C13 6 18 9 18 15 C18 19.4 14.4 23 10 23 C5.6 23 2 19.4 2 15 C2 10 7 7 10 0 Z" />
                      <path d="M10 8 C11.5 11 14 13 14 16 C14 18.2 12.2 20 10 20 C7.8 20 6 18.2 6 16 C6 13 8.5 11.5 10 8 Z" fill="#fef08a" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              <svg className="w-5 h-1.5 text-[#030712] relative z-10 -mt-0.5" viewBox="0 0 20 6" fill="currentColor">
                <rect x="1" y="2" width="18" height="3" rx="1" transform="rotate(-10 10 3)" />
                <rect x="1" y="2" width="18" height="3" rx="1" transform="rotate(10 10 3)" />
              </svg>
            </div>

          </div>

          {/* Garis Bukit Terdepan */}
          <svg viewBox="0 0 1440 320" className="w-full h-full relative z-20" preserveAspectRatio="none">
            <path fill="#08101d" d="M0,140 C360,220 1080,120 1440,160 L1440,320 L0,320 Z"></path>
          </svg>
        </div>

      </div>

    </div>
  );
}