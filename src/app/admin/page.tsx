import { createClient } from '@/lib/supabase/server';
import { FadeIn } from '@/components/ui/fade-in';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Button } from '@/components/ui/button';
import { Upload, Users, Shield, BookOpen, Calendar, ClipboardList, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch recent support tickets
    const { data: recentTickets } = await supabase
        .from('support_tickets')
        .select(`
            id,
            created_at,
            subject,
            profiles (
                full_name,
                email
            )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="space-y-8">
            <FadeIn>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent drop-shadow-sm select-none">
                            Yönetici Paneli
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium">
                            Platform yönetim merkezi ve hızlı erişim menüsü.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button variant="outline">
                                Öğrenci Görünümü
                            </Button>
                        </Link>
                    </div>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Gelen Sorular (Dynamic) */}
                <FadeIn delay={0.1}>
                    <Link href="/admin/sorular" className="block h-full group">
                        <SpotlightCard className="p-6 h-full bg-neutral-900 border-indigo-500/20 hover:border-indigo-500/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 ring-1 ring-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">Gelen Sorular</h3>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {recentTickets && recentTickets.length > 0 ? (
                                    recentTickets.map((ticket: any) => (
                                        <div key={ticket.id} className="flex flex-col gap-0.5 text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-center text-xs text-neutral-500">
                                                <span>{format(new Date(ticket.created_at), 'd MMM HH:mm', { locale: tr })}</span>
                                            </div>
                                            <span className="font-medium text-neutral-300 truncate">{ticket.profiles?.full_name || 'İsimsiz'}</span>
                                            <span className="text-xs text-neutral-500 truncate">{ticket.profiles?.email}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-neutral-400">
                                        Henüz yanıtlanmamış soru bulunmuyor.
                                    </p>
                                )}
                            </div>
                        </SpotlightCard>
                    </Link>
                </FadeIn>

                {/* 2. İçerik Yükle */}
                <FadeIn delay={0.2}>
                    <Link href="/admin/icerik-yukle" className="block h-full group">
                        <SpotlightCard className="p-6 h-full bg-neutral-900 border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 ring-1 ring-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">İçerik Yükle</h3>
                                </div>
                            </div>
                            <p className="text-sm text-neutral-400">
                                Haftalık ders notları, PDF'ler ve ses kayıtlarını sisteme yükleyin.
                            </p>
                        </SpotlightCard>
                    </Link>
                </FadeIn>

                {/* 3. Sınav Takvimi */}
                <FadeIn delay={0.3}>
                    <Link href="/admin/exams" className="block h-full group">
                        <SpotlightCard className="p-6 h-full bg-neutral-900 border-orange-500/20 hover:border-orange-500/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 ring-1 ring-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">Sınav Takvimi</h3>
                                </div>
                            </div>
                            <p className="text-sm text-neutral-400">
                                Vize ve final tarihlerini belirleyin, sınav yerlerini güncelleyin.
                            </p>
                        </SpotlightCard>
                    </Link>
                </FadeIn>

                {/* 4. Yoklama Sistemi */}
                <FadeIn delay={0.4}>
                    <Link href="/admin/yoklama" className="block h-full group">
                        <SpotlightCard className="p-6 h-full bg-neutral-900 border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                    <ClipboardList className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">Yoklama Girişi</h3>
                                </div>
                            </div>
                            <p className="text-sm text-neutral-400">
                                Haftalık öğrenci katılım durumlarını hızlıca sisteme işleyin.
                            </p>
                        </SpotlightCard>
                    </Link>
                </FadeIn>

                {/* 5. Öğrenci Yönetimi */}
                <FadeIn delay={0.5}>
                    <Link href="/admin/ogrenciler" className="block h-full group">
                        <SpotlightCard className="p-6 h-full bg-neutral-900 border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 ring-1 ring-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Öğrenci İşleri</h3>
                                </div>
                            </div>
                            <p className="text-sm text-neutral-400">
                                Kayıtlı öğrencileri görüntüleyin, paket durumlarını kontrol edin.
                            </p>
                        </SpotlightCard>
                    </Link>
                </FadeIn>

                {/* 6. ESP Talepleri */}
                <FadeIn delay={0.6}>
                    <Link href="/admin/esp-talepler" className="block h-full group">
                        <SpotlightCard className="p-6 h-full bg-neutral-900 border-yellow-500/20 hover:border-yellow-500/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 ring-1 ring-yellow-500/20 group-hover:bg-yellow-500/20 transition-colors">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">ESP Talepleri</h3>
                                </div>
                            </div>
                            <p className="text-sm text-neutral-400">
                                Gelen ESP şifre taleplerini inceleyin ve işleme alın.
                            </p>
                        </SpotlightCard>
                    </Link>
                </FadeIn>
            </div>
        </div>
    );
}
