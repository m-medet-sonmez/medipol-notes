import { createClient } from '@/lib/supabase/client';

export type NotificationType = 'material' | 'attendance' | 'esp' | 'exam' | 'support' | 'payment';

interface CreateNotificationParams {
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    action_url?: string;
}

export async function createNotification(params: CreateNotificationParams) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: params.user_id,
            title: params.title,
            message: params.message,
            type: params.type,
            action_url: params.action_url,
            is_read: false,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
    return data;
}

export async function markNotificationAsRead(notificationId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

    if (error) throw error;
}
