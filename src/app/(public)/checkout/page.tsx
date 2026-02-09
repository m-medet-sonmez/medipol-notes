import { PricingCard } from '@/components/checkout/PricingCard';

const plans = [
    {
        title: 'Dönemlik Paket',
        price: '2.500 ₺',
        description: 'Tüm dönem kafan rahat olsun.',
        planType: 'semester' as const,
        popular: true,
        features: [
            'Tüm dönem içeriklerine sınırsız erişim',
            'ESP Trust tam destek',
            'Tüm geçmiş ve gelecek notlar',
            'Sınırsız çevrimdışı kullanım',
            '7/24 Admin desteği',
        ],
    },
];

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Başarıya Giden Yolda Sana Uygun Paketi Seç
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Ders notları, sesli özetler ve sınav tüyoları. İhtiyacına en uygun paketi seç, derslerde öne geç.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                    {plans.map((plan) => (
                        <PricingCard key={plan.planType} {...plan} />
                    ))}
                </div>
            </div>
        </div>
    );
}
