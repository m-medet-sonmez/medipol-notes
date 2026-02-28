'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export type PlanType = 'weekly' | 'monthly' | 'semester';

interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    features: string[];
    planType: PlanType;
    popular?: boolean;
}

export function PricingCard({ title, price, description, features, planType, popular }: PricingCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Lütfen önce giriş yapın');
                router.push('/giris');
                return;
            }

            // SIMULATE PAYMENT SUCCESS & CREATE SUBSCRIPTION
            // In a real app, this happens via webhook after payment

            const durationDays = planType === 'weekly' ? 7 : planType === 'monthly' ? 30 : 120;
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + durationDays);

            // 1. Deactivate old subscriptions
            await supabase
                .from('subscriptions')
                .update({ is_active: false })
                .eq('user_id', user.id);

            // 2. Create new subscription
            const { error } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: user.id,
                    plan: planType,
                    start_date: new Date().toISOString(),
                    subscription_end_date: endDate.toISOString(),
                    is_active: true
                });

            if (error) {
                // Log as info to avoid blocking overlay
                console.log('Subscription error (ignored by user request):', error);
                toast.error('Abonelik oluşturulamadı ancak panele yönlendiriliyorsunuz.');
            } else {
                toast.success('Paket başarıyla tanımlandı! Panele yönlendiriliyorsunuz.');
            }

            router.push('/dashboard');
            router.refresh();

        } catch (error: any) {
            console.log('Critical error (ignored):', error);
            // Panic fallback: Go to dashboard
            router.push('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className={cn("flex flex-col relative", popular && "border-primary shadow-lg scale-105 z-10")}>
            {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    EN POPÜLER
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
                <div className="mt-2">
                    <span className="text-3xl font-bold">{price}</span>
                    <span className="text-muted-foreground"> / paket</span>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    variant={popular ? "default" : "outline"}
                    onClick={handleSubscribe}
                    disabled={isLoading}
                >
                    {isLoading ? 'İşleniyor...' : 'Seç ve Başla'}
                </Button>
            </CardFooter>
        </Card>
    );
}
