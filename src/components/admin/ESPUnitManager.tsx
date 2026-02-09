'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ESP_UNITS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { Check, Loader2, BookOpen, Save } from 'lucide-react';
import { toast } from 'sonner';

// UNITS are imported from constants now

interface ESPUnitManagerProps {
    requestId: string;
    studentName: string;
}

interface UnitData {
    unit_name: string;
    is_completed: boolean;
    admin_note: string;
}

export function ESPUnitManager({ requestId, studentName }: ESPUnitManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [units, setUnits] = useState<Record<string, UnitData>>({});
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Fetch existing units when dialog opens
    useEffect(() => {
        if (isOpen && requestId) {
            fetchUnits();
        }
    }, [isOpen, requestId]);

    const fetchUnits = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('esp_units')
            .select('*')
            .eq('request_id', requestId);

        const unitMap: Record<string, UnitData> = {};
        data?.forEach((u: any) => {
            unitMap[u.unit_name] = {
                unit_name: u.unit_name,
                is_completed: u.is_completed,
                admin_note: u.admin_note || ''
            };
        });
        setUnits(unitMap);
        setLoading(false);
    };

    const handleToggle = async (unitName: string) => {
        const current = units[unitName] || { unit_name: unitName, is_completed: false, admin_note: '' };
        const newState = !current.is_completed;

        // Optimistic update
        setUnits(prev => ({
            ...prev,
            [unitName]: { ...current, is_completed: newState }
        }));

        // Upsert to DB
        await upsertUnit(unitName, newState, current.admin_note);
    };

    const handleNoteChange = (unitName: string, note: string) => {
        const current = units[unitName] || { unit_name: unitName, is_completed: false, admin_note: '' };
        setUnits(prev => ({
            ...prev,
            [unitName]: { ...current, admin_note: note }
        }));
    };

    const handleSaveNote = async (unitName: string) => {
        const current = units[unitName];
        if (!current) return;

        await upsertUnit(unitName, current.is_completed, current.admin_note);
        toast.success(`Not kaydedildi: ${unitName}`);
    };

    const upsertUnit = async (unitName: string, isCompleted: boolean, note: string) => {
        const { error } = await supabase
            .from('esp_units')
            .upsert({
                request_id: requestId,
                unit_name: unitName,
                is_completed: isCompleted,
                admin_note: note,
                updated_at: new Date().toISOString()
            }, { onConflict: 'request_id, unit_name' });

        if (error) {
            console.error(error);
            toast.error('Güncelleme hatası');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Yönet
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-neutral-900 border-neutral-800 h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{studentName} - ESP Ünite Yönetimi</DialogTitle>
                    <DialogDescription>
                        Bitirilen üniteleri işaretleyin ve not/puan girişi yapın.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {ESP_UNITS.map((u) => {
                            const unitIdentifier = `Unit ${u.id}`; // Key used in DB
                            const displayTitle = `UNIT ${u.id}: ${u.title}`;
                            const data = units[unitIdentifier] || { is_completed: false, admin_note: '' };

                            return (
                                <div key={u.id} className={`
                                    p-4 rounded-lg border flex items-center gap-4 transition-colors
                                    ${data.is_completed ? 'bg-green-900/10 border-green-900/30' : 'bg-neutral-800/30 border-neutral-800'}
                                `}>
                                    {/* Action Box */}
                                    <div
                                        onClick={() => handleToggle(unitIdentifier)}
                                        className={`
                                            w-12 h-12 rounded-lg flex items-center justify-center border cursor-pointer shrink-0
                                            ${data.is_completed
                                                ? 'bg-green-600 border-green-600 text-white'
                                                : 'border-neutral-600 hover:border-neutral-500 text-transparent hover:text-neutral-700'}
                                        `}
                                    >
                                        <Check className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between">
                                            <span className={`font-bold text-sm ${data.is_completed ? 'text-green-500' : 'text-neutral-300'}`}>
                                                {displayTitle}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Not / Puan"
                                                value={data.admin_note}
                                                onChange={(e) => handleNoteChange(unitIdentifier, e.target.value)}
                                                className="h-8 text-xs bg-neutral-950/50"
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleSaveNote(unitIdentifier)}
                                            >
                                                <Save className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
