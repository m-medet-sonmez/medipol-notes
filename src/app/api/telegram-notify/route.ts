import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Mesaj içeriği eksik.' }, { status: 400 });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error('Telegram bot credentials missing.');
            return NextResponse.json({ error: 'Telegram ayarları eksik.' }, { status: 500 });
        }

        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML', // Allows bolding/italics in the message
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Telegram API Error:', errorData);
            return NextResponse.json({ error: 'Telegram servisine ulaşılamadı.', details: errorData }, { status: response.status });
        }

        return NextResponse.json({ success: true, message: 'Bildirim başarıyla gönderildi.' }, { status: 200 });

    } catch (error: any) {
        console.error('Telegram Notify Error:', error);
        return NextResponse.json({ error: error.message || 'Bilinmeyen bir hata oluştu.' }, { status: 500 });
    }
}
