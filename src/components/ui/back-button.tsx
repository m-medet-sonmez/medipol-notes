'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    href?: string;
    label?: string;
}

export function BackButton({ href, label = 'Geri Dön' }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <Button
            variant="ghost"
            onClick={handleClick}
            className="gap-2 text-muted-foreground hover:text-white hover:bg-neutral-800 mb-4 px-5 py-3 text-base rounded-lg h-auto"
        >
            <ArrowLeft className="w-5 h-5" />
            {label}
        </Button>
    );
}
