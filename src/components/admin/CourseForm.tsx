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
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
    course_code: z.string().min(2, 'Ders kodu en az 2 karakter olmalıdır'),
    course_name: z.string().min(3, 'Ders adı en az 3 karakter olmalıdır'),
    description: z.string().optional(),
    instructor_name: z.string().optional(),
});

export function CourseForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course_code: '',
            course_name: '',
            description: '',
            instructor_name: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const { error } = await supabase.from('courses').insert({
                course_code: values.course_code,
                course_name: values.course_name,
                description: values.description,
                instructor_name: values.instructor_name,
            });

            if (error) throw error;

            toast.success('Ders başarıyla oluşturuldu');
            router.push('/admin/dersler');
            router.refresh();
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error('Ders oluşturulurken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="course_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ders Kodu</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: MAT101" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="course_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ders Adı</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: Matematik 1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="instructor_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Eğitmen Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Örn: Prof. Dr. Ahmet Yılmaz" {...field} />
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
                            <FormLabel>Açıklama</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ders hakkında kısa bilgi..."
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
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
                        {isLoading ? 'Oluşturuluyor...' : 'Dersi Oluştur'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
