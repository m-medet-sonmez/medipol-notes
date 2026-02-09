'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
    week_number: z.coerce.number().min(1),
    week_name: z.string().min(3, 'Hafta adı en az 3 karakter olmalıdır'),
    start_date: z.string().min(1, 'Başlangıç tarihi zorunludur'),
    end_date: z.string().min(1, 'Bitiş tarihi zorunludur'),
    month: z.coerce.number().min(1).max(12),
    year: z.coerce.number().min(2023),
});

export function WeekForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    // Varsayılan olarak mevcut yılı ve ayı seçelim
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JS months are 0-11

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            week_number: 1, // Default, will be stringified by input then transformed back
            week_name: '',
            start_date: '',
            end_date: '',
            month: currentMonth,
            year: currentYear,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const { error } = await supabase.from('weeks').insert({
                week_number: values.week_number,
                week_name: values.week_name,
                start_date: values.start_date,
                end_date: values.end_date,
                month: values.month,
                year: values.year,
            });

            if (error) {
                if (error.code === '23505') {
                    toast.error('Bu tarih aralığı için zaten bir hafta tanımlı!');
                } else {
                    throw error;
                }
                return;
            }

            toast.success('Hafta başarıyla oluşturuldu');
            router.push('/admin/haftalar');
            router.refresh();
        } catch (error) {
            console.error('Error creating week:', error);
            toast.error('Hafta oluşturulurken hata oluştu');
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
                        name="week_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hafta Numarası</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={52}
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormDescription>Örn: 1, 2, 3...</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="week_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hafta Adı</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: 1. Hafta - Giriş" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Başlangıç Tarihi</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bitiş Tarihi</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="month"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ay</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(val)} // String keeps as is, transformed later
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Ay seçin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                            <SelectItem key={m} value={m.toString()}>
                                                {new Date(0, m - 1).toLocaleString('tr-TR', { month: 'long' })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Yıl</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={2023}
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

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
                        {isLoading ? 'Oluşturuluyor...' : 'Haftayı Kaydet'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
