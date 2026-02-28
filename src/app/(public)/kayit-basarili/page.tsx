import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Kayıt Başarılı | KafaRahat',
    description: 'KafaRahat platformuna başarıyla kayıt oldunuz. Lütfen e-postanızı doğrulayın.',
};

export default function RegistrationSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-24 sm:px-6 lg:px-8 bg-background">
            <FadeIn className="w-full max-w-md text-center space-y-8">
                <div className="flex justify-center">
                    <div className="h-24 w-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                        <MailCheck className="h-12 w-12 text-green-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Aramıza Hoş Geldin! 🚀
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Kayıt işlemin başarıyla tamamlandı. Ancak sistemi kullanabilmen için öncelikle
                        <span className="text-white font-medium"> e-posta adresini doğrulaman</span> gerekiyor.
                    </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-sm text-neutral-400 space-y-4">
                    <p>
                        Gelen kutunu (ve gereksiz e-postalar / spam klasörünü) kontrol et.
                        Sana gönderdiğimiz onay bağlantısına tıklayarak hesabını aktif hale getirebilirsin.
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Link href="/giris" className="w-full">
                        <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                            Onayladım, Giriş Yap
                        </Button>
                    </Link>
                </div>
            </FadeIn>
        </div>
    );
}
