'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { deleteCourse } from '@/app/admin/actions';
import { toast } from 'sonner';
import { useTransition } from 'react';

interface CourseActionsProps {
    courseId: string;
}

export function CourseActions({ courseId }: CourseActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Bu dersi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            startTransition(async () => {
                try {
                    await deleteCourse(courseId);
                    toast.success('Ders başarıyla silindi');
                } catch (error) {
                    toast.error('Ders silinemedi');
                }
            });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled={isPending} onClick={() => toast.info('Düzenleme özelliği yakında gelecek')}>
                <Pencil className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-red-600 hover:bg-red-500/10"
                disabled={isPending}
                onClick={handleDelete}
            >
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    );
}
