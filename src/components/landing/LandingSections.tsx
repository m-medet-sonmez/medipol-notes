'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    BookOpen,
    Headphones,
    CheckCircle2,
    Calendar,
    MessageCircle,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Menu,
    X,
    Shield,
    Clock,
    Target,
    Users
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- HERO SECTION ---
export function HeroSection() {
    return (
        <div className="relative isolate overflow-hidden bg-background">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#7C3AED] to-[#5B21B6] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
            </div>

            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
                    <div className="mt-24 sm:mt-32 lg:mt-16">
                        <a href="#" className="inline-flex space-x-6">
                            <span className="rounded-full bg-purple-600/10 px-3 py-1 text-sm font-semibold leading-6 text-purple-400 ring-1 ring-inset ring-purple-600/20">
                                2026 Bahar Dönemi
                            </span>
                        </a>
                    </div>
                    <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                        Derslerden Kafan <span className="text-[#7C3AED]">Rahat Olsun</span>
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-300">
                        YBS 2. Sınıf öğrencileri için tasarlanmış, akademik hayatı kolaylaştıran akıllı not ve takip platformu.
                    </p>
                    <div className="mt-10 flex items-center gap-x-6">
                        <Link href="#pricing">
                            <Button size="lg" className="bg-[#7C3AED] hover:bg-[#5B21B6] text-white">
                                Hemen Başla
                            </Button>
                        </Link>
                        <Link href="#how-it-works" className="text-sm font-semibold leading-6 text-white hover:text-purple-300 transition-colors">
                            Nasıl Çalışır? <span aria-hidden="true">→</span>
                        </Link>
                    </div>

                    <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-purple-500" /> Haftalık Notlar
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-purple-500" /> Sesli Özetler
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-purple-500" /> ESP Takibi
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-purple-500" /> Sınav Takvimi
                        </div>
                    </div>
                </div>

                {/* Visual Element - Abstract Laptop/Dashboard Representation */}
                <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
                    <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                        <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                            <div className="rounded-md bg-gray-800/60 p-4 border border-white/10 shadow-2xl backdrop-blur-md">
                                {/* Mock UI Elements */}
                                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-8 w-1/3 bg-white/10 rounded animate-pulse"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-32 bg-purple-500/20 rounded border border-purple-500/30 p-4 flex flex-col justify-between">
                                            <div className="h-8 w-8 rounded bg-purple-500/40"></div>
                                            <div className="h-4 w-3/4 bg-purple-500/40 rounded"></div>
                                        </div>
                                        <div className="h-32 bg-blue-500/20 rounded border border-blue-500/30 p-4 flex flex-col justify-between">
                                            <div className="h-8 w-8 rounded bg-blue-500/40"></div>
                                            <div className="h-4 w-3/4 bg-blue-500/40 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="h-24 bg-white/5 rounded border border-white/10"></div>
                                    <div className="h-24 bg-white/5 rounded border border-white/10"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#5B21B6] to-[#7C3AED] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
            </div>
        </div>
    );
}

