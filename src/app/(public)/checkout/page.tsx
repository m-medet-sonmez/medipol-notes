'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Copy, CreditCard, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const IBAN = 'TR18 0020 5000 0982 1367 7000 01';
const IBAN_RAW = 'TR180020500009821367700001';
const ACCOUNT_HOLDER = 'Muhammed Medet Sönmez';

export default function CheckoutPage() {
    const [isChecked, setIsChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [hasPending, setHasPending] = useState(false);
    const [copied, setCopied] = useState(false);
    const [userName, setUserName] = useState('');
    const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setUserLoggedIn(false);
                return;
            }
            setUserLoggedIn(true);

            // Get user name
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUserName(profile.full_name);
            }

            // Check if user already has a pending payment request
            const { data: existingRequest } = await supabase
                .from('payment_requests')
                .select('id, status')
                .eq('user_id', user.id)
                .eq('status', 'pending')
                .single();

            if (existingRequest) {
                setHasPending(true);
            }

            // Check if user already has an active subscription
            const { data: activeSub } = await supabase
                .from('subscriptions')
                .select('id')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .single();

            if (activeSub) {
                router.push('/dashboard');
            }
        };
        checkUser();
    }, []);

    const handleCopyIBAN = async () => {
        try {
            await navigator.clipboard.writeText(IBAN_RAW);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
        }
    };

    const handleSubmit = async () => {
        if (!isChecked || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/giris');
                return;
            }

            const { error } = await supabase
                .from('payment_requests')
                .insert({
                    user_id: user.id,
                    full_name: userName || 'İsimsiz',
                });

            if (error) {
                console.error('Payment request error:', error);
                // Still show success UX
            }

            setIsSuccess(true);
        } catch (err) {
            console.error('Payment submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (userLoggedIn === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="animate-pulse text-gray-400">Yükleniyor...</div>
            </div>
        );
    }

    // Not logged in state
    if (userLoggedIn === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="p-4 bg-yellow-500/10 rounded-2xl inline-block">
                        <AlertCircle className="w-12 h-12 text-yellow-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Önce Giriş Yapmalısınız</h1>
                    <p className="text-gray-400">Ödeme işlemi için hesabınıza giriş yapmanız gerekiyor.</p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/giris"
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">
                            Giriş Yap
                        </Link>
                        <Link href="/kayit"
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium border border-white/10 transition-colors">
                            Kayıt Ol
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (isSuccess || hasPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full" />
                        <div className="relative p-6 bg-green-500/10 rounded-full inline-block ring-1 ring-green-500/20">
                            <CheckCircle2 className="w-16 h-16 text-green-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {hasPending && !isSuccess ? 'Ödemeniz Zaten İletildi' : 'Ödemeniz İletilmiştir!'}
                    </h1>
                    <p className="text-gray-400 leading-relaxed">
                        Ödemeniz kontrol edilip size dönüş yapılacaktır. <br />
                        Onaylandığında giriş yaptığınızda otomatik olarak panele yönlendirileceksiniz.
                    </p>
                    <div className="pt-4">
                        <Link href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium border border-white/10 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Main payment page
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12">
            <div className="w-full max-w-lg space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="p-4 bg-purple-500/10 rounded-2xl inline-block ring-1 ring-purple-500/20">
                        <CreditCard className="w-10 h-10 text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Ödeme</h1>
                    <p className="text-gray-400">
                        Dönemlik paket — <span className="text-purple-400 font-semibold">2.999 ₺</span>
                    </p>
                </div>

                {/* IBAN Card */}
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-[28px] blur opacity-40" />
                    <div className="relative bg-gray-900/80 border border-white/10 backdrop-blur-xl rounded-[24px] p-8 space-y-6">
                        {/* Account Holder */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alıcı Adı</label>
                            <p className="text-xl font-bold text-white">{ACCOUNT_HOLDER}</p>
                        </div>

                        {/* IBAN */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">IBAN</label>
                            <div className="flex items-center gap-3">
                                <p className="text-lg font-mono text-white tracking-wider flex-1">{IBAN}</p>
                                <button
                                    onClick={handleCopyIBAN}
                                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all hover:scale-105 active:scale-95"
                                    title="IBAN Kopyala"
                                >
                                    <Copy className={`w-4 h-4 transition-colors ${copied ? 'text-green-400' : 'text-gray-400'}`} />
                                </button>
                            </div>
                            {copied && (
                                <p className="text-xs text-green-400 font-medium">IBAN kopyalandı!</p>
                            )}
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-yellow-300">Önemli</p>
                                    <p className="text-sm text-yellow-200/70 leading-relaxed">
                                        Havale/EFT yaparken açıklama kısmına mutlaka <strong className="text-yellow-300">ad ve soyadınızı</strong> yazın.
                                        Bu bilgi, ödemenizin doğrulanması için gereklidir.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation */}
                <div className="space-y-4">
                    <label
                        className="flex items-start gap-4 p-4 bg-gray-900/50 border border-white/10 rounded-xl cursor-pointer hover:bg-gray-900/80 transition-colors group"
                        htmlFor="payment-confirm"
                    >
                        <div className="relative mt-0.5">
                            <input
                                type="checkbox"
                                id="payment-confirm"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-5 h-5 border-2 border-gray-600 rounded-md peer-checked:border-purple-500 peer-checked:bg-purple-500 transition-all flex items-center justify-center">
                                {isChecked && (
                                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="text-sm text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
                            Yukarıdaki IBAN adresine <strong className="text-white">2.999 ₺</strong> tutarında havale/EFT yaptığımı
                            ve açıklama kısmına adımı soyadımı yazdığımı onaylıyorum.
                        </span>
                    </label>

                    <button
                        onClick={handleSubmit}
                        disabled={!isChecked || isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 disabled:shadow-none hover:shadow-purple-500/30 active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                İşleniyor...
                            </span>
                        ) : (
                            'Ödemeyi Yaptım'
                        )}
                    </button>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-gray-600">
                    Sorun yaşarsanız WhatsApp üzerinden iletişime geçebilirsiniz.
                </p>
            </div>
        </div>
    );
}
