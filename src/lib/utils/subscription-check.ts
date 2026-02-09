import { createClient } from '@/lib/supabase/client';
import { addDays } from 'date-fns';

/**
 * Kullanıcının abonelik durumunu kontrol eder
 * Client-side'da kullanılır
 */
export async function checkSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    needsRenewal: boolean;
    daysLeft: number;
    subscriptionEndDate: Date | null;
}> {
    const supabase = createClient();
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('subscription_end_date, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (!subscription) {
        return {
            isActive: false,
            needsRenewal: true,
            daysLeft: 0,
            subscriptionEndDate: null,
        };
    }

    const endDate = new Date(subscription.subscription_end_date);
    const now = new Date();
    // Calculate days left
    const diffTime = endDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
        isActive: endDate > now,
        needsRenewal: endDate <= now,
        daysLeft: Math.max(0, daysLeft),
        subscriptionEndDate: endDate,
    };
}

/**
 * Abonelik süresi bitmek üzere olan kullanıcıları bulur
 * Scheduled function için (günlük çalışır)
 * Note: Bu fonksiyon genellikle server-side çalıştırılmalıdır.
 */
export async function findExpiringSubscriptions(daysAhead: number = 3) {
    const supabase = createClient();
    const targetDate = addDays(new Date(), daysAhead);

    const { data } = await supabase
        .from('subscriptions')
        .select('user_id, subscription_end_date, plan')
        .eq('is_active', true)
        .gte('subscription_end_date', new Date().toISOString())
        .lte('subscription_end_date', targetDate.toISOString());

    return data || [];
}
