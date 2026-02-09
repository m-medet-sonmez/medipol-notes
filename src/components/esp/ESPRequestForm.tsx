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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { FadeIn } from '@/components/ui/fade-in';
import { Clock, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const espSchema = z.object({
    email: z.string().email('Geçerli bir ESP e-posta adresi giriniz'),
    password: z.string().min(1, 'ESP şifresi gereklidir'),
});

type EspFormData = z.infer<typeof espSchema>;

interface ESPRequestFormProps {
    currentStatus?: 'pending' | 'processing' | 'completed' | 'failed' | 'none' | string | null;
}

export function ESPRequestForm({ currentStatus }: ESPRequestFormProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>(currentStatus || 'none');
    const supabase = createClient();

    // Update status if prop changes (e.g. revalidation)
    useEffect(() => {
        if (currentStatus) {
            setStatus(currentStatus);
        }
    }, [currentStatus]);

    const form = useForm<EspFormData>({
        resolver: zodResolver(espSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const isFormDisabled = status === 'pending' || status === 'processing' || status === 'completed';

    async function onSubmit(data: EspFormData) {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Kullanıcı bulunamadı');

            // Check if user has permission (Monthly/Semester)
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('has_esp_access')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .single();

            if (!subscription?.has_esp_access) {
                toast.error('Bu özellik için Aylık veya Dönemlik paket gereklidir.');
                return;
            }

            const { error } = await supabase
                .from('esp_requests')
                .upsert({
                    user_id: user.id,
                    esp_email: data.email,
                    esp_password: data.password,
                    status: 'pending'
                }, { onConflict: 'user_id' });

            if (error) throw error;

            toast.success('Talebiniz başarıyla alındı.');
            setStatus('pending');
            form.reset();
        } catch (error: any) {
            toast.error(error.message || 'Talep oluşturulurken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <FadeIn>
                    <div className="bg-card border rounded-xl p-6 space-y-4 h-full relative">
                        {isFormDisabled && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl border border-transparent">
                                <div className="bg-background/90 p-4 rounded-lg border shadow-lg text-center max-w-[80%]">
                                    <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                                    <p className="font-semibold text-foreground">Talep Aktif</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Şu an aktif bir talebiniz olduğu için yeni bir talep oluşturamazsınız.
                                        Admin işlem yaptıktan sonra durum güncellenecektir.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Talep Oluştur
                            </h2>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-neutral-800 rounded-full">
                                        <Info className="w-4 h-4 text-neutral-400" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 text-sm p-4 bg-neutral-900 border-neutral-800 text-neutral-300">
                                    <p className="leading-relaxed">
                                        ESP Trust sistemi üzerinden otomatik takibinizin başlatılabilmesi için sisteme giriş bilgilerinizin doğru ve güncel olması gerekmektedir.
                                        İşlem süresince şifre değişikliği yapılması durumunda sistem bağlantısı kopacağı için takip işlemi gerçekleştirilemez.
                                        Lütfen giriş bilgilerinizin doğruluğundan emin olunuz; bilgileriniz yalnızca işlem süresince admin tarafından güvenle kullanılacaktır.
                                    </p>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <p className="text-sm text-neutral-500">
                            Bilgilerinizi girerek talep oluşturun. Detaylı bilgi için <Info className="w-3 h-3 inline align-middle mx-1" /> ikonuna tıklayın.
                        </p>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ESP E-posta</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="esp@medipol.edu.tr"
                                                    {...field}
                                                    disabled={loading || isFormDisabled}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ESP Şifre</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="******"
                                                    {...field}
                                                    disabled={loading || isFormDisabled}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Şifreniz güvenli bir şekilde iletilir.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full" disabled={loading || isFormDisabled}>
                                    {loading ? 'Gönderiliyor...' : isFormDisabled ? 'İşlem Devam Ediyor' : 'Talep Gönder'}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </FadeIn>

                <FadeIn delay={0.2}>
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Durum Bilgisi</h2>

                        {(status === 'none' || !status) && (
                            <div className="p-12 border border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground text-center">
                                <Clock className="w-12 h-12 mb-4 opacity-20" />
                                <p>Henüz aktif bir talebiniz bulunmuyor.</p>
                            </div>
                        )}

                        {status === 'pending' && (
                            <Alert className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
                                <Clock className="h-4 w-4" />
                                <AlertTitle>İşlem Bekleniyor</AlertTitle>
                                <AlertDescription>
                                    Talebiniz admin onayına gönderildi. En kısa sürede işleme alınacaktır.
                                </AlertDescription>
                            </Alert>
                        )}

                        {status === 'processing' && (
                            <Alert className="border-blue-500/50 bg-blue-500/10 text-blue-500">
                                <Clock className="h-4 w-4 animate-spin" />
                                <AlertTitle>İşleniyor</AlertTitle>
                                <AlertDescription>
                                    Hesabınız üzerinde şu an işlem yapılıyor. Lütfen bekleyiniz.
                                </AlertDescription>
                            </Alert>
                        )}

                        {status === 'completed' && (
                            <Alert className="border-green-500/50 bg-green-500/10 text-green-500">
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Tamamlandı</AlertTitle>
                                <AlertDescription>
                                    Talebiniz başarıyla tamamlandı ve üniteleriniz işlendi.
                                </AlertDescription>
                            </Alert>
                        )}

                        {status === 'failed' && (
                            <Alert className="border-red-500/50 bg-red-500/10 text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Başarısız</AlertTitle>
                                <AlertDescription>
                                    Talebiniz işlenemedi (yanlış şifre veya bağlantı hatası). Lütfen bilgilerinizi kontrol edip tekrar gönderin.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
