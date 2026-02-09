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
import { useAuth } from '@/lib/hooks/useAuth';

const formSchema = z.object({
    subject: z.string().min(5, 'Konu en az 5 karakter olmalıdır'),
    category: z.string().min(1, 'Kategori seçimi zorunludur'),
    message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır'),
    priority: z.string().default('normal'),
});

export function TicketForm() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subject: '',
            category: '',
            message: '',
            priority: 'normal',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;
        setIsLoading(true);

        try {
            const { error } = await supabase.from('support_tickets').insert({
                user_id: user.id,
                subject: values.subject,
                category: values.category,
                message: values.message,
                priority: values.priority,
                status: 'open',
            });

            if (error) throw error;

            toast.success('Destek talebiniz oluşturuldu');
            router.push('/dashboard/destek');
            router.refresh();
        } catch (error) {
            console.error('Ticket creation error:', error);
            toast.error('Talep oluşturulurken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Konu</FormLabel>
                            <FormControl>
                                <Input placeholder="Sorununuz hakkında kısa başlık..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kategori</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Kategori seçin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Teknik">Teknik Sorun</SelectItem>
                                        <SelectItem value="İçerik">Ders İçeriği</SelectItem>
                                        <SelectItem value="Ödeme">Ödeme ve Abonelik</SelectItem>
                                        <SelectItem value="Genel">Genel Soru</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Öncelik</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Öncelik seçin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="low">Düşük</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">Yüksek</SelectItem>
                                        <SelectItem value="urgent">Acil</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mesajınız</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Detaylı açıklama..."
                                    className="min-h-[150px]"
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
                        {isLoading ? 'Gönderiliyor...' : 'Talebi Gönder'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
