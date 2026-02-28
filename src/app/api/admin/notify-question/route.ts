import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { subject, category, message, userName, userEmail } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
        }

        // Admin ve Super Admin emaillerini bulmak için bypass yetkili client kullanıyoruz
        const { createClient } = require('@supabase/supabase-js');
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: admins } = await adminSupabase
            .from('profiles')
            .select('email, full_name, role')
            .in('role', ['admin', 'super_admin']);

        const adminEmails = (admins || [])
            .map((admin: any) => admin.email)
            .filter(Boolean);

        if (adminEmails.length === 0) {
            return NextResponse.json({ message: 'Hiç admin bulunamadı.' }, { status: 200 });
        }

        const categoryMap: Record<string, string> = {
            general: 'Genel Sorular',
            technical: 'Teknik Sorun',
            academic: 'Akademik',
            other: 'Diğer Sorular'
        };

        const displayCategory = categoryMap[category] || category || 'Belirtilmemiş';

        const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6366f1;">🔔 Yeni Bir Öğrenci Sorusu Geldi!</h2>
                <p><strong>Öğrenci:</strong> ${userName || 'İsimsiz Öğrenci'} (${userEmail || 'Bilinmiyor'})</p>
                <p><strong>Kategori:</strong> ${displayCategory}</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                    <h3 style="margin-top: 0;">Konu: ${subject}</h3>
                    <p style="margin-bottom: 0; white-space: pre-wrap;">${message}</p>
                </div>
                
                <p>Soruyu cevaplamak için admin paneline giriş yapınız.</p>
                
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kafarahat.xyz'}/admin/sorular" 
                   style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                   Panel Üzerinden Cevapla
                </a>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px; margin-bottom: 20px;" />
                <p style="font-size: 12px; color: #6b7280;">
                    KafaRahat Sistem Bildirimi
                </p>
            </div>
        `;

        // Send to all admins in chunks
        const CHUNK_SIZE = 50;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < adminEmails.length; i += CHUNK_SIZE) {
            const chunk = adminEmails.slice(i, i + CHUNK_SIZE) as string[];

            const promises = chunk.map(email => sendEmail({
                to: email,
                subject: `🔔 Yeni Soru Geldi: ${subject}`,
                html: emailHtml
            }));

            const results = await Promise.all(promises);

            results.forEach(res => {
                if (res.success) successCount++;
                else failCount++;
            });
        }

        return NextResponse.json({ success: true, message: 'Yöneticilere e-posta gönderildi.' }, { status: 200 });

    } catch (error: any) {
        console.error('Notify question error:', error);
        return NextResponse.json({ error: error.message || 'Hata oluştu' }, { status: 500 });
    }
}
