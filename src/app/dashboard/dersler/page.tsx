'use client';

import { FadeIn } from '@/components/ui/fade-in';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Button } from '@/components/ui/button';
import { FileText, Download, ChevronRight, Folder } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchCourses() {
            // Get all courses with their material counts
            // Note: Since we don't have a direct count relation, we just fetch courses for now
            // In a production app, we would use a view or a function to get counts
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('is_active', true)
                .order('course_name');

            if (data) {
                setCourses(data);
            }
            setLoading(false);
        }

        fetchCourses();
    }, []);

    const getCourseColor = (index: number) => {
        const colors = ['blue', 'purple', 'green', 'orange', 'red', 'indigo'];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-8">
            <FadeIn>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Ders Notları</h1>
                    <p className="text-muted-foreground">
                        Dönem derslerine ait notlara ve duyurulara buradan ulaşabilirsin.
                    </p>
                </div>
            </FadeIn>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-40 rounded-xl bg-neutral-900/50 animate-pulse border border-neutral-800"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => {
                        const color = getCourseColor(index);
                        return (
                            <FadeIn key={course.id} delay={index * 0.1}>
                                <Link href={`/dashboard/dersler/${course.id}`} className="block group h-full">
                                    <SpotlightCard className="h-full p-6 transition-all border-neutral-800 hover:border-neutral-700">
                                        <div className="flex flex-col h-full justify-between gap-6">
                                            <div className="space-y-4">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${color}-500/10 text-${color}-500`}>
                                                    <Folder className="w-6 h-6" />
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                                        {course.course_name}
                                                    </h3>
                                                    <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded mt-1 inline-block">
                                                        {course.course_code}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                                <span>Notları Görüntüle</span>
                                                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </Link>
                            </FadeIn>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
