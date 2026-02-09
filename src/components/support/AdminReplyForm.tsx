'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
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
    reply: z.string().min(5, 'Yanıt en az 5 karakter olmalıdır'),
    status: z.string().min(1, 'Durum seçimi zorunludur'),
});

interface AdminReplyFormProps {
    ticketId: string;
    currentStatus: string;
    studentEmail?: string;
    ticketSubject?: string;
}

export function AdminReplyForm({ ticketId, currentStatus, studentEmail, ticketSubject }: AdminReplyFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [sendEmail, setSendEmail] = useState(true);
    const supabase = createClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reply: '',
            status: currentStatus === 'open' ? 'resolved' : currentStatus,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({
                    admin_reply: values.reply,
                    status: values.status,
                    replied_by: user.id,
                    replied_at: new Date().toISOString(),
                })
                .eq('id', ticketId);

            if (error) throw error;

            toast.success('Yanıt kaydedildi');

            // Handle Email redirection
            if (sendEmail && studentEmail) {
                const subject = `YNT: ${ticketSubject || 'Destek Talebi'}`;
                const body = `Merhaba,\n\nTalebine istinaden yanıtımız ektedir:\n\n${values.reply}\n\nİyi çalışmalar.`;
                const mailtoLink = `mailto:${studentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.open(mailtoLink, '_blank');
            }

            router.push('/admin/sorular');
            router.refresh();
        } catch (error) {
            console.error('Reply error:', error);
            toast.error('Yanıt gönderilirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Durum Güncelle</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Durum seçin" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="open">Açık</SelectItem>
                                    <SelectItem value="in_progress">İşleniyor</SelectItem>
                                    <SelectItem value="resolved">Çözüldü</SelectItem>
                                    <SelectItem value="closed">Kapatıldı</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="reply"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Yanıtınız</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Kullanıcıya yanıt yazın..."
                                    className="min-h-[150px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {studentEmail && (
                    <div className="flex items-center space-x-2 border p-3 rounded-lg bg-muted/50">
                        <Checkbox
                            id="sendEmail"
                            checked={sendEmail}
                            onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                        />
                        <label
                            htmlFor="sendEmail"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Öğrenciye E-posta ile de yanıt gönder ({studentEmail})
                        </label>
                    </div>
                )}

                <div className="flex justify-end gap-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Gönderiliyor...' : 'Yanıtı Kaydet ve Gönder'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
