import { WeekForm } from '@/components/admin/WeekForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewWeekPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/haftalar">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Yeni Hafta Ekle</h1>
                    <p className="text-muted-foreground">
                        Eğitim dönemi için yeni bir hafta tanımlayın.
                    </p>
                </div>
            </div>

            <div className="border rounded-lg p-6 bg-card">
                <WeekForm />
            </div>
        </div>
    );
}
