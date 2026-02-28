'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, BookOpen, Shield, Calendar, CalendarDays,
    HelpCircle, User, Upload, Users, MessageSquare,
    LayoutDashboard, LogOut, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';
import { UserProfileDropdown } from '@/components/layout/UserProfileDropdown';

interface MenuItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const studentMenuItems: MenuItem[] = [
    { label: 'Ana Sayfa', href: '/dashboard', icon: Home },
    { label: 'Derslerim', href: '/dashboard/notlar', icon: BookOpen },
    { label: 'ESP Trust', href: '/dashboard/esp-trust', icon: Shield },
    { label: 'Yoklama', href: '/dashboard/yoklama', icon: Calendar },
    { label: 'Sınav Takvimi', href: '/dashboard/exams', icon: CalendarDays },
    { label: 'Destek', href: '/dashboard/destek', icon: HelpCircle },
    { label: 'Profil', href: '/dashboard/profil', icon: User },
    { label: 'Abonelik', href: '/dashboard/abonelik', icon: CreditCard },
];

const adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'İçerik Yükle', href: '/admin/icerik-yukle', icon: Upload },
    { label: 'Gelen Sorular', href: '/admin/sorular', icon: MessageSquare }, // Repurposed 'Dersler' slot
    { label: 'Ders Yönetimi', href: '/admin/dersler', icon: BookOpen }, // Moved down
    { label: 'Öğrenciler', href: '/admin/ogrenciler', icon: Users },
    { label: 'ESP Talepleri', href: '/admin/esp-talepler', icon: Shield },
    { label: 'Yoklama', href: '/admin/yoklama', icon: Calendar },
    { label: 'Sınav Takvimi', href: '/admin/exams', icon: CalendarDays },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = createClient();

    // Check admin role
    useEffect(() => {
        async function checkRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            setIsAdmin(data?.role === 'admin');
        }
        checkRole();
    }, []);

    const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

    return (
        <aside className={cn("w-64 min-h-screen bg-card border-r flex flex-col", className)}>
            <div className="p-6 border-b flex flex-col gap-4">
                <div className="flex justify-center">
                    <Logo />
                </div>
                <UserProfileDropdown />
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t bg-muted/20 text-xs text-center text-muted-foreground">
                v1.0.0
            </div>
        </aside>
    );
}
