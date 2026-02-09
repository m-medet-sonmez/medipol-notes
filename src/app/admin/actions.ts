'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteCourse(courseId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

    if (error) {
        throw new Error('Ders silinirken bir hata oluştu');
    }

    revalidatePath('/admin/dersler');
}

export async function deleteExam(examId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

    if (error) {
        throw new Error('Sınav silinirken bir hata oluştu');
    }

    revalidatePath('/admin/takvim');
}

export async function deleteMaterial(materialId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId);

    if (error) {
        throw new Error('Materyal silinirken bir hata oluştu');
    }

    // Hem admin hem öğrenci sayfasını yenile
    revalidatePath('/admin/icerik-yukle');
    revalidatePath('/dashboard/dersler');
}

export async function toggleESPUnit(userId: string, unitId: number) {
    const supabase = await createClient();

    // 1. Mevcut profili ve üniteleri çek
    const { data: profile } = await supabase
        .from('profiles')
        .select('completed_esp_units')
        .eq('id', userId)
        .single();

    if (!profile) throw new Error('Kullanıcı bulunamadı');

    let currentUnits = (profile.completed_esp_units as string[]) || [];
    const unitIdStr = unitId.toString();

    // 2. Varsa çıkar, yoksa ekle
    if (currentUnits.includes(unitIdStr)) {
        currentUnits = currentUnits.filter(id => id !== unitIdStr);
    } else {
        currentUnits.push(unitIdStr);
    }

    // 3. Güncelle
    const { error } = await supabase
        .from('profiles')
        .update({ completed_esp_units: currentUnits })
        .eq('id', userId);

    if (error) throw new Error('Ünite durumu güncellenemedi');

    revalidatePath('/admin/esp-talepler');
    revalidatePath('/dashboard/esp-trust');
}
