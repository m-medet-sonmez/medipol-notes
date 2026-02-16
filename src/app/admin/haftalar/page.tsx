import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Pencil, Trash } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BackButton } from '@/components/ui/back-button';

export default async function WeeksPage() {
    const supabase = await createClient();

    // Fetch weeks and order by year, then month, then start_date desc
    const { data: weeks } = await supabase
        .from('weeks')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .order('start_date', { ascending: false });

    const columns = [
        {
            header: 'No',
            accessorKey: 'week_number',
            cell: (item: any) => <span className="font-medium">#{item.week_number}</span>,
        },
        {
            header: 'Hafta Adı',
            accessorKey: 'week_name',
        },
        {
            header: 'Tarih Aralığı',
            cell: (item: any) => (
                <span className="text-sm">
                    {format(new Date(item.start_date), 'd MMM', { locale: tr })} -{' '}
                    {format(new Date(item.end_date), 'd MMM yyyy', { locale: tr })}
                </span>
            ),
        },
        {
            header: 'Dönem',
            cell: (item: any) => (
                <span>
                    {new Date(0, item.month - 1).toLocaleString('tr-TR', { month: 'long' })} {item.year}
                </span>
            ),
        },
        {
            header: 'Durum',
            accessorKey: 'is_active',
            cell: (item: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.is_active ? 'Aktif' : 'Pasif'}
                </span>
            ),
        },
        {
            header: 'İşlemler',
            cell: (item: any) => (
                <div className="flex items-center gap-2">
                    {/* Düzenleme butonu eklenebilir */}
                    <Button variant="ghost" size="icon" disabled>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <BackButton href="/admin" label="Admin Paneli" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hafta Yönetimi</h1>
                    <p className="text-muted-foreground">
                        Ders haftalarını tanımlayın ve yönetin.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/haftalar/yeni">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Hafta Ekle
                    </Link>
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={weeks || []}
                searchKey="week_name"
            />
        </div>
    );
}
