'use client';

import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { deleteExam } from '@/app/admin/actions';
import { toast } from 'sonner';
import { useTransition } from 'react';

interface ExamActionsProps {
    examId: string;
}

export function ExamActions({ examId }: ExamActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Bu sınavı takvimden silmek istediğinize emin misiniz?')) {
            startTransition(async () => {
                try {
                    await deleteExam(examId);
                    toast.success('Sınav takvimden silindi');
                } catch (error) {
                    toast.error('Sınav silinemedi');
                }
            });
        }
    };

    return (
        <div className="flex items-center gap-2">
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
