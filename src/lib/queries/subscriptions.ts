import { createClient } from '@/lib/supabase/client';
import { calculateSubscriptionAccess, SubscriptionPlan } from '@/lib/utils/access-control';

export async function createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    shopierTransactionId?: string
) {
    const supabase = createClient();
    const startDate = new Date();

    // 1. Plan detaylarını hesapla
    const accessDetails = await calculateSubscriptionAccess(plan, startDate);

    let amount = 0;
    let hasEspAccess = false;

    if (plan === 'weekly') {
        amount = 300;
        hasEspAccess = false;
    } else if (plan === 'monthly') {
        amount = 1000;
        hasEspAccess = true;
    } else if (plan === 'semester') {
        amount = 2500;
        hasEspAccess = true;
    }

    // 2. Önceki tüm aktif abonelikleri pasife çek (İsteğe bağlı, kurala göre değişebilir)
    // Şimdilik birden fazla abonelik olmasını engellemek için eskisini kapatıyoruz.
    await supabase
        .from('subscriptions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

    // 3. Yeni abonelik oluştur
    const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            plan,
            amount,
            subscription_start_date: accessDetails.startDate.toISOString(),
            subscription_end_date: accessDetails.endDate.toISOString(),
            allowed_weeks: accessDetails.allowedWeekIds,
            has_esp_access: hasEspAccess,
            shopier_transaction_id: shopierTransactionId,
            is_active: true,
        })
        .select()
        .single();

    if (error) throw error;

    // 4. Ödeme geçmişi ekle
    await supabase.from('payment_history').insert({
        user_id: userId,
        subscription_id: subscription.id,
        amount,
        plan,
        shopier_transaction_id: shopierTransactionId,
        shopier_status: 'success',
    });

    return subscription;
}

export async function getSubscription(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
    return data;
}
