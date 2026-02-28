import { AttendanceList } from '@/components/attendance/AttendanceList';
import { PersonalAttendance } from '@/components/attendance/PersonalAttendance';
import { FadeIn } from '@/components/ui/fade-in';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { NewTicketDialog } from '@/components/support/NewTicketDialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export default function AttendancePage() {
    return (
        <div className="space-y-8">
            <BackButton href="/dashboard" label="Ana Sayfa" />
            <FadeIn>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Yoklama Takibi</h1>
                        <p className="text-muted-foreground">
                            Derslere katılım durumunuzu buradan kendi çetelenizle takip edebilir,
                            ayrıca admin girişli resmi kayıtları inceleyebilirsiniz.
                        </p>
                    </div>

                    <NewTicketDialog
                        trigger={
                            <Button variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Admine Sor
                            </Button>
                        }
                    />
                </div>
            </FadeIn>

            {/* New Personal Tracker - Main Focus */}
            <PersonalAttendance />

            {/* Old Official Tracker - Hidden by default in accordion */}
            <FadeIn delay={0.2}>
                <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="official-attendance" className="border-b-0">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-neutral-800/50">
                                <div className="flex flex-col text-left">
                                    <span className="font-semibold text-lg text-neutral-300">Resmi Yoklama Kayıtları (Admin)</span>
                                    <span className="text-sm font-normal text-neutral-500 mt-1">Eğitmenler tarafından sisteme girilen listelenmiş yoklama durumları.</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-6 pt-0 border-t border-neutral-800/50 bg-neutral-950/30">
                                <div className="mt-6">
                                    <AttendanceList />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </FadeIn>
        </div>
    );
}
