import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Yetki Kontrolü
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Bu işlem için yetki gerekiyor' }, { status: 403 });
        }

        const body = await req.json();
        const { studentEmail, studentName, unitName, isCompleted, adminNote } = body;

        if (!studentEmail || !studentName || !unitName) {
            return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
        }

        // Öğrenciye Gönderilecek E-posta İçeriği
        const actionText = isCompleted ? 'tamamlandı olarak işaretlendi ✅' : 'beklemeye alındı 🔄';
        const color = isCompleted ? '#22c55e' : '#eab308';
        const noteText = adminNote ? `<p><strong>Öğretmen / Admin Notu:</strong> ${adminNote}</p>` : '';

        const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: ${color};">ESP Trust - Ünite Güncellemesi</h2>
                <p>Merhaba <strong>${studentName}</strong>,</p>
                <p>ESP Trust programındaki <strong>${unitName}</strong> ünitenizin durumu yönetici tarafından <strong>${actionText}</strong>.</p>
                
                ${noteText}
                
                <p>Başarı durumunuzu panelinizden veya site üzerinden takip edebilirsiniz. Harika gidiyorsunuz, başarılar!</p>
                
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kafarahat.xyz'}/giris" 
                   style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                   Sisteme Giriş Yap
                </a>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px; margin-bottom: 20px;" />
                <p style="font-size: 12px; color: #6b7280;">
                    KafaRahat Destek Ekibi
                </p>
            </div>
        `;

        const response = await sendEmail({
            to: studentEmail,
            subject: `🎓 ESP Trust Güncellemesi: ${unitName} - ${isCompleted ? 'Tamamlandı' : 'Beklemede'}`,
            html: emailHtml
        });

        if (!response.success) {
            console.error('ESP Unit notification email failed:', response.error);
            return NextResponse.json({ error: 'Mail gönderilemedi' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Öğrenciye bilgi maili gönderildi.' }, { status: 200 });

    } catch (error: any) {
        console.error('ESP Unit notification error:', error);
        return NextResponse.json({ error: error.message || 'Hata oluştu' }, { status: 500 });
    }
}
