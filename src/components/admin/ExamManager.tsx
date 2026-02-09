'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, MapPin, Trash2, Globe, Plus, GraduationCap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
// import actions
import { upsertExamSchedule, deleteExamSchedule } from '@/app/admin/exams/actions';

interface ExamSchedule {
    id: string;
    course_name: string;
    exam_title: string;
    exam_date: string;
    location: string | null;
    is_published: boolean;
    exam_type: 'vize' | 'final' | 'butunleme';
}

interface ExamManagerProps {
    existingExams: ExamSchedule[];
}

export function ExamManager({ existingExams }: ExamManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);

    // Form Stats
    const [courseName, setCourseName] = useState('');
    const [examType, setExamType] = useState<'vize' | 'final' | 'butunleme'>('final');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState('10:00');
    const [location, setLocation] = useState('');
    const [isPublished, setIsPublished] = useState(true);

    const handleOpen = (exam?: ExamSchedule) => {
        if (exam) {
            setEditingExam(exam);
            setCourseName(exam.course_name);
            setExamType(exam.exam_type || 'final');
            const examDate = new Date(exam.exam_date);
            setDate(examDate);
            setTime(format(examDate, 'HH:mm'));
            setLocation(exam.location || '');
            setIsPublished(exam.is_published);
        } else {
            setEditingExam(null);
            setCourseName('');
            setExamType('final');
            setDate(undefined);
            setTime('10:00');
            setLocation('');
            setIsPublished(true);
        }
        setIsOpen(true);
    };

    const handleSave = async () => {
        if (!courseName || !date) {
            toast.error('Ders adı ve tarih zorunludur.');
            return;
        }

        setLoading(true);
        try {
            // Combine Date and Time
            const [hours, minutes] = time.split(':').map(Number);
            const examDateTime = new Date(date);
            examDateTime.setHours(hours);
            examDateTime.setMinutes(minutes);

            const result = await upsertExamSchedule({
                id: editingExam?.id, // include ID if editing
                course_name: courseName,
                exam_type: examType,
                exam_title: examType === 'vize' ? 'Vize Sınavı' : examType === 'final' ? 'Final Sınavı' : 'Bütünleme Sınavı',
                exam_date: examDateTime.toISOString(),
                location: location,
                is_published: isPublished,
            });

            if (result.error) throw new Error(result.error);

            toast.success(editingExam ? 'Sınav güncellendi.' : 'Sınav eklendi.');
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening modal
        if (!confirm('Bu sınavı silmek istediğinize emin misiniz?')) return;

        setLoading(true);
        try {
            const result = await deleteExamSchedule(id);
            if (result.error) throw new Error(result.error);
            toast.success('Sınav silindi.');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Group exams
    const vizeExams = existingExams.filter(e => e.exam_type === 'vize');
    const finalExams = existingExams.filter(e => e.exam_type === 'final');
    const butunlemeExams = existingExams.filter(e => e.exam_type === 'butunleme');

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Button onClick={() => handleOpen()} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Sınav Ekle
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Vize Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Vize Sınavları
                        </h2>
                        <span className="bg-neutral-900 border border-neutral-800 rounded px-2 text-xs text-neutral-500">
                            {vizeExams.length} Sınav
                        </span>
                    </div>

                    <div className="space-y-3">
                        {vizeExams.length === 0 && (
                            <p className="text-neutral-500 text-sm italic">Henüz vize sınavı girilmedi.</p>
                        )}
                        {vizeExams.map(exam => (
                            <ExamCard
                                key={exam.id}
                                exam={exam}
                                onEdit={() => handleOpen(exam)}
                                onDelete={(e) => handleDelete(exam.id, e)}
                            />
                        ))}
                    </div>
                </div>

                {/* Final Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <h2 className="text-xl font-bold text-green-500 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Final Sınavları
                        </h2>
                        <span className="bg-neutral-900 border border-neutral-800 rounded px-2 text-xs text-neutral-500">
                            {finalExams.length} Sınav
                        </span>
                    </div>

                    <div className="space-y-3">
                        {finalExams.length === 0 && (
                            <p className="text-neutral-500 text-sm italic">Henüz final sınavı girilmedi.</p>
                        )}
                        {finalExams.map(exam => (
                            <ExamCard
                                key={exam.id}
                                exam={exam}
                                onEdit={() => handleOpen(exam)}
                                onDelete={(e) => handleDelete(exam.id, e)}
                            />
                        ))}
                    </div>
                </div>

                {/* Bütünleme Column */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Bütünleme Sınavları
                        </h2>
                        <span className="bg-neutral-900 border border-neutral-800 rounded px-2 text-xs text-neutral-500">
                            {butunlemeExams.length} Sınav
                        </span>
                    </div>

                    <div className="space-y-3">
                        {butunlemeExams.length === 0 && (
                            <p className="text-neutral-500 text-sm italic">Henüz bütünleme sınavı girilmedi.</p>
                        )}
                        {butunlemeExams.map(exam => (
                            <ExamCard
                                key={exam.id}
                                exam={exam}
                                onEdit={() => handleOpen(exam)}
                                onDelete={(e) => handleDelete(exam.id, e)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px] bg-neutral-950 border-neutral-800 text-neutral-200">
                    <DialogHeader>
                        <DialogTitle>{editingExam ? 'Sınavı Düzenle' : 'Yeni Sınav Ekle'}</DialogTitle>
                        <DialogDescription>
                            Sınav bilgilerini giriniz.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label>Ders Adı</Label>
                            <Input
                                placeholder="Örn: Algoritma ve Veri Yapıları"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                className="bg-neutral-950 border-neutral-800"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Sınav Türü</Label>
                            <Select
                                value={examType}
                                onValueChange={(val: 'vize' | 'final' | 'butunleme') => setExamType(val)}
                            >
                                <SelectTrigger className="bg-neutral-950 border-neutral-800">
                                    <SelectValue placeholder="Sınav Türü Seçiniz" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                    <SelectItem value="vize">Vize Sınavı</SelectItem>
                                    <SelectItem value="final">Final Sınavı</SelectItem>
                                    <SelectItem value="butunleme">Bütünleme Finali</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Sınav Tarihi</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-neutral-950 border-neutral-800",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "d MMMM yyyy", { locale: tr }) : <span>Tarih seçiniz</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-neutral-950 border-neutral-800">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Sınav Saati</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="pl-9 bg-neutral-950 border-neutral-800"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Konum / Derslik (İsteğe Bağlı)</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Örn: B101, Online..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="pl-9 bg-neutral-950 border-neutral-800"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-neutral-800 p-3 bg-neutral-900/50">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Yayınla
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Aktif edilirse öğrenciler sınavı görebilir.
                                </p>
                            </div>
                            <Switch
                                checked={isPublished}
                                onCheckedChange={setIsPublished}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleSave} disabled={loading} className="bg-white text-black hover:bg-neutral-200 w-full">
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ExamCard({ exam, onEdit, onDelete }: { exam: ExamSchedule, onEdit: () => void, onDelete: (e: any) => void }) {
    return (
        <div
            onClick={onEdit}
            className="group relative bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-all cursor-pointer overflow-hidden"
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white text-lg">{exam.course_name}</h3>
                {exam.is_published ? (
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5" title="Yayında" />
                ) : (
                    <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" title="Taslak" />
                )}
            </div>

            <div className="space-y-1.5 text-sm text-neutral-400">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-neutral-500" />
                    <span>{format(new Date(exam.exam_date), 'd MMM yyyy, EEEE', { locale: tr })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-500" />
                    <span>{format(new Date(exam.exam_date), 'HH:mm')}</span>
                </div>
                {exam.location && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neutral-500" />
                        <span>{exam.location}</span>
                    </div>
                )}
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-500"
                onClick={onDelete}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    )
}
