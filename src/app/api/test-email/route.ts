import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function GET() {
    try {
        console.log('Test email route triggered');

        // Use the verified email for testing to ensure it works in Sandbox
        const testEmail = 'kadarasopain9999@gmail.com';

        const result = await sendEmail({
            to: testEmail,
            subject: 'Resend Test Mail 🚀',
            html: `
                <h1>Resend Entegrasyon Testi</h1>
                <p>Bu mail, Resend API entegrasyonunun başarılı olduğunu doğrulamak için gönderilmiştir.</p>
                <p><strong>Zaman:</strong> ${new Date().toLocaleString('tr-TR')}</p>
                <p>Eğer bu maili görüyorsanız, sistem çalışıyor demektir!</p>
            `
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Test email sent successfully',
                data: result.data
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Failed to send test email',
                error: result.error
            }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: String(error)
        }, { status: 500 });
    }
}
