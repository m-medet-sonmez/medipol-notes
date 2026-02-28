import { createClient } from '@/lib/supabase/server';
import { ESPRequestTable } from '@/components/admin/ESPRequestTable';
import { BackButton } from '@/components/ui/back-button';

export default async function ESPRequestsPage() {
    const supabase = await createClient();

    const { data: requests } = await supabase
        .from('esp_requests')
        .select(`
      *,
      profiles (
        id,
        full_name,
        email
      )
    `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <BackButton href="/admin" label="Admin Paneli" />
            <div>
                <h1 className="text-3xl font-bold tracking-tight">ESP Trust Talepleri</h1>
                <p className="text-muted-foreground">
                    Öğrencilerden gelen ESP Trust taleplerini yönetin.
                </p>
            </div>

            <ESPRequestTable data={requests || []} />
        </div>
    );
}
