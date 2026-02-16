'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LoginFormData, RegisterFormData } from '@/lib/validations/auth';

export function useAuth() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const login = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                throw error;
            }

            toast.success('Giriş başarılı');

            if (authData.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single();

                if (profile?.role === 'admin' || profile?.role === 'super_admin') {
                    router.push('/admin');
                } else {
                    // Check if student has active subscription
                    const { data: activeSub } = await supabase
                        .from('subscriptions')
                        .select('id, subscription_end_date, is_active')
                        .eq('user_id', authData.user.id)
                        .eq('is_active', true)
                        .single();

                    const hasActiveSub = activeSub &&
                        new Date(activeSub.subscription_end_date) > new Date();

                    if (hasActiveSub) {
                        router.push('/dashboard');
                    } else {
                        router.push('/checkout');
                    }
                }
            } else {
                router.push('/checkout');
            }
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Giriş yapılırken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            // 1. Sign up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                        department: 'Yönetim Bilişim Sistemleri',
                        student_group: data.group,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // Profil oluşturma artık Database Trigger (handle_new_user) tarafından yapılıyor.
                // fix_auth.sql dosyasını çalıştırdığınızdan emin olun.
            }

            toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
            router.push('/giris');
        } catch (error: any) {
            toast.error(error.message || 'Kayıt olurken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.push('/giris');
        router.refresh();
    };

    const resetPasswordForEmail = async (email: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/sifre-guncelle`,
            });
            if (error) throw error;
            toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
        } catch (error: any) {
            toast.error(error.message || 'Şifre sıfırlama e-postası gönderilirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserPassword = async (password: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            toast.success('Şifreniz başarıyla güncellendi.');
            router.push('/giris');
        } catch (error: any) {
            toast.error(error.message || 'Şifre güncellenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login,
        register,
        logout,
        isLoading,
        user,
        resetPasswordForEmail,
        updateUserPassword,
    };
}
