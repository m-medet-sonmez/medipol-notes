'use client';

import { createClient } from '@/lib/supabase/client';
import { FadeIn } from '@/components/ui/fade-in';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Exam {
    id: string;
    title: string;
    exam_type: string;
    exam_date: string;
    location: string;
    duration: number;
    course: {
        course_name: string;
        course_code: string;
    };
}

export function ExamCalendar() {
    const [exams, setExams] = useState<Exam[]>([]);
    const supabase = createClient();

    useEffect(() => {
        async function fetchExams() {
            const { data } = await supabase
                .from('exams')
                .select(`
          *,
          course:courses(course_name, course_code)
        `)
                .eq('is_active', true)
                .gte('exam_date', new Date().toISOString())
                .order('exam_date', { ascending: true });

            if (data) setExams(data);
        }
        fetchExams();
    }, []);

    const getCountdown = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const days = differenceInDays(date, now);
        const hours = differenceInHours(date, now) % 24;

        if (days > 0) return `${days} Gün ${hours} Saat`;
        if (hours > 0) return `${hours} Saat`;
        return 'Şimdi';
    };

    const getBadgeVariant = (days: number) => {
        if (days <= 3) return "destructive";
        if (days <= 7) return "default"; // or any generic variant like warning? Using default/primary
        return "secondary";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.length === 0 ? (
                <div className="col-span-full">
                    <FadeIn>
                        <SpotlightCard className="w-full max-w-2xl mx-auto p-12 text-center bg-neutral-900/50 border-neutral-800">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 rounded-full bg-neutral-800/50 border border-neutral-700">
                                    <CalendarIcon className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    Henüz Sınav Takvimi Açıklanmadı
                                </h3>
                                <p className="text-muted-foreground max-w-lg mx-auto">
                                    Vize ve final takvimi okul yönetimi tarafından ilan edildiğinde bu alan otomatik olarak güncellenecektir. Lütfen takipte kalın!
                                </p>
                            </div>
                        </SpotlightCard>
                    </FadeIn>
                </div>
            ) : (
                exams.map((exam, i) => {
                    const daysLeft = differenceInDays(new Date(exam.exam_date), new Date());

                    return (
                        <FadeIn key={exam.id} delay={i * 0.1}>
                            <SpotlightCard className="h-full border-neutral-800 bg-neutral-900/50 hover:border-primary/50 transition-colors">
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="border-neutral-700">
                                            {exam.course.course_code}
                                        </Badge>
                                        <Badge variant={getBadgeVariant(daysLeft)}>
                                            {getCountdown(exam.exam_date)} Kaldı
                                        </Badge>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg">{exam.title}</h3>
                                        <p className="text-sm text-neutral-400 mt-1">{exam.course.course_name}</p>
                                    </div>

                                    <div className="space-y-2 pt-2 text-sm text-neutral-300">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-primary" />
                                            <span>{format(new Date(exam.exam_date), 'd MMMM yyyy HH:mm', { locale: tr })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span>{exam.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <span>{exam.duration} Dakika</span>
                                        </div>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </FadeIn>
                    );
                })
            )}
        </div>
    );
}
