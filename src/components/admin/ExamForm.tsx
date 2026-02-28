'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const formSchema = z.object({
    course_id: z.string().min(1, 'Ders seçimi zorunludur'),
    title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır'),
    exam_type: z.string().min(1, 'Sınav türü zorunludur'),
    exam_date: z.string().min(1, 'Tarih zorunludur'),
    location: z.string().min(1, 'Yer bilgisi zorunludur'),
    duration: z.coerce.number().min(0),
    description: z.string().optional(),
    notify_students: z.boolean().default(true),
});

export function ExamForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        async function fetchCourses() {
            const { data } = await supabase.from('courses').select('id, course_name');
            if (data) setCourses(data);
        }
        fetchCourses();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course_id: '',
            title: '',
            exam_type: 'vize',
            exam_date: '',
            location: '',
            duration: 60,
            description: '',
            notify_students: true,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const { error } = await supabase.from('exams').insert({
                course_id: values.course_id,
                title: values.title,
                exam_type: values.exam_type,
                exam_date: new Date(values.exam_date).toISOString(),
                location: values.location,
                duration: values.duration,
                description: values.description,
                notify_students: values.notify_students,
            });

            if (error) throw error;

            toast.success('Sınav başarıyla oluşturuldu');
            router.push('/admin/takvim');
            router.refresh();
        } catch (error) {
            console.error('Error creating exam:', error);
            toast.error('Sınav oluşturulurken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="course_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ders</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Ders seçin" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.course_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sınav Başlığı</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: Vize Sınavı" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="exam_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sınav Türü</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tür seçin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="vize">Vize</SelectItem>
                                        <SelectItem value="final">Final</SelectItem>
                                        <SelectItem value="quiz">Quiz</SelectItem>
                                        <SelectItem value="proje">Proje Teslimi</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="exam_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tarih ve Saat</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Yer</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: A Blok 204" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Süre (Dakika)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Açıklama</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Sınav kapsamı vb." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notify_students"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Bildirim Gönder</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Öğrencilere sınav oluşturulduğuna dair bildirim gönderilir.
                                </p>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        İptal
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Oluşturuluyor...' : 'Sınavı Kaydet'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
