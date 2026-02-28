'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, LogOut, Users, Gem, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
    full_name: string;
    student_group?: string;
    department?: string;
}

interface Subscription {
    plan: string;
    subscription_end_date: string;
}

export function UserProfileDropdown() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [remainingDays, setRemainingDays] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    console.log('UserProfileDropdown: No user logged in');
                    setLoading(false);
                    return;
                }

                // 1. Fetch Profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('UserProfileDropdown: Error fetching profile:', profileError);
                }

                if (profileData) {
                    setProfile(profileData);
                } else {
                    console.warn('UserProfileDropdown: No profile data found');
                }

                // 2. Fetch Subscription
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('plan, subscription_end_date')
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .order('subscription_end_date', { ascending: false })
                    .limit(1)
                    .single();

                if (subData) {
                    setSubscription(subData);
                    const end = new Date(subData.subscription_end_date);
                    const now = new Date();
                    const diffTime = Math.abs(end.getTime() - now.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setRemainingDays(end > now ? diffDays : 0);
                }
            } catch (error) {
                console.error('UserProfileDropdown: Global fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success('Başarıyla çıkış yapıldı');
            router.push('/giris');
            router.refresh();
        } catch (error) {
            toast.error('Çıkış yapılırken bir hata oluştu');
        }
    };

    if (loading) {
        return (
            <div className="w-full h-16 bg-muted/20 animate-pulse rounded-xl flex items-center gap-3 p-2">
                <div className="h-10 w-10 bg-muted/40 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 bg-muted/40 rounded" />
                    <div className="h-2 w-16 bg-muted/40 rounded" />
                </div>
            </div>
        );
    }

    // Fallback profile if data fetch failed or user not logged in
    const displayProfile = profile || {
        full_name: 'Öğrenci',
        student_group: 'Grup Seçilmedi',
        department: 'YBS'
    };

    const initials = displayProfile.full_name
        ? displayProfile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    const getDaysColor = (days: number) => {
        if (days <= 7) return 'text-red-400';
        if (days <= 14) return 'text-yellow-400';
        return 'text-green-400';
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full h-auto p-3 flex items-center justify-between hover:bg-slate-800 transition-all rounded-xl border border-border/40 bg-card/30"
                >
                    <div className="flex items-center gap-4 overflow-hidden">
                        <Avatar className="h-12 w-12 border-2 border-purple-500/20">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-purple-600 text-white font-bold text-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start gap-1 text-left overflow-hidden">
                            <span className="font-semibold text-base truncate w-full text-foreground/90">
                                {displayProfile.full_name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate w-full flex items-center gap-1">
                                📚 {displayProfile.department || 'YBS'}
                            </span>
                        </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-2" align="start" side="bottom">
                <div className="px-2 py-1.5 space-y-3 mb-2">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Kullanıcı Grubu</p>
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground bg-secondary/30 p-2 rounded-md border border-border/50">
                            <Users className="h-4 w-4 text-blue-400" />
                            {displayProfile.student_group || 'Grup Seçilmedi'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Abonelik Durumu</p>
                        {subscription ? (
                            <div className="bg-secondary/30 p-2 rounded-md border border-border/50 space-y-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Gem className="h-4 w-4 text-purple-400" />
                                    <span>
                                        {subscription.plan === 'semester'
                                            ? 'Dönemlik Paket'
                                            : subscription.plan === 'monthly' ? 'Aylık Paket' : 'Haftalık Paket'}
                                    </span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs font-medium ${getDaysColor(remainingDays)}`}>
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{remainingDays} gün kaldı</span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-500/10 p-2 rounded-md border border-red-500/20 text-red-500 text-sm font-medium flex items-center gap-2">
                                ❌ Abonelik Yok
                            </div>
                        )}
                    </div>
                </div>

                <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer font-medium p-2.5 rounded-md"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış Yap</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
