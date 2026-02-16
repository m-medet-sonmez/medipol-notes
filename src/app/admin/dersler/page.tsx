import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CourseActions } from '@/components/admin/CourseActions';
import { BackButton } from '@/components/ui/back-button';

export default async function CoursesPage() {
    const supabase = await createClient();

    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

    const columns = [
        {
            header: 'Kod',
            accessorKey: 'course_code',
            cell: (item: any) => <span className="font-medium bg-neutral-800 px-2 py-1 rounded text-xs">{item.course_code}</span>,
        },
        {
            header: 'Ders Adı',
            accessorKey: 'course_name',
        },
        {
            header: 'Eğitmen',
            accessorKey: 'instructor_name',
        },
        {
            header: 'Oluşturulma',
            accessorKey: 'created_at',
            cell: (item: any) => format(new Date(item.created_at), 'd MMM yyyy', { locale: tr }),
        },
        {
            header: 'İşlemler',
            cell: (item: any) => <CourseActions courseId={item.id} />,
        },
    ];

    return (
        <div className="space-y-6">
            <BackButton href="/admin" label="Admin Paneli" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ders Yönetimi</h1>
                    <p className="text-muted-foreground mt-1">
                        Platformdaki dersleri ekleyin, düzenleyin veya silin.
                    </p>
                </div>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Link href="/admin/dersler/yeni">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Ders Ekle
                    </Link>
                </Button>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1">
                <DataTable
                    columns={columns}
                    data={courses || []}
                    searchKey="course_name"
                />
            </div>
        </div>
    );
}
