'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export function NotifyExamsButton() {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleSendEmails = async () => {
        if (!confirm('Tüm kayıtlı öğrencilere "Sınav Takvimleri Eklendi" maili gönderilecek. Onaylıyor musunuz?')) return;

        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/admin/notify-exams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Mail gönderilirken bir hata oluştu.');
            }

            toast.success(data.message || 'Mailler başarıyla gönderildi!');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Mevcut ağ veya yetki sorunu yaşandı.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSendEmails}
            disabled={isLoading}
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.5)] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white gap-2 transition-transform hover:scale-105 active:scale-95 group border-none"
            size="lg"
        >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
            Sınavları Bildir
        </Button>
    );
}
