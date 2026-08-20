import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const senderName = formData.get('senderName') || 'Someone';
    const message = formData.get('message') || '';
    const unlockDate = formData.get('unlockDate') || '-';
    const contactInfo = formData.get('contactInfo') || 'Tidak Ada';
    const animationType = formData.get('animationType') || 'lampion';
    const isPublic = formData.get('isPrivate') === 'false';
    const file = formData.get('file');

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { success: false, error: 'Token/Chat ID Telegram belum dikonfigurasi di Server.' },
        { status: 500 }
      );
    }

    // Format Pesan untuk Telegram
    const caption = 
      `📬 *KAPSUL WAKTU BARU MASUK*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Pengirim:* ${senderName}\n` +
      `🔒 *Mode:* ${isPublic ? 'Publik (🌐)' : 'Privat (🔒)'}\n` +
      `⏳ *Tanggal Buka:* \`${unlockDate}\`\n` +
      `🔔 *Pengingat:* ${contactInfo}\n` +
      `✨ *Efek Animasi:* ${animationType.toUpperCase()}\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `📝 *Pesan:*\n"${message}"`;

    // Jika ada lampiran media (Foto/Video/File)
    if (file && typeof file === 'object' && file.size > 0) {
      const tgFormData = new FormData();
      tgFormData.append('chat_id', chatId);
      tgFormData.append('caption', caption);
      tgFormData.append('parse_mode', 'Markdown');
      
      // PAKAI sendDocument AGAR METADATA & EXIF FOTO/VIDEO TIDAK DIKOMPRES/DIHAPUS
      tgFormData.append('document', file, file.name);

      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
        method: 'POST',
        body: tgFormData,
      });

      const tgData = await tgRes.json();
      if (!tgData.ok) throw new Error(tgData.description);
    } else {
      // Jika hanya pesan teks saja
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: caption,
          parse_mode: 'Markdown',
        }),
      });

      const tgData = await tgRes.json();
      if (!tgData.ok) throw new Error(tgData.description);
    }

    return NextResponse.json({ success: true, message: 'Kapsul berhasil terkirim ke Telegram!' });

  } catch (error) {
    console.error('Telegram API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal terhubung ke Telegram.' },
      { status: 500 }
    );
  }
}
