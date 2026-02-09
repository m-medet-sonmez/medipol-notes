'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { FadeIn } from '@/components/ui/fade-in';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Button } from '@/components/ui/button';
import { ESPLogo } from '@/components/ui/esp-logo';
import { Logo } from '@/components/ui/logo';
import { AskAdminModal } from '@/components/dashboard/AskAdminModal';
import { BookOpen, Calendar, Clock, Download, Shield, TrendingUp, FileText, Timer, GraduationCap, ClipboardCheck, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { differenceInDays } from 'date-fns';
import dynamic from 'next/dynamic';
import { CircularProgress } from '@/components/ui/circular-progress';
import { UserProfileDropdown } from '@/components/layout/UserProfileDropdown';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function StudentDashboard() {
    const { isLoading } = useAuth();
    const [userName, setUserName] = useState('');
    const [remainingDays, setRemainingDays] = useState(30);
    const supabase = createClient();
    const [stats, setStats] = useState({
        courses: 6,
        materials: 12,
        exams: 2
    });

    const [examStatus, setExamStatus] = useState<{
        vize: { daysLeft: number; isActive: boolean; progress: number };
        final: { daysLeft: number; isActive: boolean; progress: number };
    }>({
        vize: { daysLeft: 0, isActive: false, progress: 0 },
        final: { daysLeft: 0, isActive: false, progress: 0 }
    });

    const [subscription, setSubscription] = useState<{ plan: string; daysLeft: number } | null>(null);
    const [booksAnimation, setBooksAnimation] = useState<any>(null);
    const [clockAnimation, setClockAnimation] = useState<any>(null);
    const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
    const [weeklyNotesCount, setWeeklyNotesCount] = useState(0);

    useEffect(() => {
        // Initial Fetch
        const fetchRecentMaterials = async () => {
            const { data } = await supabase
                .from('materials')
                .select(`
                    id,
                    title,
                    created_at,
                    pdf_file_path,
                    audio_file_path,
                    courses (
                        course_name
                    )
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(3);

            if (data) {
                setRecentMaterials(data);
            }

            // Fetch count of materials this week
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const { count } = await supabase
                .from('materials')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true)
                .gte('created_at', oneWeekAgo.toISOString());

            if (count !== null) {
                setWeeklyNotesCount(count);
            }
        };

        fetchRecentMaterials();

        // Realtime Subscription
        const channel = supabase
            .channel('materials-dashboard')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'materials',
                    filter: 'is_active=eq.true'
                },
                (payload) => {
                    // New material added
                    // We need to fetch the course name manually or just refetch the list
                    // Refetching is safer to include relations
                    fetchRecentMaterials();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        fetch('/animations/books.json')
            .then(res => res.json())
            .then(data => setBooksAnimation(data))
            .catch(err => console.error("Books animation load error:", err));

        fetch('/animations/clock.json')
            .then(res => res.json())
            .then(data => setClockAnimation(data))
            .catch(err => console.error("Clock animation load error:", err));
    }, []);

    useEffect(() => {
        async function getUserDetails() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch profile and active subscription
                const { data: profile } = await supabase
                    .from('profiles')
                    .select(`
                        full_name,
                        subscriptions (
                            plan,
                            subscription_end_date,
                            is_active
                        )
                    `)
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    // Name formatting
                    const rawName = profile.full_name || 'Öğrenci';
                    const formattedName = rawName.split(' ').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ');
                    setUserName(formattedName);

                    // Subscription Logic
                    const activeSub = profile.subscriptions?.find((sub: any) => sub.is_active);
                    if (activeSub) {
                        const endDate = new Date(activeSub.subscription_end_date);
                        const daysLeft = differenceInDays(endDate, new Date());

                        let planName = 'Paket Yok';
                        if (activeSub.plan === 'weekly') planName = 'Haftalık Paket';
                        else if (activeSub.plan === 'monthly') planName = 'Aylık Paket';
                        else if (activeSub.plan === 'semester') planName = 'Dönemlik Paket';

                        setSubscription({
                            plan: planName,
                            daysLeft: Math.max(0, daysLeft)
                        });
                        setRemainingDays(Math.max(0, daysLeft));
                    } else {
                        setSubscription({ plan: 'Paket Yok', daysLeft: 0 });
                        setRemainingDays(0);
                    }
                }
            }
        }
        getUserDetails();

        // Exam Logic
        const now = new Date();
        const semesterStart = new Date('2026-02-01'); // Assume semester start
        const vizeStart = new Date('2026-03-28');
        const vizeEnd = new Date('2026-04-05');
        const finalStart = new Date('2026-06-01');
        const finalEnd = new Date('2026-06-12');

        const calculateProgress = (start: Date, target: Date) => {
            const totalDuration = differenceInDays(target, start);
            const elapsed = differenceInDays(now, start);
            return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        };

        // Vize Logic
        let vizeState = { daysLeft: 0, isActive: false, progress: 0 };
        if (now < vizeStart) {
            vizeState = {
                daysLeft: differenceInDays(vizeStart, now),
                isActive: false,
                progress: calculateProgress(semesterStart, vizeStart)
            };
        } else if (now <= vizeEnd) {
            vizeState = {
                daysLeft: differenceInDays(vizeEnd, now),
                isActive: true,
                progress: calculateProgress(vizeStart, vizeEnd)
            };
        }

        // Final Logic
        let finalState = { daysLeft: 0, isActive: false, progress: 0 };
        if (now < finalStart) {
            finalState = {
                daysLeft: differenceInDays(finalStart, now),
                isActive: false,
                progress: calculateProgress(vizeEnd, finalStart)
            };
        } else if (now <= finalEnd) {
            finalState = {
                daysLeft: differenceInDays(finalEnd, now),
                isActive: true,
                progress: calculateProgress(finalStart, finalEnd)
            };
        }

        setExamStatus({ vize: vizeState, final: finalState });
    }, []);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <FadeIn>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-6">
                    <div className="flex items-center gap-6">
                        <Logo />
                        <div className="hidden md:block w-px h-12 bg-border"></div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-foreground">
                                Hoş Geldin, <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">{userName.split(' ')[0]}</span> 👋
                            </h1>
                            <p className="text-muted-foreground font-medium mt-1">
                                Sen arkana yaslan, süreç bizde.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Profile Dropdown placed here */}
                        <UserProfileDropdown />
                    </div>
                </div>
            </FadeIn>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FadeIn delay={0.1}>
                    <SpotlightCard className="group relative p-6 h-full border-indigo-500/20 bg-gradient-to-br from-neutral-900 via-indigo-950/10 to-neutral-950 overflow-hidden flex flex-col justify-center">
                        {/* Background Decoration */}
                        <div className="absolute right-0 top-[35%] -translate-y-1/2 opacity-20 group-hover:opacity-30 transition-opacity grayscale hover:grayscale-0 duration-500 pointer-events-none">
                            {booksAnimation ? (
                                <Lottie animationData={booksAnimation} className="w-64 h-64" loop={true} />
                            ) : (
                                <BookOpen className="w-48 h-48 text-indigo-500" />
                            )}
                        </div>

                        <div className="relative z-10 flex flex-col justify-center h-full min-h-[140px]">
                            <div className="flex items-center gap-12">
                                <div className="flex flex-col shrink-0">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 ring-1 ring-indigo-500/20 backdrop-blur-sm">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <span className="text-indigo-400/80 text-xs font-bold uppercase tracking-wider">Akademik</span>
                                    </div>
                                    <p className="text-neutral-400 text-sm font-medium mb-1">Aktif Dersler</p>
                                    <h3 className="text-5xl font-bold text-white tracking-tight">
                                        {stats.courses}
                                    </h3>
                                </div>

                                {/* Course List */}
                                <div className="grid grid-rows-3 grid-flow-col gap-x-12 gap-y-4 my-auto translate-y-6">
                                    {[
                                        'Yöneylem Araştırması',
                                        'Programlama Dilleri',
                                        'Mesleki İngilizce',
                                        'Algoritma ve Veri Yapıları',
                                        'İstatistik 2',
                                        'Davranış Bilimleri'
                                    ].map((course, index) => (
                                        <div key={index} className="flex items-center gap-3 min-w-max">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></div>
                                            <span className="text-sm font-medium text-indigo-100/70 group-hover:text-indigo-300 transition-colors tracking-tight">
                                                {course}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-indigo-500/10 flex items-center gap-3">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs text-neutral-300 font-medium">Bu hafta <span className="text-emerald-400">{weeklyNotesCount} yeni not</span> eklendi</span>
                            </div>
                        </div>
                    </SpotlightCard>
                </FadeIn>

                <FadeIn delay={0.3}>
                    <div className="grid grid-cols-2 gap-4 h-full min-h-[300px]">
                        {/* Vize Card */}
                        <SpotlightCard className="group relative p-6 h-full border-blue-500/20 bg-gradient-to-br from-neutral-900 via-blue-950/10 to-neutral-950 overflow-hidden flex flex-col items-center justify-center text-center" spotlightColor="rgba(59, 130, 246, 0.15)">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/10" />

                            <div className="relative z-10 flex flex-col items-center">
                                <h3 className="text-lg font-medium text-blue-200/80 mb-4 tracking-wide">Vize Haftası</h3>

                                <CircularProgress
                                    value={examStatus.vize.progress}
                                    size={140}
                                    strokeWidth={8}
                                    color={examStatus.vize.isActive ? "text-red-500" : "text-blue-500"}
                                    className="mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-bold text-white tracking-tighter leading-none">
                                            {examStatus.vize.daysLeft}
                                        </span>
                                        <span className="text-xs font-medium text-blue-300/70 uppercase mt-1">
                                            Gün Kaldı
                                        </span>
                                    </div>
                                </CircularProgress>

                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${examStatus.vize.isActive
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    }`}>
                                    {examStatus.vize.isActive ? "Sınavlar Başladı" : "Yaklaşıyor"}
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* Final Card */}
                        <SpotlightCard className="group relative p-6 h-full border-purple-500/20 bg-gradient-to-br from-neutral-900 via-purple-950/10 to-neutral-950 overflow-hidden flex flex-col items-center justify-center text-center" spotlightColor="rgba(168, 85, 247, 0.15)">
                            {/* Background Decoration */}
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -ml-16 -mb-16 transition-all group-hover:bg-purple-500/10" />

                            <div className="relative z-10 flex flex-col items-center">
                                <h3 className="text-lg font-medium text-purple-200/80 mb-4 tracking-wide">Final Haftası</h3>

                                <CircularProgress
                                    value={examStatus.final.progress}
                                    size={140}
                                    strokeWidth={8}
                                    color={examStatus.final.isActive ? "text-red-500" : "text-purple-500"}
                                    className="mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl font-bold text-white tracking-tighter leading-none">
                                            {examStatus.final.daysLeft}
                                        </span>
                                        <span className="text-xs font-medium text-purple-300/70 uppercase mt-1">
                                            Gün Kaldı
                                        </span>
                                    </div>
                                </CircularProgress>

                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${examStatus.final.isActive
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                    }`}>
                                    {examStatus.final.isActive ? "Sınavlar Başladı" : "Hazırlık Vakti"}
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>
                </FadeIn>
            </div>

            {/* Recent Materials & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FadeIn delay={0.4} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Son Eklenen Materyaller</h2>
                        <Link href="/dashboard/dersler" className="text-sm text-primary hover:underline">Tümünü Gör</Link>
                    </div>

                    <div className="space-y-3">
                        {recentMaterials.length === 0 ? (
                            <div className="text-center p-4 text-muted-foreground text-sm border rounded-xl border-dashed">
                                Henüz not eklenmemiş.
                            </div>
                        ) : (
                            recentMaterials.map((material) => (
                                <Link href={`/dashboard/dersler`} key={material.id}>
                                    <div className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer mb-3">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium group-hover:text-primary transition-colors">
                                                    {material.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    <span className="font-medium text-indigo-400">{material.courses?.course_name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(material.created_at).toLocaleDateString('tr-TR')}</span>
                                                    <span>•</span>
                                                    <span className="uppercase">{material.pdf_file_path ? 'PDF' : 'MP3'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </FadeIn>

                <FadeIn delay={0.5} className="space-y-4">
                    <h2 className="text-xl font-semibold">Hızlı İşlemler</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/dashboard/dersler" className="block group h-full">
                            <SpotlightCard className="p-6 h-full min-h-[160px] border-neutral-800 bg-neutral-900/50 hover:border-green-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden group-hover:bg-neutral-900/80" spotlightColor="rgba(34, 197, 94, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <GraduationCap className="w-24 h-24 text-green-500 transform rotate-12 translate-x-8 -translate-y-8" />
                                </div>
                                <div className="flex flex-col items-start gap-3 h-full relative z-10">
                                    <div className="p-2.5 bg-green-500/10 rounded-lg text-green-500 ring-1 ring-green-500/20 group-hover:bg-green-500/20 transition-colors">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white/90 tracking-tight group-hover:text-green-400 transition-colors">Ders Notları</h3>
                                        <p className="text-sm text-neutral-400 font-medium leading-relaxed mt-1 line-clamp-2">
                                            Dönem derslerine ait notlara ve duyurulara buradan ulaşabilirsiniz.
                                        </p>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </Link>

                        <Link href="/dashboard/esp-trust" className="block group h-full">
                            <SpotlightCard className="p-6 h-full min-h-[160px] border-neutral-800 bg-neutral-900/50 hover:border-orange-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden group-hover:bg-neutral-900/80" spotlightColor="rgba(249, 115, 22, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ESPLogo className="w-48 h-auto text-orange-500 transform rotate-12 translate-x-12 -translate-y-8 grayscale opacity-50" />
                                </div>
                                <div className="flex flex-col items-start gap-3 h-full relative z-10">
                                    <div className="p-2.5 bg-orange-500/10 rounded-lg text-orange-500 ring-1 ring-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
                                        <ESPLogo className="w-20 h-auto" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white/90 tracking-tight group-hover:text-orange-400 transition-colors">ESP Trust Servisi</h3>
                                        <p className="text-sm text-neutral-400 font-medium leading-relaxed mt-1 line-clamp-2">
                                            İngilizce derslerin için otomatik takip ve puanlama sistemi.
                                        </p>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </Link>

                        <Link href="/dashboard/yoklama" className="block group h-full">
                            <SpotlightCard className="p-6 h-full min-h-[160px] border-neutral-800 bg-neutral-900/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden group-hover:bg-neutral-900/80" spotlightColor="rgba(59, 130, 246, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ClipboardCheck className="w-24 h-24 text-blue-500 transform rotate-12 translate-x-8 -translate-y-8" />
                                </div>
                                <div className="flex flex-col items-start gap-3 h-full relative z-10">
                                    <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-500 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                        <ClipboardCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white/90 tracking-tight group-hover:text-blue-400 transition-colors">Yoklama Takibi</h3>
                                        <p className="text-sm text-neutral-400 font-medium leading-relaxed mt-1 line-clamp-2">
                                            Derslere katılım durumunuzu buradan inceleyebilirsiniz.
                                        </p>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </Link>

                        <Link href="/dashboard/takvim" className="block group h-full">
                            <SpotlightCard className="p-6 h-full min-h-[160px] border-neutral-800 bg-neutral-900/50 hover:border-red-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden group-hover:bg-neutral-900/80" spotlightColor="rgba(239, 68, 68, 0.2)">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Calendar className="w-24 h-24 text-red-500 transform rotate-12 translate-x-8 -translate-y-8" />
                                </div>
                                <div className="flex flex-col items-start gap-3 h-full relative z-10">
                                    <div className="p-2.5 bg-red-500/10 rounded-lg text-red-500 ring-1 ring-red-500/20 group-hover:bg-red-500/20 transition-colors">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white/90 tracking-tight group-hover:text-red-400 transition-colors">Sınav Takvimi</h3>
                                        <p className="text-sm text-neutral-400 font-medium leading-relaxed mt-1 line-clamp-2">
                                            Vize ve Final sınavlarınızın tarih ve saatlerini buradan takip edebilirsiniz.
                                        </p>
                                    </div>
                                </div>
                            </SpotlightCard>
                        </Link>

                        <AskAdminModal>
                            <div className="block group w-full h-full cursor-pointer">
                                <SpotlightCard className="p-6 h-full min-h-[160px] border-neutral-800 bg-neutral-900/50 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden group-hover:bg-neutral-900/80" spotlightColor="rgba(168, 85, 247, 0.2)">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <MessageCircle className="w-24 h-24 text-purple-500 transform rotate-12 translate-x-8 -translate-y-8" />
                                    </div>
                                    <div className="flex flex-col items-start gap-3 h-full relative z-10">
                                        <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-500 ring-1 ring-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                                            <MessageCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white/90 tracking-tight group-hover:text-purple-400 transition-colors">Admine Sor</h3>
                                            <p className="text-sm text-neutral-400 font-medium leading-relaxed mt-1 line-clamp-2">
                                                Her türlü soru ve öneriniz için bizimle iletişime geçebilirsiniz.
                                            </p>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </div>
                        </AskAdminModal>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
}
