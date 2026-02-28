'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function ForgotPasswordForm() {
    const { resetPasswordForEmail, isLoading } = useAuth();
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await resetPasswordForEmail(email);
    };

    return (
        <div className="w-full space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white">Şifremi Unuttum</h2>
                <p className="text-sm text-zinc-400 mt-2">
                    E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">E-posta</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="ornek@ogrenci.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
                    disabled={isLoading}
                >
                    {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </Button>
            </form>

            <div className="text-center text-sm text-zinc-400">
                <Link href="/giris" className="text-violet-400 hover:text-violet-300 hover:underline font-medium">
                    Giriş ekranına dön
                </Link>
            </div>
        </div>
    );
}
