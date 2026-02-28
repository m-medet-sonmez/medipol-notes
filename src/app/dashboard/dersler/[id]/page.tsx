'use client';

import { FadeIn } from '@/components/ui/fade-in';
import { Button } from '@/components/ui/button';
import { FileText, Download, ArrowLeft, Calendar, File, Mic, Info } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.id as string;
    const [course, setCourse] = useState<any>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchDetails() {
            // Fetch Course Info
            const { data: courseData } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (courseData) {
                setCourse(courseData);
            }

            // Fetch Materials
            const { data: materialsData } = await supabase
                .from('materials')
                .select('*')
                .eq('course_id', courseId)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (materialsData) {
                setMaterials(materialsData);
            }

            setLoading(false);
        }

        if (courseId) {
            fetchDetails();
        }
    }, [courseId]);

    const handleDownload = async (path: string, fileName: string) => {
        const { data } = await supabase.storage.from('materials').createSignedUrl(path, 60);
        if (data?.signedUrl) {
            // Create a link and click it to download
            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleViewPdf = async (path: string) => {
        const { data } = await supabase.storage.from('materials').getPublicUrl(path);
        if (data?.publicUrl) {
            window.open(data.publicUrl, '_blank');
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center p-12">Yükleniyor...</div>;
    }

    if (!course) {
        return <div className="flex items-center justify-center p-12">Ders bulunamadı.</div>;
    }

    return (
        <div className="space-y-8">
            <FadeIn>
                <div className="flex flex-col gap-6">
                    <Link href="/dashboard/dersler" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Derslere Dön
                    </Link>

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{course.course_name}</h1>
                            <span className="px-2 py-0.5 rounded text-sm font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {course.course_code}
                            </span>
                        </div>
                        <p className="text-muted-foreground mt-2 max-w-2xl">
                            {course.description || 'Bu derse ait notlar ve duyurular.'}
                        </p>
                    </div>
                </div>
            </FadeIn>

            <div className="grid gap-4">
                {materials.length === 0 ? (
                    <div className="p-8 rounded-xl border border-dashed flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                        <div className="p-4 bg-secondary/50 rounded-full">
                            <File className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-medium">Henüz içerik eklenmemiş</p>
                        <p className="text-sm">Yeni notlar eklendikçe burada görünecek.</p>
                    </div>
                ) : (
                    materials.map((item, index) => (
                        <FadeIn key={item.id} delay={index * 0.05}>
                            <div className="group flex flex-col p-5 rounded-xl border bg-card/50 hover:bg-card hover:border-primary/20 transition-all gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* Icon based on content type */}
                                        <div className={`p-3 rounded-lg group-hover:scale-105 transition-transform ${!item.pdf_file_path && !item.audio_file_path
                                                ? 'bg-orange-500/10 text-orange-500' // Text Only
                                                : item.pdf_file_path
                                                    ? 'bg-red-500/10 text-red-500' // Has PDF
                                                    : 'bg-purple-500/10 text-purple-500' // Audio only
                                            }`}>
                                            {!item.pdf_file_path && !item.audio_file_path ? (
                                                <Info className="w-6 h-6" />
                                            ) : item.pdf_file_path ? (
                                                <FileText className="w-6 h-6" />
                                            ) : (
                                                <Mic className="w-6 h-6" />
                                            )}
                                        </div>

                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {format(new Date(item.created_at), 'd MMMM yyyy HH:mm', { locale: tr })}
                                                </span>
                                            </div>

                                            <h3 className="font-semibold text-lg leading-tight">{item.title}</h3>

                                            {item.description && (
                                                <p className="text-sm text-neutral-400 mt-1 pb-1">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 sm:self-center">
                                        {item.pdf_file_path && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewPdf(item.pdf_file_path)}
                                                className="w-full sm:w-auto hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                                            >
                                                <FileText className="w-4 h-4 mr-2" />
                                                PDF'i Aç
                                            </Button>
                                        )}

                                        {item.audio_file_path && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownload(item.audio_file_path, `${item.title}.mp3`)}
                                                className="w-full sm:w-auto hover:bg-purple-500/10 hover:text-purple-500 hover:border-purple-500/20"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Podcast İndir
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    ))
                )}
            </div>
        </div>
    );
}
