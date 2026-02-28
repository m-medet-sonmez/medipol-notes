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
            {/* Background Gradients */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#7C3AED] to-[#5B21B6] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
            </div>

            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8 relative z-10">
                    <div className="mt-24 sm:mt-32 lg:mt-16">
                        <a href="#" className="inline-flex space-x-6">
                            <span className="rounded-full bg-purple-600/10 px-3 py-1 text-sm font-semibold leading-6 text-purple-400 ring-1 ring-inset ring-purple-600/20">
                                2026 Bahar Dönemi
                            </span>
                        </a>
                    </div>
                    <h1 className="mt-10 text-4xl font-bold font-heading tracking-tight text-white sm:text-6xl">
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
                            <CheckCircle2 className="h-4 w-4 text-purple-500" /> Yoklama Takibi
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-purple-500" /> ESP Takibi
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-purple-500" /> Sınav Takvimi
                        </div>
                    </div>
                </div>

                {/* Visual Element - Hero Illustration (Immersive) */}
                <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <div className="relative w-full h-full">
                        {/* No solid overlays - purely relying on mask for perfect background matching */}
                        <img
                            src="/hero-illustration-new.png"
                            alt="Stressed student studying"
                            className="w-full h-full object-cover lg:object-left-top opacity-90 hover:opacity-100 transition-opacity duration-700 select-none"
                            style={{
                                maskImage: 'linear-gradient(to right, transparent 0%, black 40%), linear-gradient(to top, transparent 0%, black 20%)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%), linear-gradient(to top, transparent 0%, black 20%)',
                                maskComposite: 'intersect',
                                WebkitMaskComposite: 'source-in'
                            }}
                        />
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
        { icon: Clock, title: "Zaman Sıkıntısı", desc: "Part-time iş, staj veya okula olan uzaklığından dolayı bazı derslere yetişemiyor musun?" },
        { icon: Target, title: "Hedef Sorunu", desc: "İlgili dersten pek verim alamayıp, zorunlu olduğu için mi derse gelmek zorunda kalıyorsun?" },
        { icon: BookOpen, title: "Not Eksikliği", desc: "Vize ve final haftaları gelince grupta not mu bekliyorsun?" },
        { icon: Shield, title: "Takip Zorluğu", desc: "Sınav takvimlerini unutup, bir anda haftaya sınavların olduğunu mu öğreniyorsun?" },
        { icon: Calendar, title: "ESP Trust", desc: "ESP ünitelerinin son tarihlerini unutup yapmıyor musun?" },
        { icon: MessageCircle, title: "Slaytların Dışında", desc: "Hoca slaytların dışında ne demişti diye hatırlamıyor musun?" },
    ];

    return (
        <div className="bg-[#0B0B0F] py-24 sm:py-32 relative overflow-hidden">
            {/* Background Gradient Spot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/20 blur-[100px] rounded-full -z-10" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-purple-400">Neden KafaRahat?</h2>
                    <p className="mt-2 text-3xl font-bold font-heading tracking-tight text-white sm:text-4xl">
                        Bu Durumlar Tanıdık Geliyor mu?
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-400">
                        Üniversite hayatının koşturmacasında bazı şeyler gözden kaçabilir. KafaRahat, tam da bu sorunlara çözüm olarak tasarlandı.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
                        {problems.map((problem) => (
                            <div key={problem.title} className="relative pl-16 p-6 rounded-[24px] bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm group">
                                <dt className="text-base font-semibold leading-7 text-white">
                                    <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 group-hover:bg-purple-600 transition-colors duration-300">
                                        <problem.icon className="h-6 w-6 text-purple-400 group-hover:text-white transition-colors duration-300" aria-hidden="true" />
                                    </div>
                                    <span className="ml-4">{problem.title}</span>
                                </dt>
                                <dd className="mt-2 ml-4 text-base leading-7 text-gray-400">{problem.desc}</dd>
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
            desc: "Derste fiziki olarak bulunan arkadaşlarınız tarafından tutulan notlardır. Bilinçli olarak hocamızın sözlü olarak dediği 'burası çıkar' dediği yerler özellikle işaretlenip, haftalık ders notları şeklinde ilgili ders bölümüne yüklenir. AI'dan anahtar kelimeler çıkarılıp veya slaytların özetlerini AI'a çıkartıp not diye yükleme yapılmaz; arkadaşımızın fiziki olarak derste çıkardığı notlar olacaktır.",
            icon: "/feature-weekly-notes.png"
        },
        {
            title: "Podcast Özetleri",
            desc: "Derste fiziki olarak bulunan arkadaşımızın notları sesli hale getirilip, yolda, sporda, yürüyüşte kısa bir vakitte bu hafta ne işlendiğinden haberdar olabileceksiniz.",
            icon: "/feature-podcast.png"
        },
        {
            title: "ESP Trust Takibi",
            desc: "Platform içerisinde yer alan ESP Trust bölümünden ilgili alana e-posta adresiniz ve şifrenizi iletmeniz durumunda, ünite süreleri dolmadan gerekli yönlendirme ve teknik destek tarafımızca sağlanacaktır.",
            icon: "/feature-esp-trust.png"
        },
        {
            title: "Sınav Takvimi & Hatırlatıcılar",
            desc: "Vize ve final tarihlerini kaçırmayın diye platformun içinde bulunan geri sayım sayacının içinde görebilecek, yaklaştığı zaman bilgilendirmesi yapılacaktır.",
            icon: "/feature-exam-calendar.png"
        },
        {
            title: "Yoklama Takibi",
            desc: "Ders programına bağlı olarak yoklama sürecine ilişkin gerekli bilgilendirme ve destek sağlanacaktır. Ayrıca yoklama durumunuzu sistem üzerinden düzenli olarak takip edebilirsiniz.",
            icon: "/feature-attendance.png"
        },
        {
            title: "Admine Sor",
            desc: "Kafanıza takılan bir şey mi var? Teknik destek veya özellik talepleri için 'Admine Sor' butonuyla sorularınızı sorup cevapları size ulaştırılacaktır.",
            icon: "/feature-ask-admin.png"
        }
    ];

    return (
        <div className="bg-[#0B0B0F] py-24 sm:py-32 overflow-hidden relative" id="features">
            {/* Ambient Glow */}
            <div className="absolute left-0 top-1/3 w-[500px] h-[500px] bg-purple-900/15 blur-[120px] rounded-full -z-10" />
            <div className="absolute right-0 bottom-1/3 w-[400px] h-[400px] bg-purple-900/10 blur-[100px] rounded-full -z-10" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-20">
                    <h2 className="text-base font-semibold leading-7 text-purple-400">Özellikler</h2>
                    <p className="mt-2 text-3xl font-bold font-heading tracking-tight text-white sm:text-4xl">
                        Neler Sunuyoruz?
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-400">
                        Her özellik, gerçek öğrenci ihtiyaçlarından doğdu.
                    </p>
                </div>

                <div className="flex flex-col gap-y-24 md:gap-y-32">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={`flex flex-col md:flex-row gap-8 md:gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                        >
                            {/* Image Side */}
                            <div className="w-full md:w-1/2 flex justify-center">
                                <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-transparent p-1 ring-1 ring-white/10 shadow-[0_0_50px_-12px_rgba(124,58,237,0.25)] hover:shadow-[0_0_50px_-12px_rgba(124,58,237,0.5)] transition-all duration-500 group">
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10" />
                                    <img
                                        src={feature.icon}
                                        alt={feature.title}
                                        className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left">
                                <span className="text-sm font-mono text-purple-500/60 mb-3">0{index + 1}</span>
                                <h3 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-white mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-base sm:text-lg leading-7 sm:leading-8 text-gray-400">
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- HOW IT WORKS SECTION ---
export function HowItWorksSection() {
    return (
        <div className="bg-[#0B0B0F] py-24 sm:py-32" id="how-it-works">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-3xl font-bold font-heading tracking-tight text-white sm:text-4xl">3 Adımda Başla</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-400">
                        Karmaşık süreçler yok. Sadece 3 adımda dönemi kurtar.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Step 1 */}
                    <div className="relative flex flex-col items-center p-8 bg-white/5 rounded-[24px] border border-white/10 text-center hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-900/30 text-purple-400 text-2xl font-bold mb-6 border border-purple-500/20">
                            1
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Kayıt Ol</h3>
                        <p className="text-gray-400">
                            İsminiz ve mail adresinizle hızlıca kayıt olun.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex flex-col items-center p-8 bg-white/5 rounded-[24px] border border-white/10 text-center hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-900/30 text-purple-400 text-2xl font-bold mb-6 border border-purple-500/20">
                            2
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Paketini Şeç</h3>
                        <p className="text-gray-400">
                            Tek dönemlik olan 2026 bahar dönemini paketi seçin
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex flex-col items-center p-8 bg-white/5 rounded-[24px] border border-purple-500/30 text-center shadow-[0_0_30px_-15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] transition-all duration-300 backdrop-blur-sm">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#7B2CFF] to-[#9333EA] text-white text-2xl font-bold mb-6 shadow-lg shadow-purple-900/50">
                            3
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">Ödeme</h3>
                        <p className="text-gray-400">
                            Gerekli ibana ödemeyi yaptıktan sonra ödeme kontrol edilecek sonra kayıt olunan maille giriş yapınca arayüze yönlendirileceksiniz
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
        <div className="bg-[#0B0B0F] py-24 sm:py-32 relative overflow-hidden" id="pricing">
            {/* Ambient Glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full -z-10" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Text & Features */}
                    <div>
                        <h2 className="text-5xl sm:text-7xl font-bold font-heading tracking-tight text-white leading-[1.1]">
                            <span className="block">Basit.</span>
                            <span className="block">Net.</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Şeffaf.</span>
                        </h2>
                        <p className="mt-8 text-lg leading-8 text-gray-400 max-w-md opacity-80">
                            Bütün dönem tek bir paket. İhtiyacınız olan her şey tek bir ödemeyle sizin.
                        </p>

                        <div className="mt-12">
                            <h4 className="flex-none text-sm font-semibold leading-6 text-purple-400 mb-6">Neler Dahil?</h4>
                            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm leading-6 text-gray-300">
                                {['Haftalık ders notları', 'Ders notlarının sesli dinletisi', 'ESP Trust takibi', 'Yoklama yönetimi', 'Sınav hatırlatıcıları', 'Admin desteği'].map((feature) => (
                                    <li key={feature} className="flex gap-x-3 items-center">
                                        <div className="bg-purple-500/10 rounded-full p-1">
                                            <CheckCircle2 className="h-4 w-4 text-purple-400" aria-hidden="true" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Premium Pricing Card */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-[26px] blur opacity-20 transition duration-500 group-hover:opacity-40"></div>
                        <div className="relative p-8 sm:p-10 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-xl hover:-translate-y-1 transition duration-500 shadow-2xl shadow-purple-900/20">

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold font-heading text-white">2026 Bahar Dönemi Paketi</h3>
                                    <span className="mt-2 inline-flex items-center rounded-full bg-purple-500/20 px-4 py-1.5 text-sm font-bold text-purple-300 ring-2 ring-inset ring-purple-500/40 animate-pulse">
                                        🔥 Sınırlı Kontenjan
                                    </span>
                                </div>

                            </div>

                            <p className="mt-6 text-gray-400 text-sm leading-relaxed">
                                Bu paket ile tüm dönem boyunca ihtiyacınız olan her şeye erişim sağlarsınız. Bahar dönemi kafarahat olsun.
                            </p>

                            <div className="mt-8 flex items-baseline gap-x-2">
                                <span className="text-6xl font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">2.999</span>
                                <span className="text-2xl font-bold text-gray-400">TL</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Dönemlik Tek Ödeme</p>

                            <Link href="/kayit">
                                <Button className="mt-8 w-full bg-gradient-to-r from-[#7B2CFF] to-[#9333EA] hover:brightness-110 text-white font-bold py-7 text-lg rounded-xl shadow-[0_0_20px_-5px_rgba(123,44,255,0.5)] hover:shadow-[0_0_30px_-5px_rgba(123,44,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                                    Hemen Satın Al
                                </Button>
                            </Link>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- GUARANTEE SECTION ---
export function GuaranteeSection() {
    return (
        <div className="bg-[#0B0B0F] py-24 sm:py-32 relative overflow-hidden" id="guvence">
            {/* Ambient Glow */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full -z-10" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold font-heading tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Güvenceniz</h2>
                </div>

                {/* Content: Photo Left, Text Right */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start">
                    {/* Left: Profile Photo */}
                    <div className="flex-shrink-0">
                        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-[24px] overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_-12px_rgba(124,58,237,0.3)] group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent -z-10" />
                            <img
                                src="/profil.png"
                                alt="Muhammed Medet Sönmez"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Right: Message */}
                    <div className="flex-1 relative p-8 sm:p-10 rounded-[24px] bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 to-transparent rounded-[26px] blur opacity-30 -z-10" />
                        <div className="text-gray-300 text-[15px] leading-7 space-y-4">
                            <p className="text-white font-semibold text-lg">Selamünaleyküm,</p>
                            <p>
                                Ben <span className="text-purple-400 font-medium">Muhammed Medet Sönmez</span>, YBS 2. sınıf öğrencisiyim. Öncelikle kimsenin böyle bir kolaylığı sunmadığından dolayı bunu kendim yapmak istedim. Her ne kadar dışarıdan bakıldığında etik açıdan sorgulanabilir görünebilse de, burada sesimi çıkarmak zorunda hissettim.
                            </p>
                            <p>
                                Okulumuzda sabah saat 08.00&apos;e konulan derslere yetişmekte zorlanmam, derslere mesleki anlamda umutla gelmeme rağmen anlatım tarzının hâlâ eski yöntemlerle sürdürülmesi ve bu zaman dilimini daha verimli değerlendirebileceğimi düşünmem beni böyle bir adım atmaya yöneltti. Rakiplerimiz bizden daha donanımlı şekilde ilerlerken, elimizdeki en değerli sermaye olan zamanı verimsiz şekilde harcamak istemiyorum.
                            </p>
                            <p>
                                Bu nedenle ekibimle birlikte, bahar dönemi boyunca sizlere zaman kazandıracak, eğitim sürecimizi daha otonom hâle getirecek bir sistem kurduk. Ödeme yöntemi olarak IBAN kullanılacaktır çünkü bu platformu sürdürülebilir iş modeline çevirme gibi bir niyetimiz yok; amacımız yalnızca bu dönem dersleri daha verimli ve daha az yorucu hâle getirerek kendi ilgi alanlarımıza daha fazla yönelmek.
                            </p>
                            <p>
                                İlk haftadan sonra iade talebiniz olursa ya da ödeme konusunda herhangi bir sıkıntı yaşarsanız, benimle doğrudan iletişime geçebilirsiniz. WhatsApp&apos;tan direkt bana ulaşabilirsiniz. Ayrıca okula geldiğiniz bir gün (ben de oradaysam 😊) yüz yüze de görüşebiliriz. Bu konuda içiniz rahat olsun.
                            </p>
                            <p>
                                İnşallah bir &quot;tosuncuk&quot; 😅 olayı yaşanmayacak; yerim sınıfın içi ve ben de sizden biriyim.
                            </p>
                            <p className="text-white font-medium pt-2">
                                Sevgilerim ve saygılarımla,<br />
                                <span className="text-purple-400">Namıdeğer Elazığlı</span>
                            </p>
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
            question: "Mobil uygulamanız var mı?",
            answer: "Şu an için responsive (mobil uyumlu) web sitemiz üzerinden hizmet veriyoruz. Telefondan rahatlıkla kullanabilirsiniz."
        },
        {
            question: "İade imkanı var mı?",
            answer: "Ödeme sonrası ilk hafta içinde memnun kalmazsanız koşulsuz iade hakkınız vardır. İade için WhatsApp'tan irtibata geçebilirsiniz."
        },
        {
            question: "Bu yaptığınız yasal mı?",
            answer: "Her dönemin bir Galileosu olur."
        },
        {
            question: "Siz kimsiniz?",
            answer: "Biz sizinle aynı sınıfta bulunan öğrencileriz."
        },
        {
            question: "Sizinle nasıl iletişime geçebilirim?",
            answer: "Okul içerisinde yüz yüze görüşme sağlayabilir ya da WhatsApp üzerinden bizimle iletişime geçebilirsiniz."
        }
    ];

    return (
        <div className="bg-[#0F0F0F] py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl divide-y divide-white/10">
                    <h2 className="text-2xl font-bold font-heading leading-10 tracking-tight text-white text-center mb-10">Sıkça Sorulan Sorular</h2>
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
        <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8 overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px]" />
            </div>

            <div className="mx-auto max-w-4xl">
                {/* Main CTA Card */}
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 rounded-[28px] blur opacity-25" />
                    <div className="relative p-10 sm:p-16 rounded-[24px] bg-[#0F0F13] border border-white/10 text-center">

                        <h2 className="text-4xl sm:text-5xl font-bold font-heading tracking-tight text-white leading-tight">
                            Kafan <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Rahat</span> Etsin.
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
                            2026 Bahar Döneminde derslerinizi otonomlaştırıp zamana kazanın. Elimizden geldiğince size yardımcı olunacak, yapıcı geri bildirimlerinizi de bekleriz. Şimdi aramıza katılın!
                        </p>



                        {/* Price + Button */}
                        <div className="mt-10 flex flex-col items-center gap-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">2.999</span>
                                <span className="text-xl font-bold text-gray-400">TL</span>
                                <span className="text-sm text-gray-500 ml-2">/ dönem</span>
                            </div>
                            <Link href="/kayit">
                                <Button size="lg" className="bg-gradient-to-r from-[#7B2CFF] to-[#9333EA] hover:brightness-110 text-white font-bold px-12 py-7 text-lg rounded-xl shadow-[0_0_30px_-5px_rgba(123,44,255,0.5)] hover:shadow-[0_0_40px_-5px_rgba(123,44,255,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                                    Hemen Başla 🚀
                                </Button>
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> İlk hafta iade garantisi
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Anında erişim
                            </span>
                            <span className="flex items-center gap-1.5">
                                🎓 YBS 2. Sınıf · 2026 Bahar
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
