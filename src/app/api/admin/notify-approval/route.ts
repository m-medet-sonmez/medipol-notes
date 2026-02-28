import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/mail';

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
        const { targetUserId, status } = body;

        if (!targetUserId || !status) {
            return NextResponse.json({ error: 'Eksik parametreler. targetUserId ve status gerekli.' }, { status: 400 });
        }

        // 2. Öğrencinin mailini bulalım
        const { data: targetProfile, error: profileError } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', targetUserId)
            .single();

        if (profileError || !targetProfile?.email) {
            return NextResponse.json({ error: 'Öğrenci bulunamadı veya emaili yok' }, { status: 404 });
        }

        // 3. E-posta İçeriğini Hazırlayalım
        const isApproved = status === 'approved';
        const emailSubject = isApproved ? `🎉 Aboneliğiniz Aktif Edildi - KafaRahat` : `❌ Ödeme İşleminiz Onaylanamadı - KafaRahat`;

        const emailHtml = isApproved ? `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #22c55e;">Aboneliğiniz Aktif Edildi!</h2>
                <p>Merhaba <strong>${targetProfile.full_name || 'Öğrenci'}</strong>,</p>
                <p>Ödeme işleminiz başarıyla onaylandı ve sistem üzerindeki aboneliğiniz aktif hale getirildi.</p>
                
                <p>Artık tüm ders notlarına, özetlere ve podcast serilerimize dilediğiniz zaman ulaşabilirsiniz. Başarılar dileriz!</p>
                
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kafarahat.xyz'}/giris" 
                   style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                   Sisteme Giriş Yap
                </a>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px; margin-bottom: 20px;" />
                <p style="font-size: 12px; color: #6b7280;">
                    KafaRahat Destek Ekibi<br/>
                    kafarahat.xyz
                </p>
            </div>
        ` : `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #ef4444;">Ödeme İşleminiz Onaylanamadı</h2>
                <p>Merhaba <strong>${targetProfile.full_name || 'Öğrenci'}</strong>,</p>
                <p>Yapmış olduğunuz ödeme bildirimi sistem yöneticilerimiz tarafından incelenmiş, ancak onaylanamamıştır. Lütfen dekontunuzu veya banka referans numaranızı kontrol ederek tekrar "Ödeme Yaptım" bildirimi gönderiniz.</p>
                
                <p>Eğer geçerli bir ödeme yaptığınıza eminseniz lütfen iletişim kanallarımızdan bize ulaşın.</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px; margin-bottom: 20px;" />
                <p style="font-size: 12px; color: #6b7280;">
                    KafaRahat Destek Ekibi<br/>
                    kafarahat.xyz
                </p>
            </div>
        `;

        // 4. Gönderim
        const response = await sendEmail({
            to: targetProfile.email,
            subject: emailSubject,
            html: emailHtml
        });

        if (!response.success) {
            console.error('Email sending failed for status change:', response.error);
            return NextResponse.json({ error: 'Mail gönderilemedi' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Mail başarıyla gönderildi.'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Status validaton notification error:', error);
        return NextResponse.json({ error: error.message || 'Bilinmeyen bir hata oluştu' }, { status: 500 });
    }
}

