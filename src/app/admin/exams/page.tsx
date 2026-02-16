import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FadeIn } from '@/components/ui/fade-in';
import { ExamManager } from '@/components/admin/ExamManager';
import { BackButton } from '@/components/ui/back-button';

export default async function AdminExamsPage() {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') redirect('/dashboard');

    // Fetch Exams
    const { data: exams, error } = await supabase
        .from('exam_schedules')
        .select('*')
        .order('exam_date', { ascending: true });

    if (error) {
        console.error('Error fetching exams:', error);
    }

    return (
        <div className="space-y-8">
            <BackButton href="/admin" label="Admin Paneli" />
            <FadeIn>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Sınav Yönetimi</h1>
                        <p className="text-neutral-400">
                            Vize ve Final sınav takvimlerini oluşturun ve yayınlayın.
                        </p>
                    </div>
                </div>
            </FadeIn>

            <FadeIn delay={0.2}>
                <ExamManager
                    existingExams={exams || []}
                />
            </FadeIn>
        </div>
    );
}
