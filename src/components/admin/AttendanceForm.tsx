'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Save, UserCheck, XCircle, MinusCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Student {
    id: string;
    full_name: string;
    student_no?: string;
}

interface Week {
    id: number;
    week_number: number;
    week_name: string;
    start_date: string;
    end_date: string;
}

type AttendanceStatus = 'Katıldı' | 'Katılmadı' | null;

export function AttendanceForm() {
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    // Form Inputs
    const [courseName, setCourseName] = useState('');
    const [selectedWeek, setSelectedWeek] = useState<string>('');

    // Selection state: Record<studentId, status>
    const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 1. Fetch Weeks and Students on Mount
    useEffect(() => {
        async function initData() {
            setIsLoading(true);
            try {
                // Fetch Weeks
                const { data: weekData } = await supabase
                    .from('weeks')
                    .select('*')
                    .order('week_number', { ascending: true });

                if (weekData) setWeeks(weekData);

                // Fetch Students
                const { data: studentData } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .order('full_name');

                if (studentData) {
                    setStudents(studentData);
                    // Initialize state
                    const initial: Record<string, AttendanceStatus> = {};
                    studentData.forEach(s => initial[s.id] = null);
                    setAttendanceState(initial);
                }

            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Veriler yüklenirken hata oluştu.');
            } finally {
                setIsLoading(false);
            }
        }
        initData();
    }, []);

    // 2. Load existing attendance
    useEffect(() => {
        if (!courseName || !selectedWeek) return;

        async function loadExistingAttendance() {
            const { data } = await supabase
                .from('attendance_records')
                .select('user_id, status')
                .eq('course_name', courseName)
                .eq('week_id', parseInt(selectedWeek));

            if (data) {
                const newState = { ...attendanceState };
                // Reset first
                Object.keys(newState).forEach(k => newState[k] = null);
                // Fill existing
                data.forEach((record: any) => {
                    newState[record.user_id] = record.status as AttendanceStatus;
                });
                setAttendanceState(newState);
            }
        }

        const timer = setTimeout(() => {
            loadExistingAttendance();
        }, 500);

        return () => clearTimeout(timer);
    }, [courseName, selectedWeek]);

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendanceState(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = async () => {
        if (!courseName || !selectedWeek) {
            toast.error('Lütfen Ders Adı ve Hafta seçiniz.');
            return;
        }

        setIsSaving(true);
        try {
            const weekIdInt = parseInt(selectedWeek);

            // 1. Delete existing records for this course/week/student batch
            // Strategy: We will replace the entire state for this course/week.
            await supabase
                .from('attendance_records')
                .delete()
                .eq('course_name', courseName)
                .eq('week_id', weekIdInt);

            // 2. Prepare records to insert (exclude 'null' statuses)
            const recordsToInsert = Object.entries(attendanceState)
                .filter(([_, status]) => status !== null)
                .map(([userId, status]) => ({
                    user_id: userId,
                    course_name: courseName,
                    week_id: weekIdInt,
                    status: status
                }));

            if (recordsToInsert.length > 0) {
                const { error } = await supabase
                    .from('attendance_records')
                    .insert(recordsToInsert);

                if (error) throw error;
            }

            toast.success(`Kaydedildi: ${recordsToInsert.length} kayıt`);
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error('Kaydetme başarısız: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkAction = (status: AttendanceStatus) => {
        const newState = { ...attendanceState };
        Object.keys(newState).forEach(k => newState[k] = status);
        setAttendanceState(newState);
    };

    const presentCount = Object.values(attendanceState).filter(s => s === 'Katıldı').length;
    const absentCount = Object.values(attendanceState).filter(s => s === 'Katılmadı').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                <div className="space-y-2">
                    <Label htmlFor="courseName" className="text-base">Ders Adı</Label>
                    <Input
                        id="courseName"
                        placeholder="Örn: Algoritma ve Programlama"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        className="bg-neutral-950 border-neutral-700"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-base">Hafta Seçimi</Label>
                    <Select onValueChange={setSelectedWeek} value={selectedWeek}>
                        <SelectTrigger className="bg-neutral-950 border-neutral-700">
                            <SelectValue placeholder="Hafta seçiniz..." />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-700 text-neutral-200 h-64">
                            {weeks.map(w => (
                                <SelectItem key={w.week_number} value={w.week_number.toString()}>
                                    {w.week_name}
                                    <span className="text-neutral-500 ml-2 text-xs">
                                        ({format(new Date(w.start_date), 'd MMM')})
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Öğrenci Listesi ({students.length})</h3>
                        <div className="flex gap-2 ml-4 text-xs font-mono bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                            <span className="text-green-500 font-bold">Var: {presentCount}</span>
                            <span className="text-neutral-600">|</span>
                            <span className="text-red-500 font-bold">Yok: {absentCount}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Bulk Action Buttons */}
                        <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800 mr-4">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleBulkAction('Katıldı')}
                                className="h-7 text-xs hover:bg-green-500/10 hover:text-green-500"
                            >
                                Hepsi Var
                            </Button>
                            <div className="w-px bg-neutral-800 mx-1" />
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleBulkAction('Katılmadı')}
                                className="h-7 text-xs hover:bg-red-500/10 hover:text-red-500"
                            >
                                Hepsi Yok
                            </Button>
                            <div className="w-px bg-neutral-800 mx-1" />
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleBulkAction(null)}
                                className="h-7 text-xs hover:bg-neutral-800"
                            >
                                Temizle
                            </Button>
                        </div>

                        <Button onClick={handleSave} disabled={isSaving || !courseName || !selectedWeek}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Kaydet
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="max-h-[600px] overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                <TableRow>
                                    <TableHead>Ad Soyad</TableHead>
                                    <TableHead className="text-center w-[300px]">Katılım Durumu</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(student => {
                                    const status = attendanceState[student.id];
                                    return (
                                        <TableRow
                                            key={student.id}
                                            className={cn(
                                                "transition-colors",
                                                status === 'Katıldı' ? "bg-green-500/5 hover:bg-green-500/10" :
                                                    status === 'Katılmadı' ? "bg-red-500/5 hover:bg-red-500/10" :
                                                        "hover:bg-neutral-900"
                                            )}
                                        >
                                            <TableCell className="font-medium">
                                                {student.full_name}
                                            </TableCell>
                                            <TableCell className="flex justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className={cn(
                                                        "w-24 border-dashed",
                                                        status === 'Katıldı' && "bg-green-500 text-white border-solid border-green-600 hover:bg-green-600 hover:text-white"
                                                    )}
                                                    onClick={() => handleStatusChange(student.id, status === 'Katıldı' ? null : 'Katıldı')}
                                                >
                                                    <UserCheck className="w-4 h-4 mr-2" />
                                                    Var
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className={cn(
                                                        "w-24 border-dashed",
                                                        status === 'Katılmadı' && "bg-red-500 text-white border-solid border-red-600 hover:bg-red-600 hover:text-white"
                                                    )}
                                                    onClick={() => handleStatusChange(student.id, status === 'Katılmadı' ? null : 'Katılmadı')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Yok
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                            Kayıtlı öğrenci bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}

