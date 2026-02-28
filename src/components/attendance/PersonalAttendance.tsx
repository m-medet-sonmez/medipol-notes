'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FadeIn } from '@/components/ui/fade-in';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PersonalAbsence {
    id: string;
    course_name: string;
    absence_count: number;
}

export function PersonalAttendance() {
    const supabase = createClient();
    const [absences, setAbsences] = useState<PersonalAbsence[]>([]);
    const [newCourseName, setNewCourseName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAbsences();
    }, []);

    const loadAbsences = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('student_personal_absences')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setAbsences(data || []);
        } catch (error) {
            console.error('Error loading absences:', error);
            toast.error('Çetele yüklenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCourseName.trim();
        if (!trimmed) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if course already exists
            if (absences.some(a => a.course_name.toLowerCase() === trimmed.toLowerCase())) {
                toast.error('Bu ders zaten listenizde var.');
                return;
            }

            const { data, error } = await supabase
                .from('student_personal_absences')
                .insert([{ user_id: user.id, course_name: trimmed, absence_count: 0 }])
                .select()
                .single();

            if (error) throw error;

            setAbsences(prev => [...prev, data]);
            setNewCourseName('');
            toast.success('Ders eklendi.');
        } catch (error) {
            console.error('Error adding course:', error);
            toast.error('Ders eklenirken hata oluştu.');
        }
    };

    const handleUpdateAbsence = async (id: string, currentCount: number, increment: number) => {
        const newCount = Math.max(0, currentCount + increment);

        // Optimistic update
        setAbsences(prev => prev.map(a => a.id === id ? { ...a, absence_count: newCount } : a));

        try {
            const { error } = await supabase
                .from('student_personal_absences')
                .update({ absence_count: newCount })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating count:', error);
            toast.error('Güncellenirken hata oluştu.');
            // Revert optimistic update
            loadAbsences();
        }
    };

    const handleDeleteCourse = async (id: string) => {
        try {
            const { error } = await supabase
                .from('student_personal_absences')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setAbsences(prev => prev.filter(a => a.id !== id));
            toast.success('Ders silindi.');
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error('Ders silinirken hata oluştu.');
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-32 bg-neutral-900/50 rounded-xl" />;
    }

    return (
        <FadeIn>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 shadow-sm mb-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-400" />
                            Kendi Çetelem (Devamsızlık)
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">
                            Katılmadığınız günleri saymak için dilediğiniz dersi ekleyin.
                        </p>
                    </div>

                    <form onSubmit={handleAddCourse} className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                            placeholder="Yeni ders adı..."
                            value={newCourseName}
                            onChange={(e) => setNewCourseName(e.target.value)}
                            className="bg-neutral-950 border-neutral-800 min-w-[200px]"
                        />
                        <Button type="submit" disabled={!newCourseName.trim()} className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
                            Ekle
                        </Button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {absences.length === 0 ? (
                        <div className="col-span-full py-8 text-center border border-dashed border-neutral-800 rounded-xl text-neutral-500">
                            Henüz ders eklemediniz. Çetelenizi tutmaya başlamak için yukarıdan ders ekleyin.
                        </div>
                    ) : (
                        absences.map((item) => (
                            <div key={item.id} className="bg-neutral-950 border border-neutral-800 p-5 rounded-xl flex flex-col justify-between group transition-all hover:border-indigo-500/30">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-semibold text-white leading-tight pr-2">
                                        {item.course_name}
                                    </h3>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button className="text-neutral-600 hover:text-red-500 transition-colors p-1 shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-neutral-900 border-neutral-800">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    "{item.course_name}" çetelesini tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700">İptal</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteCourse(item.id)} className="bg-red-600 hover:bg-red-700">
                                                    Sil
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Katılmadığım Ders</span>
                                        <span className={`text-4xl font-black ${item.absence_count === 0 ? 'text-neutral-600' : item.absence_count < 3 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {item.absence_count}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-lg border border-neutral-800">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                                            onClick={() => handleUpdateAbsence(item.id, item.absence_count, -1)}
                                            disabled={item.absence_count === 0}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <div className="w-px h-6 bg-neutral-800" />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20"
                                            onClick={() => handleUpdateAbsence(item.id, item.absence_count, 1)}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </FadeIn>
    );
}
