'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { File, Music, Trash2, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type Material = {
    id: string;
    title: string;
    description: string;
    pdf_file_path: string | null;
    audio_file_path: string | null;
    created_at: string;
    course: {
        course_name: string;
    } | null;
};

export function UploadedMaterialsList() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('materials')
                .select(`
                    id,
                    title,
                    description,
                    pdf_file_path,
                    audio_file_path,
                    created_at,
                    course:courses(course_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Format data since course could be an array or object depending on relation
            const formattedData = (data as any[]).map(item => ({
                ...item,
                course: Array.isArray(item.course) ? item.course[0] : item.course
            }));

            setMaterials(formattedData || []);
        } catch (error: any) {
            console.error('Error fetching materials:', error);
            toast.error('İçerikler yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();

        const handleMaterialUploaded = () => {
            fetchMaterials();
        };

        window.addEventListener('material-uploaded', handleMaterialUploaded);

        return () => {
            window.removeEventListener('material-uploaded', handleMaterialUploaded);
        };
    }, []);

    const handleDelete = async (material: Material) => {
        if (!confirm(`"${material.title}" başlıklı içeriği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
            return;
        }

        setDeletingId(material.id);
        try {
            // Delete files from storage if they exist
            if (material.pdf_file_path) {
                const { error: pdfError } = await supabase.storage
                    .from('materials')
                    .remove([material.pdf_file_path]);
                if (pdfError) console.error("PDF silinemedi:", pdfError);
            }

            if (material.audio_file_path) {
                const { error: audioError } = await supabase.storage
                    .from('materials')
                    .remove([material.audio_file_path]);
                if (audioError) console.error("Ses dosyası silinemedi:", audioError);
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from('materials')
                .delete()
                .eq('id', material.id);

            if (dbError) throw dbError;

            toast.success('İçerik başarıyla silindi.');

            // Update local state to remove the item instantly
            setMaterials(prev => prev.filter(m => m.id !== material.id));
        } catch (error: any) {
            console.error('Error deleting material:', error);
            toast.error('Silme işlemi başarısız oldu.');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (materials.length === 0) {
        return (
            <div className="text-center py-12 bg-card border rounded-xl shadow-sm text-muted-foreground">
                <p>Henüz yüklenmiş bir içerik bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
                <div key={material.id} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all">
                    <div className="p-5 flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-md">
                                    {material.course?.course_name || 'Bilinmeyen Ders'}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-600 -mt-2 -mr-2"
                                onClick={() => handleDelete(material)}
                                disabled={deletingId === material.id}
                            >
                                {deletingId === material.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        <h3 className="font-bold text-lg leading-tight line-clamp-2">
                            {material.title}
                        </h3>

                        {material.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {material.description}
                            </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pt-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(material.created_at), 'd MMMM yyyy', { locale: tr })}
                        </div>
                    </div>

                    <div className="bg-muted/30 border-t p-3 flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${material.pdf_file_path ? 'bg-red-500/10 text-red-600' : 'text-neutral-400'}`}>
                            <File className="w-3.5 h-3.5" />
                            PDF {material.pdf_file_path ? 'Var' : 'Yok'}
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${material.audio_file_path ? 'bg-purple-500/10 text-purple-600' : 'text-neutral-400'}`}>
                            <Music className="w-3.5 h-3.5" />
                            Ses {material.audio_file_path ? 'Var' : 'Yok'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
