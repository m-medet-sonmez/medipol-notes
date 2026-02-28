import { createClient } from '@/lib/supabase/server';
import { StudentTable } from '@/components/admin/StudentTable';
import { BackButton } from '@/components/ui/back-button';

export default async function StudentsPage() {
    const supabase = await createClient();

    // Fetch profiles with their subscriptions
    const { data: profiles } = await supabase
        .from('profiles')
        .select(`
      *,
      subscriptions (
        plan,
        is_active,
        subscription_end_date
      )
    `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <BackButton href="/admin" label="Admin Paneli" />
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Öğrenci Yönetimi</h1>
                <p className="text-muted-foreground">
                    Platformdaki kayıtlı öğrencileri ve abonelik durumlarını görüntüleyin.
                </p>
            </div>

            <StudentTable data={profiles || []} />
        </div>
    );
}
