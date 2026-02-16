'use client';

import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QuestionsTableProps {
    tickets: any[];
}

export function QuestionsTable({ tickets: initialTickets }: QuestionsTableProps) {
    const [tickets, setTickets] = useState(initialTickets);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const supabase = createClient();

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const { error } = await supabase
            .from('support_tickets')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Soru silinirken bir hata oluştu.');
            console.error('Delete error:', error);
        } else {
            setTickets(prev => prev.filter(t => t.id !== id));
            toast.success('Soru başarıyla silindi.');
        }
        setDeletingId(null);
    };

    const columns = [
        {
            header: 'Öğrenci',
            cell: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-medium">{item.profiles?.full_name}</span>
                    <span className="text-xs text-muted-foreground">{item.profiles?.email}</span>
                </div>
            ),
        },
        {
            header: 'Konu',
            accessorKey: 'subject',
            cell: (item: any) => (
                <span className="font-medium truncate max-w-[150px] block" title={item.subject}>{item.subject}</span>
            )
        },
        {
            header: 'Mesaj',
            accessorKey: 'message',
            cell: (item: any) => (
                <Dialog>
                    <DialogTrigger className="text-left w-full hover:underline focus:outline-none">
                        <span className="text-muted-foreground truncate max-w-[250px] block" title="Tümü için tıklayın">
                            {item.message}
                        </span>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{item.subject}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Gönderen:</span>
                                <div className="text-sm">
                                    {item.profiles?.full_name} ({item.profiles?.email})
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Kategori:</span>
                                <div className="text-sm capitalize">{item.category}</div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                                {item.message}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )
        },
        {
            header: 'Kategori',
            accessorKey: 'category',
        },
        {
            header: 'Durum',
            accessorKey: 'status',
            cell: (item: any) => {
                const variants: any = {
                    open: 'default',
                    in_progress: 'secondary',
                    resolved: 'outline',
                    closed: 'destructive'
                };
                const labels: any = {
                    open: 'Açık',
                    in_progress: 'İşleniyor',
                    resolved: 'Çözüldü',
                    closed: 'Kapatıldı'
                };
                return <Badge variant={variants[item.status] || 'default'}>{labels[item.status] || item.status}</Badge>;
            },
        },
        {
            header: 'Tarih',
            accessorKey: 'created_at',
            cell: (item: any) => format(new Date(item.created_at), 'd MMM HH:mm', { locale: tr }),
        },
        {
            header: 'İşlemler',
            cell: (item: any) => (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/sorular/${item.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Yanıtla
                        </Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                disabled={deletingId === item.id}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Soruyu Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                    &quot;{item.subject}&quot; konulu soruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Sil
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={tickets}
            searchKey="subject"
        />
    );
}
