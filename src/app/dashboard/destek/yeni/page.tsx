import { TicketForm } from '@/components/support/TicketForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewTicketPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/destek">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Yeni Destek Talebi</h1>
                    <p className="text-muted-foreground">
                        Sorununuzu bize bildirin, en kısa sürede dönüş yapalım.
                    </p>
                </div>
            </div>

            <div className="border rounded-lg p-6 bg-card">
                <TicketForm />
            </div>
        </div>
    );
}
