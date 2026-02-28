import { AttendanceForm } from '@/components/admin/AttendanceForm';
import { BackButton } from '@/components/ui/back-button';

export default function AttendancePage() {
    return (
        <div className="space-y-6">
            <BackButton href="/admin" label="Admin Paneli" />
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Yoklama Girişi</h1>
                <p className="text-muted-foreground">
                    Öğrencilerin haftalık ders katılımlarını kaydedin.
                </p>
            </div>

            <div className="max-w-4xl">
                <AttendanceForm />
            </div>
        </div>
    );
}
