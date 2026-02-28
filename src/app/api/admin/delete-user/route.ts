import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify the caller is a super_admin
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Bu işlem sadece süper admin tarafından yapılabilir.' }, { status: 403 });
        }

        // 2. Get the user ID to delete
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'Kullanıcı ID gereklidir.' }, { status: 400 });
        }

        // Prevent self-deletion
        if (userId === user.id) {
            return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz.' }, { status: 400 });
        }

        // Prevent deleting other super_admins CHECK REMOVED per user request
        const { data: targetProfile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', userId)
            .single();

        // 3. Create admin Supabase client with service role key
        const adminSupabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 4. Delete the user from Supabase Auth (this cascades to profiles via trigger/FK)
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
            return NextResponse.json({ error: 'Kullanıcı silinirken hata oluştu: ' + deleteError.message }, { status: 500 });
        }

        // 5. Also explicitly delete from profiles (in case there's no cascade)
        await adminSupabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        // 6. Delete related subscriptions
        await adminSupabase
            .from('subscriptions')
            .delete()
            .eq('user_id', userId);

        return NextResponse.json({
            success: true,
            message: `${targetProfile?.full_name || 'Kullanıcı'} başarıyla silindi.`
        });

    } catch (error: any) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Sunucu hatası: ' + error.message }, { status: 500 });
    }
}
