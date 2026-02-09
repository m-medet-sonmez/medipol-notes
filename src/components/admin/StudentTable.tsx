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
import { MoreHorizontal, Shield, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface StudentTableProps {
    data: any[];
}

export function StudentTable({ data }: StudentTableProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleRoleChange = async (userId: string, newRole: 'admin' | 'student') => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            toast.success(`Kullanıcı yetkisi ${newRole} olarak güncellendi`);
            router.refresh();
        } catch (error) {
            console.error('Role update error:', error);
            toast.error('Yetki güncellenirken hata oluştu');
        }
    };

    const columns = [
        {
            header: 'Ad Soyad',
            accessorKey: 'full_name',
            cell: (item: any) => (
                <div className="flex flex-col">
                    <span className="font-medium">{item.full_name}</span>
                    <span className="text-xs text-muted-foreground">{item.email}</span>
                </div>
            ),
        },
        {
            header: 'Rol',
            accessorKey: 'role',
            cell: (item: any) => (
                <Badge variant={item.role === 'admin' ? 'destructive' : 'secondary'}>
                    {item.role === 'admin' ? 'Yönetici' : 'Öğrenci'}
                </Badge>
            ),
        },
        {
            header: 'Abonelik',
            cell: (item: any) => {
                // Find active subscription
                const activeSub = item.subscriptions?.find((sub: any) => sub.is_active);

                if (!activeSub) {
                    return <Badge variant="outline" className="text-muted-foreground">Yok</Badge>;
                }

                const planName = {
                    weekly: 'Haftalık',
                    monthly: 'Aylık',
                    semester: 'Dönemlik'
                }[activeSub.plan as string] || activeSub.plan;

                return (
                    <div className="flex flex-col gap-1">
                        <Badge variant="default" className="w-fit bg-green-600 hover:bg-green-700">
                            {planName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            Bitiş: {format(new Date(activeSub.subscription_end_date), 'd MMM yyyy', { locale: tr })}
                        </span>
                    </div>
                );
            },
        },
        {
            header: 'Kayıt Tarihi',
            accessorKey: 'created_at',
            cell: (item: any) => format(new Date(item.created_at), 'd MMM yyyy', { locale: tr }),
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
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRoleChange(item.id, 'admin')}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Yönetici Yap
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(item.id, 'student')}>
                            <Shield className="mr-2 h-4 w-4" />
                            Öğrenci Yap
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return <DataTable columns={columns} data={data} searchKey="full_name" />;
}