// --- PROBLEM SECTION ---
export function ProblemSection() {
    const problems = [
        { icon: Clock, title: "Zaman Sıkıntısı", desc: "Derse katılamadığınız günler oluyor veya staj nedeniyle yetişemiyorsunuz." },
        { icon: Target, title: "Hedef Sorunu", desc: "İlgili dersin kariyer hedeflerinize katkısını görmekte zorlanıyorsunuz." },
        { icon: BookOpen, title: "Not Eksikliği", desc: "Vize-final haftalarında kaliteli ve güvenilir not bulmak bir kabusa dönüşüyor." },
        { icon: Shield, title: "Takip Zorluğu", desc: "İngilizce ödevlerini veya sınav tarihlerini unutma riskiyle yaşıyorsunuz." },
    ];

    return (
        <div className="bg-[#0F0F0F] py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-purple-400">Neden KafaRahat?</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Bu Durumlar Tanıdık Geliyor mu?
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-400">
                        Üniversite hayatının koşturmacasında bazı şeyler gözden kaçabilir. KafaRahat, tam da bu sorunlara çözüm olarak tasarlandı.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                        {problems.map((problem) => (
                            <div key={problem.title} className="relative pl-16">
                                <dt className="text-base font-semibold leading-7 text-white">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                                        <problem.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    {problem.title}
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-gray-400">{problem.desc}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}

// --- FEATURES SECTION ---
export function FeaturesSection() {
    const features = [
        {
            title: "Haftalık Ders Özetleri",
            desc: "Derste fiziki olarak bulunan arkadaşlarınız tarafından tutulan, sınav odaklı notlar. AI yok, gerçek sınıf deneyimi.",
            icon: "📚" // Using emoji as requested/simple alternative
        },
        {
            title: "Podcast Özetleri",
            desc: "Yolda, sporda, dinlenirken... Ders özetlerinin sesli versiyonları ile günün özetine istediğiniz yerden ulaşın.",
            icon: "🎧"
        },
        {
            title: "ESP Trust Takibi",
            desc: "İngilizce ödevinizi unutmayın! Ünite notları paylaşılır, takvim takibi bizden, yükleme kontrolü sizden.",
            icon: "📧"
        },
        {
            title: "Sınav Takvimi & Hatırlatıcılar",
            desc: "Vize ve final tarihlerini kaçırmayın. Geri sayım sayacı ve otomatik email bildirimleri ile her zaman hazırsınız.",
            icon: "⏰"
        },
        {
            title: "Yoklama Takibi",
            desc: "Hangi derslerde imza attınız, hangilerinde eksik? Yoklama takviminizi kolayca yönetin, devamsızlık derdine son.",
            icon: "📋"
        },
        {
            title: "Admine Sor",
            desc: "Kafanıza takılan bir şey mi var? Teknik destek veya özellik talepleri için anında yanıt alın.",
            icon: "💬"
        }
    ];

    return (
        <div className="bg-black py-24 sm:py-32" id="features">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-purple-400">Özellikler</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Neler Sunuyoruz?
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.title} className="flex flex-col bg-white/5 p-8 rounded-2xl hover:bg-white/10 transition-colors border border-white/10">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white mb-4">
                                    <span className="text-4xl">{feature.icon}</span>
                                    {feature.title}
                                </dt>
                                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-400">
                                    <p className="flex-auto">{feature.desc}</p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}

// --- HOW IT WORKS SECTION ---
export function HowItWorksSection() {
    return (
        <div className="bg-[#0F0F0F] py-24 sm:py-32" id="how-it-works">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">3 Adımda Başla</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-400">
                        Karmaşık süreçler yok. Sadece 3 adımda dönemi kurtar.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Step 1 */}
                    <div className="relative flex flex-col items-center p-8 bg-black/40 rounded-3xl border border-white/5 text-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-900/30 text-purple-400 text-2xl font-bold mb-6 border border-purple-500/20">
                            1
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Kayıt Ol</h3>
                        <p className="text-gray-400">
                            İsminiz ve mail adresinizle hızlıca kayıt olun. Öğrenci numarası veya karmaşık bilgiler gerekmez.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex flex-col items-center p-8 bg-black/40 rounded-3xl border border-white/5 text-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-900/30 text-purple-400 text-2xl font-bold mb-6 border border-purple-500/20">
                            2
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Paketini Şeç</h3>
                        <p className="text-gray-400">
                            2026 Bahar Dönemi paketini seçin ve Shopier güvencesiyle tek seferlik ödemenizi tamamlayın.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex flex-col items-center p-8 bg-black/40 rounded-3xl border border-purple-500/20 text-center shadow-[0_0_30px_-15px_rgba(124,58,237,0.3)]">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#7C3AED] text-white text-2xl font-bold mb-6">
                            3
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Kafan Rahat Olsun</h3>
                        <p className="text-gray-400">
                            Haftalık notlar, podcastler, sınav hatırlatmaları ve ESP Trust takibi otomatik olarak panelinize gelsin.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- PRICING SECTION ---
export function PricingSection() {
    return (
        <div className="bg-black py-24 sm:py-32" id="pricing">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl sm:text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Basit, Net, Şeffaf</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-400">
                        Gizli ücret yok. Bütün dönem tek bir paket.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-white/10 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
                    <div className="p-8 sm:p-10 lg:flex-auto">
                        <h3 className="text-2xl font-bold tracking-tight text-white">2026 Bahar Dönemi Paketi</h3>
                        <p className="mt-6 text-base leading-7 text-gray-400">
                            Bu paket ile tüm dönem boyunca ihtiyacınız olan her şeye erişim sağlarsınız. Şubat'tan Mayıs sonuna kadar tüm içerikler emrinizde.
                        </p>
                        <div className="mt-10 flex items-center gap-x-4">
                            <h4 className="flex-none text-sm font-semibold leading-6 text-purple-400">Neler Dahil?</h4>
                            <div className="h-px flex-auto bg-gray-100/10" />
                        </div>
                        <ul role="list" className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-300 sm:grid-cols-2 sm:gap-6">
                            {['Tüm ders notları', 'Sınırsız podcast', 'ESP Trust takibi', 'Yoklama yönetimi', 'Sınav hatırlatıcıları', 'Admin desteği'].map((feature) => (
                                <li key={feature} className="flex gap-x-3">
                                    <CheckCircle2 className="h-6 w-5 flex-none text-purple-400" aria-hidden="true" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
                        <div className="rounded-2xl bg-gray-900 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                            <div className="mx-auto max-w-xs px-8">
                                <p className="text-base font-semibold text-gray-400">Dönemlik Ödeme</p>
                                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                                    <span className="text-5xl font-bold tracking-tight text-white">3.000 TL</span>
                                </p>
                                <p className="mt-2 text-sm text-gray-500">3 Ay için (Aylık 1.000 TL'ye gelir)</p>
                                <Link
                                    href="/kayit"
                                    className="mt-10 block w-full rounded-md bg-[#7C3AED] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#5B21B6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all transform hover:scale-105"
                                >
                                    Hemen Satın Al
                                </Link>
                                <p className="mt-6 text-xs leading-5 text-gray-500">
                                    Kredi kartı ile güvenli ödeme (Shopier)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- FAQ SECTION ---
export function FAQSection() {
    const faqs = [
        {
            question: "KafaRahat sadece YBS 2. sınıf için mi?",
            answer: "Şu anda evet. 2026 Bahar Dönemi için sadece YBS 2. sınıf öğrencilerine özel olarak hazırlandı."
        },
        {
            question: "Notlar kim tarafından tutuluyor?",
            answer: "Derslerde fiziki olarak bulunan, başarılı ve deneyimli ekip arkadaşlarımız tarafından sınav odaklı olarak tutulmaktadır."
        },
        {
            question: "ESP Trust güvenli mi?",
            answer: "Evet. Sistemimiz sadece ödev takibi için veri kullanır. Verileriniz şifreli olarak saklanır ve üçüncü taraflarla paylaşılmaz."
        },
        {
            question: "Mobil uygulamanız var mı?",
            answer: "Şu an için responsive (mobil uyumlu) web sitemiz üzerinden hizmet veriyoruz. Telefondan rahatlıkla kullanabilirsiniz."
        },
        {
            question: "İade imkanı var mı?",
            answer: "Ödeme sonrası ilk hafta içinde memnun kalmazsanız koşulsuz iade hakkınız vardır."
        }
    ];

    return (
        <div className="bg-[#0F0F0F] py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl divide-y divide-white/10">
                    <h2 className="text-2xl font-bold leading-10 tracking-tight text-white text-center mb-10">Sıkça Sorulan Sorular</h2>
                    <dl className="mt-10 space-y-6 divide-y divide-white/10">
                        {faqs.map((faq, index) => (
                            <Disclosure key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}

function Disclosure({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="pt-6">
            <dt>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full items-start justify-between text-left text-white"
                >
                    <span className="text-base font-semibold leading-7">{question}</span>
                    <span className="ml-6 flex h-7 items-center">
                        {isOpen ? (
                            <ChevronUp className="h-6 w-6" aria-hidden="true" />
                        ) : (
                            <ChevronDown className="h-6 w-6" aria-hidden="true" />
                        )}
                    </span>
                </button>
            </dt>
            {isOpen && (
                <dd className="mt-2 pr-12">
                    <p className="text-base leading-7 text-gray-400">{answer}</p>
                </dd>
            )}
        </div>
    );
}

// --- CTA SECTION ---
export function CTASection() {
    return (
        <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
            <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl">
                <div className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-[#7C3AED] to-[#5B21B6]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
            </div>

            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Kafan Rahat Etsin.
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                    2026 Bahar Döneminde diploma bürokratisinden kurtulun. Zamanınızı asıl öğrenmek istediğiniz konulara ayırın.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link href="/kayit">
                        <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100 font-bold px-8 py-6 text-lg">
                            Şimdi Başla - 3.000 TL
                        </Button>
                    </Link>
                </div>
                <div className="mt-10 text-sm text-gray-500">
                    <p>🎓 YBS 2. Sınıf | 2026 Bahar Dönemi</p>
                </div>
            </div>
        </div>
    );
}
