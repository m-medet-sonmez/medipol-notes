import {
  HeroSection,
  ProblemSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  FAQSection,
  CTASection
} from '@/components/landing/LandingSections';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 transition-opacity hover:opacity-80">
            <Logo />
          </Link>
        </div>
        <div className="flex lg:flex-1 justify-end space-x-4">
          <Link href="/giris" className="text-sm font-semibold leading-6 text-white hover:text-purple-400 transition-colors">
            Giriş Yap
          </Link>
          <Link href="/kayit" className="text-sm font-semibold leading-6 text-white bg-[#7C3AED]/20 px-4 py-2 rounded-full hover:bg-[#7C3AED]/30 transition-colors ring-1 ring-[#7C3AED]/50">
            Kayıt Ol <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-foreground selection:bg-purple-500/30">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
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
