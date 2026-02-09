import { createClient } from '@/lib/supabase/server';
import { QuestionsTable } from './QuestionsTable';

export default async function AdminSupportPage() {
    const supabase = await createClient();

    const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select(`
      *,
      profiles:profiles!support_tickets_user_id_fkey_profiles (
        full_name,
        email
      )
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tickets:', error);
        // @ts-ignore
        console.error('Error message:', error?.message);
        // @ts-ignore
        console.error('Error details:', error?.details);
        // @ts-ignore
        console.error('Error hint:', error?.hint);

        try {
            console.error('Full Error Object:', JSON.stringify(error, null, 2));
        } catch (e) {
            console.error('Could not stringify error object');
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gelen Sorular</h1>
                <p className="text-muted-foreground">
                    Öğrencilerden gelen soruları yanıtlayın ve yönetin.
                </p>
            </div>

            {error ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                    Sorular yüklenirken bir hata oluştu: {error.message}
                </div>
            ) : (
                <QuestionsTable tickets={tickets || []} />
            )}
        </div>
    );
}
