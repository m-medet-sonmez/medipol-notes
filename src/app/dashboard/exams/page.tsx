import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FadeIn } from '@/components/ui/fade-in';
import { ExamSchedule } from '@/components/dashboard/ExamSchedule';

export default async function StudentExamsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Fetch Published Exams
    // No need to join with courses anymore as we use course_name directly
    const { data: exams, error } = await supabase
        .from('exam_schedules')
        .select('*')
        .eq('is_published', true)
        .order('exam_date', { ascending: true });

    if (error) {
        console.error('Error fetching exams:', error);
    }

    // Transform data to flat structure for component
    const formattedExams = exams?.map((exam: any) => ({
        id: exam.id,
        course_name: exam.course_name,
        exam_title: exam.exam_title,
        exam_date: exam.exam_date,
        location: exam.location,
        exam_type: exam.exam_type || 'final', // Default to final for backward compat
    })) || [];

    return (
        <div className="space-y-8">
            <FadeIn>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Sınav Takvimi</h1>
                    <p className="text-neutral-400">
                        Vize ve Final sınavlarınızın tarih ve saatlerini buradan takip edebilirsiniz.
                    </p>
                </div>
            </FadeIn>

            <ExamSchedule exams={formattedExams} />
        </div>
    );
}
