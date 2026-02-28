'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteCourse(courseId: string) {
    const supabase = await createClient();

    // 1. Dersi silmeden önce, bu derse ait materyallerin fiziksel fiziksel dosyalarını storage'dan silelim
    const { data: materials } = await supabase
        .from('materials')
        .select('pdf_file_path, audio_file_path')
        .eq('course_id', courseId);

    if (materials && materials.length > 0) {
        const filesToDelete: string[] = [];
        materials.forEach(m => {
            if (m.pdf_file_path) filesToDelete.push(m.pdf_file_path);
            if (m.audio_file_path) filesToDelete.push(m.audio_file_path);
        });

        if (filesToDelete.length > 0) {
            await supabase.storage.from('materials').remove(filesToDelete);
        }
    }

    // 2. DB'den dersi sil (bu işlem materials satırlarını da cascade ile silecektir)
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

    // 1. Önce fiziksel dosyaları bul ve sil
    const { data: material } = await supabase
        .from('materials')
        .select('pdf_file_path, audio_file_path')
        .eq('id', materialId)
        .single();

    if (material) {
        const filesToDelete: string[] = [];
        if (material.pdf_file_path) filesToDelete.push(material.pdf_file_path);
        if (material.audio_file_path) filesToDelete.push(material.audio_file_path);

        if (filesToDelete.length > 0) {
            await supabase.storage.from('materials').remove(filesToDelete);
        }
    }

    // 2. DB kaydını sil
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
