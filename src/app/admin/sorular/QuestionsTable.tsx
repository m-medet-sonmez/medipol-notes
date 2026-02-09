'use client';

import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface QuestionsTableProps {
    tickets: any[];
}

export function QuestionsTable({ tickets }: QuestionsTableProps) {
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
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/sorular/${item.id}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Yanıtla
                    </Link>
                </Button>
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
