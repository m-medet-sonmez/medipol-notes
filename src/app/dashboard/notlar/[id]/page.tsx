'use client';

import { createClient } from '@/lib/supabase/client';
import { PDFViewer } from '@/components/materials/PDFViewer';
import { CustomAudioPlayer } from '@/components/materials/AudioPlayer';
import { FadeIn } from '@/components/ui/fade-in';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, FileText, Share2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Material {
    id: string;
    title: string;
    description: string;
    pdf_file_path: string;
    audio_file_path: string;
    course: {
        course_name: string;
        course_code: string;
    };
    week: {
        week_name: string;
    };
}

export default function MaterialDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [material, setMaterial] = useState<Material | null>(null);
    const [loading, setLoading] = useState(true);
    const [signedPdfUrl, setSignedPdfUrl] = useState<string>('');
    const [signedAudioUrl, setSignedAudioUrl] = useState<string>('');

    useEffect(() => {
        async function fetchMaterial() {
            if (!id) return;

            const { data, error } = await supabase
                .from('materials')
                .select(`
          *,
          course:courses(course_name, course_code),
          week:weeks(week_name)
        `)
                .eq('id', id)
                .single();

            if (error) {
                toast.error('İçerik bulunamadı veya erişim izniniz yok.');
                router.push('/dashboard/notlar');
                return;
            }

            setMaterial(data);

            // Create signed URLs
            if (data.pdf_file_path) {
                const { data: pdfData } = await supabase.storage
                    .from('materials')
                    .createSignedUrl(data.pdf_file_path, 3600);
                if (pdfData) setSignedPdfUrl(pdfData.signedUrl);
            }

            if (data.audio_file_path) {
                const { data: audioData } = await supabase.storage
                    .from('materials')
                    .createSignedUrl(data.audio_file_path, 3600);
                if (audioData) setSignedAudioUrl(audioData.signedUrl);
            }

            setLoading(false);
        }

        fetchMaterial();
    }, [id, router, supabase]);

    const handleDownload = async (type: 'pdf' | 'audio') => {
        const url = type === 'pdf' ? signedPdfUrl : signedAudioUrl;
        if (!url) return;

        // Trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${material?.title}.${type === 'pdf' ? 'pdf' : 'mp3'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('İndirme başlatıldı');
    };

    if (loading) {
        return <div className="p-12 text-center animate-pulse">Yükleniyor...</div>;
    }

    if (!material) return null;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <FadeIn>
                <div className="flex flex-col gap-4">
                    <Link
                        href="/dashboard/notlar"
                        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Notlara Dön
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                                    {material.course.course_code}
                                </Badge>
                                <Badge variant="secondary">
                                    {material.week.week_name}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold">{material.title}</h1>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => handleDownload('pdf')}>
                                <Download className="w-4 h-4 mr-2" />
                                PDF İndir
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Audio Player */}
            {signedAudioUrl && (
                <CustomAudioPlayer
                    title={`${material.title} - Sesli Özet`}
                    src={signedAudioUrl}
                />
            )}

            {/* PDF Viewer */}
            {signedPdfUrl ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <FileText className="w-5 h-5 text-primary" />
                        <h2>Ders Notları</h2>
                    </div>
                    <PDFViewer fileUrl={signedPdfUrl} onDownload={() => handleDownload('pdf')} />
                </div>
            ) : (
                <div className="p-12 border border-dashed rounded-xl text-center text-muted-foreground">
                    Bu içerik için PDF bulunmamaktadır.
                </div>
            )}
        </div>
    );
}
