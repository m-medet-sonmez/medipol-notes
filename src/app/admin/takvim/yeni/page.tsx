import { ExamForm } from '@/components/admin/ExamForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewExamPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/takvim">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Yeni Sınav Ekle</h1>
                    <p className="text-muted-foreground">
                        Sınav veya önemli tarih ekleyin.
                    </p>
                </div>
            </div>

            <div className="border rounded-lg p-6 bg-card">
                <ExamForm />
            </div>
        </div>
    );
}
