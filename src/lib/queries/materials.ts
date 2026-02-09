import { createClient } from '@/lib/supabase/client';
import { canAccessMaterial } from '@/lib/utils/access-control';

/**
 * Kullanıcının erişebildiği materyalleri getirir
 */
export async function getAccessibleMaterials(userId: string) {
    const supabase = createClient();

    // 1. Kullanıcının aboneliğini al
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('allowed_weeks, subscription_end_date, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

    if (!subscription) {
        throw new Error('Aktif abonelik bulunamadı');
    }

    // 2. Süre kontrolü
    if (new Date(subscription.subscription_end_date) < new Date()) {
        throw new Error('Aboneliğiniz sona erdi');
    }

    // 3. Materyalleri getir
    // Eğer allowed_weeks boş ise hiç materyal dönme
    if (!subscription.allowed_weeks || subscription.allowed_weeks.length === 0) {
        return [];
    }

    const { data: materials, error } = await supabase
        .from('materials')
        .select(`
      *,
      week:weeks(*),
      course:courses(*)
    `)
        .in('week_id', subscription.allowed_weeks)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return materials;
}

/**
 * Signed URL oluşturur
 */
export async function getSignedUrl(filePath: string, expiresIn = 3600) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
        .from('materials')
        .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
}

/**
 * Materyal indir
 */
export async function downloadMaterial(
    userId: string,
    materialId: string,
    type: 'pdf' | 'audio'
) {
    const supabase = createClient();

    // 1. Erişim kontrolü
    const hasAccess = await canAccessMaterial(userId, materialId);
    if (!hasAccess) {
        throw new Error('Bu içeriğe erişim yetkiniz yok');
    }

    // 2. Materyal bilgisini al
    const { data: material } = await supabase
        .from('materials')
        .select('pdf_file_path, audio_file_path')
        .eq('id', materialId)
        .single();

    if (!material) {
        throw new Error('Materyal bulunamadı');
    }

    // 3. Signed URL al
    const filePath = type === 'pdf'
        ? material.pdf_file_path
        : material.audio_file_path;

    if (!filePath) {
        throw new Error('Dosya bulunamadı');
    }

    const signedUrl = await getSignedUrl(filePath);

    // 4. Download count artır (RPC call)
    await supabase.rpc('increment_download_count', {
        material_id: materialId,
    });

    return signedUrl;
}
