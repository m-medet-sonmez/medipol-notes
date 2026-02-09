'use client';

import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ESPUnitManager } from '@/components/admin/ESPUnitManager';

interface ESPRequest {
    id: string;
    esp_email: string;
    esp_password: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
    profiles: {
        id: string;
        full_name: string;
        email: string;
        completed_esp_units: string[];
    };
}

interface ESPRequestTableProps {
    data: any[];
}

export function ESPRequestTable({ data }: ESPRequestTableProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleStatusChange = async (requestId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('esp_requests')
                .update({
                    status: newStatus,
                })
                .eq('id', requestId);

            if (error) throw error;

            toast.success('Talep durumu güncellendi');
            router.refresh();
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('Durum güncellenirken hata oluştu');
        }
    };

    const statusMap = {
        pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
        processing: { label: 'İşleniyor', color: 'bg-blue-100 text-blue-800' },
        completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
        failed: { label: 'Başarısız', color: 'bg-red-100 text-red-800' },
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
            header: 'ESP Bilgileri',
            cell: (item: any) => (
                <div className="flex flex-col text-sm space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-12">Email:</span>
                        <span className="font-mono bg-neutral-900 px-1 rounded">{item.esp_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-12">Şifre:</span>
                        <span className="font-mono bg-neutral-900 px-1 rounded text-green-400">{item.esp_password}</span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Ünite Yönetimi',
            cell: (item: any) => (
                <ESPUnitManager
                    requestId={item.id}
                    studentName={item.profiles?.full_name}
                />
            ),
        },
        {
            header: 'Durum',
            accessorKey: 'status',
            cell: (item: any) => {
                const status = statusMap[item.status as keyof typeof statusMap] || statusMap.pending;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                    </span>
                );
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Durum Güncelle</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'processing')}>
                            <Clock className="mr-2 h-4 w-4" />
                            İşleniyor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'completed')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Tamamlandı
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'failed')}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Başarısız
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return <DataTable columns={columns} data={data} />;
}
