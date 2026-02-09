import { createClient } from '@/lib/supabase/server';
import { createShopierPaymentUrl } from '@/lib/shopier/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { plan } = body;

        if (!['weekly', 'monthly', 'semester'].includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Get user details (email, name) from profiles
        const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // MOCK PAYMENT LOGIC (User Request: Skip Shopier for now)

        // 1. Calculate dates and access
        const startDate = new Date();
        // Helper function logic imported inline or from utils to avoid complex imports if not needed, 
        // but better to use the utility we created.
        const { calculateSubscriptionAccess } = await import('@/lib/utils/access-control');
        const { startDate: subStart, endDate: subEnd, allowedWeekIds } = await calculateSubscriptionAccess(plan, startDate);

        // 2. Insert Subscription (Using Service Role to bypass RLS)
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminSupabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Deactivate old subscriptions
        await adminSupabase
            .from('subscriptions')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('is_active', true);

        // Create new subscription
        const { error: subError } = await adminSupabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan: plan,
                amount: plan === 'weekly' ? 300 : plan === 'monthly' ? 1000 : 2500,
                subscription_start_date: subStart.toISOString(),
                subscription_end_date: subEnd.toISOString(),
                allowed_weeks: allowedWeekIds,
                has_esp_access: ['monthly', 'semester'].includes(plan),
                shopier_transaction_id: `MOCK_${Date.now()}`,
                shopier_payment_status: 'success',
                is_active: true
            });

        if (subError) {
            console.error('Mock Subscription Error:', subError);
            return NextResponse.json({ error: 'Subscription creation failed' }, { status: 500 });
        }

        // 3. Send Welcome Email via Resend
        // Dynamically import to avoid edge runtime issues if any (though 'resend' works in Node env)
        const { sendEmail } = await import('@/lib/mail');

        await sendEmail({
            to: profile.email,
            subject: 'Aboneliğiniz Başlatıldı! 🎉',
            html: `
                <h1>Hoş Geldin, ${profile.full_name}!</h1>
                <p><strong>${plan.toUpperCase()}</strong> paket aboneliğin başarıyla tanımlandı.</p>
                <p>Artık ders notlarına, podcastlere ve diğer tüm ayrıcalıklara erişebilirsin.</p>
                <br />
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notlar" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Hemen Başla</a>
            `
        });

        // 4. Return local redirect URL
        const paymentUrl = '/dashboard/notlar?success=true';

        return NextResponse.json({ paymentUrl });
    } catch (error: any) {
        console.error('Payment Params Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
