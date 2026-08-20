import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const senderName = body.senderName || 'Someone';
    const message = body.message || '';
    const unlockDate = body.unlockDate || '-';
    const contactInfo = body.contactInfo || 'Tidak Ada';
    const isPublic = body.isPrivate === 'false';

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { success: false, error: 'Token/Chat ID Telegram belum dikonfigurasi di Vercel.' },
        { status: 500 }
      );
    }

    const caption = 
      `📬 *KAPSUL WAKTU BARU MASUK*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Pengirim:* ${senderName}\n` +
      `🔒 *Mode:* ${isPublic ? 'Publik (🌐)' : 'Privat (🔒)'}\n` +
      `⏳ *Tanggal Buka:* \`${unlockDate}\`\n` +
      `🔔 *Pengingat:* ${contactInfo}\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `📝 *Pesan:*\n"${message}"`;

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
    if (!tgData.ok) {
      throw new Error(tgData.description || 'Gagal mengirim pesan ke Telegram');
    }

    return NextResponse.json({
      success: true,
      botToken,
      chatId,
    });

  } catch (error) {
    console.error('Telegram API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses request.' },
      { status: 500 }
    );
  }
}

// HANDLER GET BERSIH TANPA REQUEST BODY
export async function GET() {
  return NextResponse.json({ success: true, capsules: [] });
}
