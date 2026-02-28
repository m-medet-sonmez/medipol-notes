import { MaterialUploadForm } from '@/components/admin/MaterialUploadForm';
import { UploadedMaterialsList } from '@/components/admin/UploadedMaterialsList';
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

            <hr className="my-8 border-t border-border" />

            <FadeIn delay={0.2}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Yüklü İçerikler</h2>
                        <p className="text-muted-foreground">
                            Sisteme yüklediğiniz tüm materyalleri buradan görüntüleyebilir ve silebilirsiniz.
                        </p>
                    </div>
                    <UploadedMaterialsList />
                </div>
            </FadeIn>
        </div>
    );
}
