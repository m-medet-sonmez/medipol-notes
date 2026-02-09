import { MaterialList } from '@/components/materials/MaterialList';
import { FadeIn } from '@/components/ui/fade-in';

export default function MaterialsPage() {
    return (
        <div className="space-y-8">
            <FadeIn>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Ders Notları ve İçerikler</h1>
                    <p className="text-muted-foreground">
                        Erişimin olan tüm ders notlarını, haftalık özetleri ve podcastleri buradan inceleyebilirsin.
                    </p>
                </div>
            </FadeIn>

            <MaterialList />
        </div>
    );
}
