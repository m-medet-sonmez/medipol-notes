import { Metadata } from 'next';
import {
  HeroSection,
  ProblemSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  GuaranteeSection,
  FAQSection,
  CTASection
} from '@/components/landing/LandingSections';
import { Navbar } from '@/components/landing/Navbar';
import { Logo } from '@/components/ui/logo';

export const metadata: Metadata = {
  title: 'KafaRahat | Üniversite Hayatı Artık Daha Kolay',
  description: 'YBS 2. Sınıf öğrencileri için haftalık notlar, sınav takibi ve ESP Trust yönetimi. Akademik başarını arttır, kafan rahat olsun.',
  keywords: ['YBS', 'Yönetim Bilişim Sistemleri', 'Ders Notları', 'Sınav Takibi', 'ESP Trust', 'KafaRahat', 'Üniversite'],
  openGraph: {
    title: 'KafaRahat | Üniversite Ders Notları ve Takip Sistemi',
    description: 'YBS 2. Sınıf öğrencileri için özel olarak hazırlanan haftalık notlar ve sınav takibi platformu.',
    url: 'https://kafarahat.com', // Placeholder URL
    siteName: 'KafaRahat',
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-foreground selection:bg-purple-500/30">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <GuaranteeSection />
      <FAQSection />
      <CTASection />

      {/* Simple Footer */}
      <footer className="bg-black py-12 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center">
          <Logo className="mb-4 scale-75 transform-origin-center" />
          <p className="text-xs text-gray-500">
            &copy; 2026 KafaRahat. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </main>
  );
}
