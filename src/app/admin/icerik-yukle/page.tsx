import { MaterialUploadForm } from '@/components/admin/MaterialUploadForm';
import { FadeIn } from '@/components/ui/fade-in';
import { BackButton } from '@/components/ui/back-button';

export default function UploadPage() {
    return (
        <div className="space-y-8">
            <BackButton href="/admin" label="Admin Paneli" />
            <FadeIn>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">İçerik Yükle</h1>
                    <p className="text-muted-foreground">
                        Ders notları ve podcastleri buradan sisteme yükleyebilirsiniz.
                    </p>
                </div>
            </FadeIn>

            <MaterialUploadForm />
        </div>
    );
}
