import { addDays, addMonths } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

export type SubscriptionPlan = 'weekly' | 'monthly' | 'semester';

interface SubscriptionAccess {
    startDate: Date;
    endDate: Date;
    allowedWeekIds: string[]; // UUID array
}

/**
 * Abonelik planına göre erişilebilir haftaları hesaplar
 */
export async function calculateSubscriptionAccess(
    plan: SubscriptionPlan,
    startDate: Date
): Promise<SubscriptionAccess> {
    const supabase = await createClient(); // Use server client
    let endDate: Date;
    let allowedWeekIds: string[] = [];

    switch (plan) {
        case 'weekly':
            endDate = addDays(startDate, 7);
            // Sadece kayıt tarihinin bulunduğu haftayı al
            const { data: weekData } = await supabase
                .from('weeks')
                .select('id')
                .lte('start_date', startDate.toISOString())
                .gte('end_date', startDate.toISOString())
                .single();

            // Eğer tam o tarihe denk gelen hafta yoksa, belki kaydın yapıldığı en yakın 'aktif' haftayı bulmak gerekebilir.
            // Şimdilik basite indirgiyoruz: o anki tarih bir haftanın içindeyse o haftayı ver.
            if (weekData) {
                allowedWeekIds = [weekData.id];
            }
            break;

        case 'monthly':
            endDate = addMonths(startDate, 1); // 30 gün
            // Kayıt ayının tüm haftalarını al
            // NOT: Dokümanda "Kayıt ayının tüm haftaları" denmiş. (Örn: Mart'ta kayıt olan Mart haftalarına erişir)
            // Bu mantık o ayın kaçıncı günü olduğuna bakmaksızın o "takvim ayına" hak veriyor olabilir.
            // Veya kayıt tarihinden itibaren 1 ay boyunca "yayınlanan" haftalara erişim olabilir.
            // Doküman Kural 2: "Mart ayında kayıt olan öğrenci sadece Mart haftalarına erişir" -> Takvim ayı bazlı.

            const month = startDate.getMonth() + 1; // JS 0-11, DB 1-12 usually
            const year = startDate.getFullYear();

            const { data: monthWeeks } = await supabase
                .from('weeks')
                .select('id')
                .eq('month', month)
                .eq('year', year);

            allowedWeekIds = monthWeeks?.map(w => w.id) || [];
            break;

        case 'semester':
            endDate = addDays(startDate, 120);
            // 120 gün içindeki tüm haftaları al (Tarih aralığındaki tüm haftalar)

            const { data: semesterWeeks } = await supabase
                .from('weeks')
                .select('id')
                .gte('start_date', startDate.toISOString())
                .lte('end_date', endDate.toISOString());

            allowedWeekIds = semesterWeeks?.map(w => w.id) || [];
            break;
    }

    return {
        startDate,
        endDate,
        allowedWeekIds,
    };
}

/**
 * Kullanıcının bir materyale erişimi var mı kontrol eder
 */
export async function canAccessMaterial(
    userId: string,
    materialId: string
): Promise<boolean> {
    const supabase = createClient();

    // 1. Materyal bilgisini al
    const { data: material } = await supabase
        .from('materials')
        .select('week_id')
        .eq('id', materialId)
        .single();

    if (!material) return false;

    // 2. Kullanıcının aktif aboneliğini al
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('allowed_weeks, subscription_end_date, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (!subscription) return false;

    // 3. Abonelik süresi dolmuş mu?
    if (new Date(subscription.subscription_end_date) < new Date()) {
        return false;
    }

    // 4. Hafta erişimi var mı?
    return subscription.allowed_weeks?.includes(material.week_id) || false;
}
