import { AttendanceForm } from '@/components/admin/AttendanceForm';

export default function AttendancePage() {
    return (
        <div className="space-y-6">
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
