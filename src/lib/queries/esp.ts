import { createClient } from '@/lib/supabase/client';
import { createNotification } from './notifications';

/**
 * ESP Trust talebi oluştur
 */
export async function createESPRequest(
    userId: string,
    email: string,
    password: string
) {
    const supabase = createClient();

    // 1. ESP erişimi kontrol et
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('has_esp_access')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (!subscription?.has_esp_access) {
        throw new Error('ESP Trust için Aylık veya Dönemlik paket gereklidir');
    }

    // 2. Talep oluştur
    const { data, error } = await supabase
        .from('esp_trust_requests')
        .insert({
            user_id: userId,
            esp_email: email,
            esp_password: password,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;

    // 3. Bildirim gönder
    await createNotification({
        user_id: userId,
        title: 'ESP Trust Talebiniz Alındı',
        message: 'Talebiniz en kısa sürede işleme alınacaktır.',
        type: 'esp',
    });

    return data;
}

/**
 * ESP talebi durumunu güncelle (Admin)
 */
export async function updateESPRequestStatus(
    requestId: string,
    status: 'processing' | 'completed' | 'failed',
    adminNotes?: string,
    adminId?: string
) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('esp_trust_requests')
        .update({
            status,
            admin_notes: adminNotes,
            processed_by: adminId,
            processed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

    if (error) throw error;

    if (!data) return;

    // Kullanıcıya bildirim
    const statusMessages = {
        processing: 'ESP Trust talebiniz işleme alındı',
        completed: 'ESP Trust talebiniz tamamlandı ✅',
        failed: 'ESP Trust talebiniz başarısız oldu',
    };

    await createNotification({
        user_id: data.user_id,
        title: 'ESP Trust Güncelleme',
        message: statusMessages[status],
        type: 'esp',
    });

    return data;
}
