'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ExamSchedule = {
    id: string;
    course_name: string;
    exam_title: string;
    exam_date: string; // ISO string
    location: string | null;
    is_published: boolean;
    exam_type: 'vize' | 'final' | 'butunleme';
};

export async function upsertExamSchedule(data: Partial<ExamSchedule>) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return { error: 'Unauthorized' };

    if (!data.course_name) return { error: 'Ders adı gereklidir.' };
    if (!data.exam_date) return { error: 'Sınav tarihi gereklidir.' };

    const examData: any = {
        course_name: data.course_name,
        exam_title: data.exam_title || 'Sınav',
        exam_date: data.exam_date,
        location: data.location || null,
        is_published: data.is_published ?? true,
        exam_type: data.exam_type || 'final',
        updated_at: new Date().toISOString(),
    };

    // If update, include ID
    if (data.id) {
        examData.id = data.id;
    }

    const { error } = await supabase
        .from('exam_schedules')
        .upsert(examData);

    if (error) {
        console.error('Error upserting exam:', error);
        return { error: error.message };
    }

    revalidatePath('/admin/exams');
    revalidatePath('/dashboard/exams');
    return { success: true };
}

export async function deleteExamSchedule(examId: string) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('exam_schedules')
        .delete()
        .eq('id', examId);

    if (error) return { error: error.message };

    revalidatePath('/admin/exams');
    revalidatePath('/dashboard/exams');
    return { success: true };
}
