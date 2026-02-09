'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { MessageCircle, Send } from 'lucide-react';

export function AskAdminModal({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        category: 'general',
        message: ''
    });

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Oturum açmanız gerekiyor.');
                return;
            }

            const { error } = await supabase
                .from('support_tickets')
                .insert({
                    user_id: user.id,
                    subject: formData.subject,
                    category: formData.category,
                    message: formData.message,
                    status: 'open',
                    priority: 'normal'
                });

            if (error) throw error;

            toast.success('Sorunuz admine iletildi. En kısa sürede dönüş yapılacaktır.');
            setOpen(false);
            setFormData({ subject: '', category: 'general', message: '' });
        } catch (error: any) {
            console.error('Error submitting ticket:', error);
            toast.error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Admine Sor
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Admine Sor</DialogTitle>
                    <DialogDescription>
                        Sorularınızı buradan iletebilirsiniz. Cevaplar mail adresinize gönderilecektir.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Konu</Label>
                        <Input
                            id="subject"
                            placeholder="Sorunuzun konusu..."
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Kategori seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">Genel Sorular</SelectItem>
                                <SelectItem value="technical">Teknik Sorun</SelectItem>
                                <SelectItem value="academic">Akademik</SelectItem>
                                <SelectItem value="other">Diğer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Mesajınız</Label>
                        <Textarea
                            id="message"
                            placeholder="Detaylı açıklama..."
                            className="min-h-[100px]"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Gönderiliyor...' : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Gönder
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
