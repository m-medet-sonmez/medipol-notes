import { AttendanceList } from '@/components/attendance/AttendanceList';
import { FadeIn } from '@/components/ui/fade-in';
import { BackButton } from '@/components/ui/back-button';

export default function AttendancePage() {
    return (
        <div className="space-y-8">
            <BackButton href="/dashboard" label="Ana Sayfa" />
            <FadeIn>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Yoklama Takibi</h1>
                    <p className="text-muted-foreground">
                        Derslere katılım durumunuzu buradan inceleyebilirsiniz.
                    </p>
                </div>
            </FadeIn>

            <AttendanceList />
        </div>
    );
}
