'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function LoginForm() {
    const { login, isLoading } = useAuth();

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    function onSubmit(data: LoginFormData) {
        login(data);
    }

    return (
        <div className="w-full space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white">Giriş Yap</h2>
                <p className="text-sm text-zinc-400 mt-2">
                    Ders notlarına erişmek için hesabınıza giriş yapın
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-zinc-300">E-posta</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="ornek@ogrenci.com"
                                        {...field}
                                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
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
                                <div className="flex items-center justify-between">
                                    <FormLabel className="text-zinc-300">Şifre</FormLabel>
                                    <Link
                                        href="/sifre-sifirlama"
                                        className="text-xs text-violet-400 hover:text-violet-300 hover:underline"
                                    >
                                        Şifremi Unuttum
                                    </Link>
                                </div>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="******"
                                        {...field}
                                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0" disabled={isLoading}>
                        {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </Button>
                </form>
            </Form>

            <div className="text-center text-sm text-zinc-400">
                Hesabınız yok mu?{' '}
                <Link href="/kayit" className="text-violet-400 hover:text-violet-300 hover:underline font-medium">
                    Hemen Kayıt Ol
                </Link>
            </div>
        </div>
    );
}
