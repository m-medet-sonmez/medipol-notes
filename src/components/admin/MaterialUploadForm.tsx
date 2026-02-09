'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { FadeIn } from '@/components/ui/fade-in';
import { Upload, File, Music, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB

const uploadSchema = z.object({
    title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır'),
    description: z.string().optional(),
    courseId: z.string().min(1, 'Ders seçimi zorunludur'),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export function MaterialUploadForm() {
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [courses, setCourses] = useState<{ id: string, course_name: string }[]>([]);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioDuration, setAudioDuration] = useState<number | null>(null);

    const supabase = createClient();

    const form = useForm<UploadFormData>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            title: '',
            description: '',
            courseId: '',
        },
    });

    useEffect(() => {
        async function fetchData() {
            const { data: coursesData, error } = await supabase
                .from('courses')
                .select('id, course_name')
                .eq('is_active', true);

            if (error) {
                console.error("Error fetching courses:", error);
                toast.error("Ders listesi alınamadı.");
                return;
            }

            if (coursesData) {
                setCourses(coursesData);
            }
        }
        fetchData();
    }, []);

    const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);

            // Extract duration
            const audio = new Audio(URL.createObjectURL(file));
            audio.onloadedmetadata = () => {
                setAudioDuration(Math.round(audio.duration));
                URL.revokeObjectURL(audio.src);
            };
        } else {
            setAudioFile(null);
            setAudioDuration(null);
        }
    };

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPdfFile(file);
        } else {
            setPdfFile(null);
        }
    }

    async function onSubmit(data: UploadFormData) {
        // Validation: Must have either a file OR a description
        if (!pdfFile && !audioFile && !data.description) {
            toast.error('Lütfen bir dosya yükleyin veya açıklama girin.');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Kullanıcı bulunamadı');

            // Find selected course name for folder structure
            const selectedCourse = courses.find(c => c.id === data.courseId);
            const courseFolderName = selectedCourse ? selectedCourse.course_name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : data.courseId;

            let pdfPath = null;
            let pdfSize = null;
            let audioPath = null;
            let audioSize = null;

            // Upload PDF
            if (pdfFile) {
                setUploadProgress(10);
                const fileExt = pdfFile.name.split('.').pop();
                // User wants folder name based on course name
                const fileName = `${courseFolderName}/${Date.now()}_pdf.${fileExt}`;

                const { data: uploadData, error } = await supabase.storage
                    .from('materials')
                    .upload(fileName, pdfFile);

                if (error) throw error;
                pdfPath = uploadData.path;
                pdfSize = pdfFile.size;
            }

            setUploadProgress(50);

            // Upload Audio
            if (audioFile) {
                const fileExt = audioFile.name.split('.').pop();
                const fileName = `${courseFolderName}/${Date.now()}_audio.${fileExt}`;

                const { data: uploadData, error } = await supabase.storage
                    .from('materials')
                    .upload(fileName, audioFile);

                if (error) throw error;
                audioPath = uploadData.path;
                audioSize = audioFile.size;
            }

            setUploadProgress(80);

            // Insert DB Record
            const { error: dbError } = await supabase
                .from('materials')
                .insert({
                    course_id: data.courseId,
                    week_id: null, // No week selection anymore
                    title: data.title,
                    description: data.description,
                    pdf_file_path: pdfPath,
                    pdf_file_size: pdfSize,
                    audio_file_path: audioPath,
                    audio_file_size: audioSize,
                    audio_duration: audioDuration,
                    uploaded_by: user.id
                });

            if (dbError) throw dbError;

            setUploadProgress(100);
            toast.success('İçerik başarıyla yüklendi!');
            form.reset();
            setPdfFile(null);
            setAudioFile(null);
            setAudioDuration(null);

            // Reset file inputs manually
            const pdfInput = document.getElementById('pdf-upload') as HTMLInputElement;
            const audioInput = document.getElementById('audio-upload') as HTMLInputElement;
            if (pdfInput) pdfInput.value = '';
            if (audioInput) audioInput.value = '';

            setTimeout(() => setUploadProgress(0), 1000);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Yükleme sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }

    return (
        <FadeIn>
            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="courseId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ders Seçimi (Ders Klasörü)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Ders seçiniz" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {courses.length === 0 ? (
                                                <SelectItem value="none" disabled>
                                                    Ders bulunamadı (Veritabanı boş olabilir)
                                                </SelectItem>
                                            ) : (
                                                courses.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.course_name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>İçerik Başlığı</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Örn: Vize Haftası Duyurusu veya Ders Notu" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Açıklama / Duyuru Metni</FormLabel>
                                    <FormDescription>
                                        Sadece metin paylaşmak isterseniz burayı doldurun. Dosya yüklemeden de paylaşım yapabilirsiniz.
                                    </FormDescription>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Örn: Bu hafta ders işlenmeyecektir, vize haftası nedeniyle tatildir."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-dashed">
                            <div className="space-y-2">
                                <FormLabel className="flex items-center gap-2">
                                    <File className="w-4 h-4 text-red-500" />
                                    PDF Dosyası (Max 50MB)
                                </FormLabel>
                                <Input
                                    id="pdf-upload"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handlePdfChange}
                                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                />
                                {pdfFile && (
                                    <div className="flex items-center justify-between text-xs bg-card p-2 rounded border">
                                        <span className="truncate max-w-[200px]">{pdfFile.name}</span>
                                        <span className="text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <FormLabel className="flex items-center gap-2">
                                    <Music className="w-4 h-4 text-purple-500" />
                                    Ses Dosyası (Max 100MB)
                                </FormLabel>
                                <Input
                                    id="audio-upload"
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioChange}
                                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                                {audioFile && (
                                    <div className="flex items-center justify-between text-xs bg-card p-2 rounded border">
                                        <div className="flex flex-col">
                                            <span className="truncate max-w-[150px]">{audioFile.name}</span>
                                            {audioDuration && <span className="text-green-600 font-medium">Süre: {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}</span>}
                                        </div>
                                        <span className="text-muted-foreground">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {loading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Yükleniyor...</span>
                                    <span>%{uploadProgress}</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-6" disabled={loading}>
                            <Upload className="w-5 h-5 mr-2" />
                            {loading ? 'Yükleniyor...' : 'İçeriği Kaydet ve Yayınla'}
                        </Button>
                    </form>
                </Form>
            </div>
        </FadeIn>
    );
}
