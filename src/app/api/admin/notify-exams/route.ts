import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        const { createClient } = require('@supabase/supabase-js');
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Yetki Kontrolü
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 });
        }

        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Bu işlem için yetki gerekiyor' }, { status: 403 });
        }

        // 2. Aktif aboneliği olan öğrencileri bulalım
        const { data: activeSubscriptions } = await adminSupabase
            .from('subscriptions')
            .select(`
                user_id,
                profiles:user_id (email, full_name)
            `)
            .eq('is_active', true);

        // 2.a Bütün Adminleri ve Super Adminleri de ekleyelim (haberdar olmaları için)
        const { data: admins } = await adminSupabase
            .from('profiles')
            .select('email')
            .in('role', ['admin', 'super_admin']);

        // Emailleri toplayalım
        const studentEmails = (activeSubscriptions || [])
            .map((sub: any) => sub.profiles?.email)
            .filter((email: string | undefined) => email && typeof email === 'string');

        const adminEmails = (admins || [])
            .map((admin: any) => admin.email)
            .filter((email: string | undefined) => email && typeof email === 'string');

        const allEmails = [...studentEmails, ...adminEmails];
        // Butona basan kişinin epostasını da eksiksiz olarak kesinleştirelim
        if (user.email) {
            allEmails.push(user.email);
        }

        const uniqueEmails = Array.from(new Set(allEmails));

        if (uniqueEmails.length === 0) {
            return NextResponse.json({ message: 'Mail gönderilecek kimse bulunamadı.' }, { status: 200 });
        }

        const emailSubject = `📅 Sınav Takvimleri Sisteme Yüklendi!`;

        const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6366f1;">Sınav Takvimi Güncellemesi</h2>
                <p>Merhaba,</p>
                <p>KafaRahat platformunda güncel sınav takvimi (vize, final vb.) bilgileri sisteme eklenmiş olup, erişime açılmıştır.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin-bottom: 0;"><strong>Bilgi:</strong> Lütfen kendi panelinize giriş yaparak yaklaşan sınav tarihlerini kontrol ediniz ve planlamanızı buna göre yapınız.</p>
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kafarahat.xyz'}/giris" 
                   style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                   Sisteme Giriş Yap ve İncele
                </a>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px; margin-bottom: 20px;" />
                <p style="font-size: 12px; color: #6b7280;">
                    Bu otomatik bir bilgilendirme mesajıdır. Başarılar dileriz!
                </p>
            </div>
        `;

        const CHUNK_SIZE = 50;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < uniqueEmails.length; i += CHUNK_SIZE) {
            const chunk = uniqueEmails.slice(i, i + CHUNK_SIZE) as string[];

            const promises = chunk.map(email => sendEmail({
                to: email,
                subject: emailSubject,
                html: emailHtml
            }));

            const results = await Promise.all(promises);

            results.forEach(res => {
                if (res.success) successCount++;
                else failCount++;
            });
        }

        return NextResponse.json({
            success: true,
            message: `${successCount} kişiye sınav takvimi maili başarıyla gönderildi.`
        }, { status: 200 });

    } catch (error: any) {
        console.error('Notify exams error:', error);
        return NextResponse.json({ error: error.message || 'Bilinmeyen bir hata oluştu' }, { status: 500 });
    }
}
