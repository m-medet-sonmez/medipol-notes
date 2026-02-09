'use client';

import { createClient } from '@/lib/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { FadeIn } from '@/components/ui/fade-in';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CheckCircle2, UserCheck, XCircle } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    course_name: string;
    week_id: number;
    status: string;
    created_at: string;
    week_info?: {
        week_name: string;
        start_date: string;
        end_date: string;
    };
}

export function AttendanceList() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchAttendance() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // 1. Fetch Attendance Records for this user (All statuses)
                const { data: attendanceData } = await supabase
                    .from('attendance_records')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('week_id', { ascending: false });

                if (!attendanceData) {
                    setRecords([]);
                    return;
                }

                // 2. Fetch Weeks Info
                const { data: weeksData } = await supabase
                    .from('weeks')
                    .select('week_number, week_name, start_date, end_date');

                // 3. Merge data
                const mergedRecords = attendanceData.map((record: any) => {
                    const week = weeksData?.find(w => w.week_number === record.week_id);
                    return {
                        ...record,
                        week_info: week
                    };
                });

                setRecords(mergedRecords);
            } catch (error) {
                console.error("Attendance load error:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAttendance();
    }, []);

    // Calculate course summaries
    const courseStats = records.reduce((acc, record) => {
        if (record.status === 'Katıldı') {
            acc[record.course_name] = (acc[record.course_name] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const sortedStats = Object.entries(courseStats).sort(([, a], [, b]) => b - a);

    // Calculate absent summaries
    const absentStats = records.reduce((acc, record) => {
        if (record.status === 'Katılmadı') {
            acc[record.course_name] = (acc[record.course_name] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const sortedAbsentStats = Object.entries(absentStats).sort(([, a], [, b]) => b - a);

    return (
        <FadeIn>
            <div className="grid gap-6">
                {/* Stats Section - Dynamically listing participated courses */}
                <div className="grid gap-6 mb-8">
                    {/* 1. Participated Courses (Green) */}
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            Katılım Sağlanan Dersler
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {sortedStats.length > 0 ? (
                                sortedStats.map(([courseName, count]) => (
                                    <div key={`p-${courseName}`} className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-4 rounded-xl border border-green-500/20 flex flex-col justify-between items-start transition-all hover:scale-105">
                                        <div className="p-2 bg-green-500/20 rounded-lg mb-2 text-green-500">
                                            <UserCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1">{count} <span className="text-sm font-normal text-green-400">Hafta</span></h3>
                                            <p className="text-sm text-green-400 font-medium opacity-90">{courseName}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="md:col-span-4 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-center text-neutral-500 text-sm">
                                    Henüz katılım sağlanan ders bulunmuyor.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Absent Courses (Red) */}
                    {sortedAbsentStats.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-300 mb-3 flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-500" />
                                Katılım Sağlanmayan Dersler
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {sortedAbsentStats.map(([courseName, count]) => (
                                    <div key={`a-${courseName}`} className="bg-gradient-to-br from-red-500/10 to-orange-500/5 p-4 rounded-xl border border-red-500/20 flex flex-col justify-between items-start transition-all hover:scale-105">
                                        <div className="p-2 bg-red-500/20 rounded-lg mb-2 text-red-500">
                                            <XCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1">{count} <span className="text-sm font-normal text-red-400">Hafta</span></h3>
                                            <p className="text-sm text-red-400 font-medium opacity-90">{courseName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-sm">
                    <Table>
                        <TableHeader className="bg-neutral-900 border-b border-neutral-800">
                            <TableRow className="hover:bg-neutral-900">
                                <TableHead className="text-neutral-400">Ders Adı</TableHead>
                                <TableHead className="text-neutral-400">Hafta</TableHead>
                                <TableHead className="text-neutral-400">Tarih</TableHead>
                                <TableHead className="text-right text-neutral-400">Durum</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground animate-pulse">
                                        Yoklama verileri yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                        Henüz yoklama kaydı bulunmamaktadır.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                records.map((record) => (
                                    <TableRow key={record.id} className="hover:bg-neutral-800/50 transition-colors border-neutral-800">
                                        <TableCell className="font-semibold text-white">
                                            {record.course_name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-neutral-900 border-neutral-700 text-neutral-300">
                                                {record.week_info?.week_name || `${record.week_id}. Hafta`}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-neutral-400 text-sm">
                                            {record.week_info?.start_date ? (
                                                format(new Date(record.week_info.start_date), 'd MMMM yyyy', { locale: tr })
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {record.status === 'Katıldı' ? (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold uppercase tracking-wide">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Katıldı
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold uppercase tracking-wide">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Katılmadı
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </FadeIn>
    );
}

