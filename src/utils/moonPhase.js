// Memperhitungkan Fase Bulan secara Real-Time berdasarkan Tanggal Sistem
export function getMoonPhase(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Konversi ke Julian Date
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const julianDate = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  // Siklus Synodic Bulan (~29.53058779 hari)
  const daysSinceNewMoon = (julianDate - 2451549.5) % 29.53058779;
  const normalizedPhase = daysSinceNewMoon < 0 ? daysSinceNewMoon + 29.53058779 : daysSinceNewMoon;

  // Mengembalikan nama fase dan rasio (0 s.d 1)
  // 0 / 29.53 = New Moon, 7.38 = First Quarter, 14.76 = Full Moon, 22.14 = Last Quarter
  const phaseRatio = normalizedPhase / 29.53058779;

  let phaseName = 'Full Moon';
  if (phaseRatio < 0.03 || phaseRatio > 0.97) phaseName = 'New Moon';
  else if (phaseRatio < 0.22) phaseName = 'Waxing Crescent'; // Sabit Awal
  else if (phaseRatio < 0.28) phaseName = 'First Quarter';    // Separuh Awal
  else if (phaseRatio < 0.47) phaseName = 'Waxing Gibbous';   // Cembung Awal
  else if (phaseRatio < 0.53) phaseName = 'Full Moon';        // Purnama
  else if (phaseRatio < 0.72) phaseName = 'Waning Gibbous';   // Cembung Akhir
  else if (phaseRatio < 0.78) phaseName = 'Last Quarter';     // Separuh Akhir
  else phaseName = 'Waning Crescent';                         // Sabit Akhir

  return {
    phaseRatio, // Nilai 0 - 1
    phaseName,
    daysSinceNewMoon,
  };
}
