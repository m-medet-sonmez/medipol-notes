import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, CreditCard, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch active subscription
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

    const planNames: Record<string, string> = {
        weekly: 'Haftalık Paket',
        monthly: 'Aylık Paket',
        semester: 'Dönemlik Paket',
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight">Profilim</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Kişisel Bilgiler */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Kişisel Bilgiler
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Ad Soyad</label>
                            <div className="font-medium text-lg">{profile?.full_name}</div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                E-posta Adresi
                            </label>
                            <div className="font-medium">{profile?.email}</div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Kayıt Tarihi
                            </label>
                            <div className="font-medium">
                                {profile?.created_at && format(new Date(profile.created_at), 'd MMMM yyyy', { locale: tr })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Abonelik Bilgileri */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Abonelik Durumu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {subscription ? (
                            <>
                                <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Mevcut Plan</div>
                                        <div className="font-bold text-xl text-primary">
                                            {planNames[subscription.plan] || subscription.plan}
                                        </div>
                                    </div>
                                    <Badge className="bg-green-600 hover:bg-green-700">Aktif</Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            Başlangıç
                                        </span>
                                        <span className="font-medium">
                                            {format(new Date(subscription.subscription_start_date), 'd MMM yyyy', { locale: tr })}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            Bitiş
                                        </span>
                                        <span className="font-medium">
                                            {format(new Date(subscription.subscription_end_date), 'd MMM yyyy', { locale: tr })}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">Aktif aboneliğiniz bulunmuyor.</p>
                                <Badge variant="outline">Pasif</Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
