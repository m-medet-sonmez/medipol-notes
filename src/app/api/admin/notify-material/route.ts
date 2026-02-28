import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/mail';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Yetki Kontrolü
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
            return NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekiyor' }, { status: 403 });
        }

        const body = await req.json();
        const { courseId, title, hasPDF, hasAudio } = body;

        // Ders detayını çekelim (dersin adını e-postada göstermek için)
        let courseName = 'Bir Ders';
        if (courseId) {
            const { data: courseData } = await supabase
                .from('courses')
                .select('course_name')
                .eq('id', courseId)
                .single();
            if (courseData) {
                courseName = courseData.course_name;
            }
        }

        // E-postaları toplarken listeleme yetkisi için RLS bypass eden admin yetkili client kullanalım
        const adminSupabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. Aktif aboneliği olan öğrencileri bulalım
        const { data: activeSubscriptions } = await adminSupabase
            .from('subscriptions')
            .select(`
                user_id,
                profiles:user_id (email, full_name)
            `)
            .eq('is_active', true);

        // 2.a. Bütün Admin ve Super Adminleri de bulalım
        const { data: admins } = await adminSupabase
            .from('profiles')
            .select('email')
            .in('role', ['admin', 'super_admin']);

        // Öğrenci emaillerini çıkaralım
        const studentEmails = (activeSubscriptions || [])
            .map((sub: any) => sub.profiles?.email)
            .filter((email: string | undefined) => email && typeof email === 'string');

        // Admin emaillerini çıkaralım
        const adminEmails = (admins || [])
            .map((admin: any) => admin.email)
            .filter((email: string | undefined) => email && typeof email === 'string');

        // Hepsini birleştirelim ve benzersiz yapalım (aynı email hem admin hem öğrenci falan olabilir)
        const allEmails = [...studentEmails, ...adminEmails];
        const uniqueEmails = Array.from(new Set(allEmails));

        if (uniqueEmails.length === 0) {
            return NextResponse.json({ message: 'Geçerli e-posta adresi bulunamadı.' }, { status: 200 });
        }

        // 3. E-posta İçeriğini Hazırlayalım
        const emailSubject = `📚 Yeni İçerik Eklendi: ${courseName} - ${title}`;

        let contentTypes = [];
        if (hasPDF) contentTypes.push('📄 Ders Notu (PDF)');
        if (hasAudio) contentTypes.push('🎧 Podcast (Ses Kaydı)');

        const contentStr = contentTypes.length > 0 ? contentTypes.join(' ve ') : '📝 Duyuru/Açıklama';

        const emailHtml = `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6366f1;">Yeni İçerik Sisteme Yüklendi!</h2>
                <p>Merhaba,</p>
                <p><strong>${courseName}</strong> dersine ait yeni bir içerik eklendi.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">${title}</h3>
                    <p style="margin-bottom: 0;"><strong>İçerik Türü:</strong> ${contentStr}</p>
                </div>
                
                <p>Hemen paneline giriş yaparak içeriklere ulaşabilirsin.</p>
                
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kafarahat.xyz'}/giris" 
                   style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                   Panele Git
                </a>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px; margin-bottom: 20px;" />
                <p style="font-size: 12px; color: #6b7280;">
                    Bu e-posta KafaRahat Platformu tarafından otomatik olarak gönderilmiştir. Bildirim almak istemiyorsanız panelinizden ayarlarınızı güncelleyebilirsiniz.
                </p>
            </div>
        `;

        // 4. E-postaları gönderelim (Resend'in 50'lik limitini göz önünde bulundurarak gruplara bölebiliriz)
        // Eğer 50'den fazla öğrenci varsa chunk mantığı yapalım
        const CHUNK_SIZE = 50;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < uniqueEmails.length; i += CHUNK_SIZE) {
            const chunk = uniqueEmails.slice(i, i + CHUNK_SIZE) as string[];

            // Eğer Resend Bcc kullanmak istersek (tüm maillerde to olarak noreply görünüp hepsi bcc ye gider)
            /* 
            await resend.emails.send({
                from: 'KafaRahat Destek <noreply@kafarahat.xyz>',
                to: 'noreply@kafarahat.xyz',
                bcc: chunk, ...
            }); 
            Ancak lib/mail.ts de to array kabul ediyor. Resend API to'ya array verdiğimizde onlara atar.
            */

            const promises = chunk.map(email => sendEmail({
                to: email, // Tek kişiye gönderiyoruz
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
            successCount,
            failCount,
            message: `${successCount} kişiye e-posta başarıyla gönderildi. (${failCount} hata)`
        }, { status: 200 });

    } catch (error: any) {
        console.error('Material notification error:', error);
        return NextResponse.json({ error: error.message || 'Bilinmeyen bir hata oluştu' }, { status: 500 });
    }
}
