'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function UpdatePasswordForm() {
    const { updateUserPassword, isLoading } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Şifreler eşleşmiyor!');
            return;
        }

        if (password.length < 6) {
            toast.error('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        await updateUserPassword(password);
    };

    return (
        <div className="w-full space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white">Yeni Şifre Belirle</h2>
                <p className="text-sm text-zinc-400 mt-2">
                    Lütfen hesabınız için yeni bir şifre girin.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-300">Yeni Şifre</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-zinc-300">Şifre Tekrarı</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="******"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
                    disabled={isLoading}
                >
                    {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </Button>
            </form>
        </div>
    );
}
