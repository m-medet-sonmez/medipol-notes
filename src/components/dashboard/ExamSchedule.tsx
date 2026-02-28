'use client';

import { useState, useEffect } from 'react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, GraduationCap, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/fade-in';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Exam {
    id: string;
    course_name: string;
    exam_title: string;
    exam_date: string;
    location: string | null;
    exam_type: 'vize' | 'final' | 'butunleme';
}

interface ExamScheduleProps {
    exams: Exam[];
}

export function ExamSchedule({ exams }: ExamScheduleProps) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Create interval to update every minute
        return () => clearInterval(timer);
    }, []);

    if (exams.length === 0) {
        return (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-center">
                <GraduationCap className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-neutral-200">Sınav Takvimi</h3>
                <p className="text-sm text-neutral-500 mt-1">Henüz yayınlanmış bir sınav takvimi bulunmuyor.</p>
            </div>
        );
    }

    const vizeExams = exams.filter(e => e.exam_type === 'vize');
    const finalExams = exams.filter(e => e.exam_type === 'final');
    const butunlemeExams = exams.filter(e => e.exam_type === 'butunleme');

    // Default tab logic: if finals exist, default to finals, else vize
    const defaultTab = butunlemeExams.length > 0 ? "butunleme" : finalExams.length > 0 ? "final" : "vize";

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-4 mb-8 bg-transparent h-auto p-0">
                <TabsTrigger
                    value="vize"
                    className="group flex items-center gap-2 px-6 py-3 h-auto rounded-full border border-neutral-800 bg-neutral-900/50 data-[state=active]:bg-yellow-500/20 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 text-neutral-400 transition-all duration-300 hover:border-yellow-500/50 hover:bg-neutral-900"
                >
                    <FileText className="w-5 h-5 group-data-[state=active]:animate-pulse" />
                    <span className="font-bold tracking-wide">Vize Sınavları</span>
                </TabsTrigger>

                <TabsTrigger
                    value="final"
                    className="group flex items-center gap-2 px-6 py-3 h-auto rounded-full border border-neutral-800 bg-neutral-900/50 data-[state=active]:bg-green-500/20 data-[state=active]:border-green-500 data-[state=active]:text-green-500 text-neutral-400 transition-all duration-300 hover:border-green-500/50 hover:bg-neutral-900"
                >
                    <GraduationCap className="w-5 h-5 group-data-[state=active]:animate-pulse" />
                    <span className="font-bold tracking-wide">Final Sınavları</span>
                </TabsTrigger>

                <TabsTrigger
                    value="butunleme"
                    className="group flex items-center gap-2 px-6 py-3 h-auto rounded-full border border-neutral-800 bg-neutral-900/50 data-[state=active]:bg-red-500/20 data-[state=active]:border-red-500 data-[state=active]:text-red-500 text-neutral-400 transition-all duration-300 hover:border-red-500/50 hover:bg-neutral-900"
                >
                    <AlertCircle className="w-5 h-5 group-data-[state=active]:animate-pulse" />
                    <span className="font-bold tracking-wide">Bütünleme</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="vize">
                <ExamGrid exams={vizeExams} now={now} type="Vize" />
            </TabsContent>

            <TabsContent value="final">
                <ExamGrid exams={finalExams} now={now} type="Final" />
            </TabsContent>

            <TabsContent value="butunleme">
                <ExamGrid exams={butunlemeExams} now={now} type="Bütünleme" />
            </TabsContent>
        </Tabs>
    );
}

function ExamGrid({ exams, now, type }: { exams: Exam[], now: Date, type: string }) {
    if (exams.length === 0) {
        return (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 text-center">
                <p className="text-neutral-500">Henüz {type} sınavı yayınlanmadı.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam, index) => {
                const examDate = new Date(exam.exam_date);
                const isPast = examDate < now;
                const daysLeft = differenceInDays(examDate, now);
                const hoursLeft = differenceInHours(examDate, now) % 24;

                return (
                    <FadeIn key={exam.id} delay={index * 0.1}>
                        <div className={cn(
                            "relative overflow-hidden rounded-xl border p-5 transition-all duration-300 group h-full flex flex-col justify-between",
                            isPast
                                ? "bg-neutral-900/30 border-neutral-800 opacity-60"
                                : "bg-neutral-900 border-neutral-800 hover:border-primary/50 hover:shadow-[0_0_20px_-5px_var(--primary)]"
                        )}>
                            {/* Decorative Glow */}
                            {!isPast && (
                                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                            )}

                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-full">
                                        <h3 className="font-semibold text-white text-lg leading-tight mb-1 break-words pr-8">
                                            {exam.course_name}
                                        </h3>
                                        <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                                            {exam.exam_title}
                                        </p>
                                    </div>

                                    {!isPast && (
                                        <div className="text-right shrink-0 flex flex-col items-end leading-none">
                                            <span className={cn(
                                                "text-4xl font-black tracking-tighter",
                                                daysLeft < 7 ? "text-red-500" : "text-green-500"
                                            )}>
                                                {daysLeft}
                                            </span>
                                            <span className="text-[10px] uppercase text-neutral-500 font-bold mt-1">
                                                GÜN
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mt-4 text-sm text-neutral-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-neutral-500" />
                                        <span className={isPast ? "line-through decoration-neutral-600" : ""}>
                                            {format(examDate, 'd MMMM yyyy, EEEE', { locale: tr })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-neutral-500" />
                                        <span>
                                            {format(examDate, 'HH:mm')}
                                        </span>
                                    </div>
                                    {exam.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-neutral-500" />
                                            <span>{exam.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FadeIn >
                );
            })}
        </div >
    )
}
