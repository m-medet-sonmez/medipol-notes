import { createClient } from '@/lib/supabase/server';
import { ESPRequestForm } from '@/components/esp/ESPRequestForm';
import { FadeIn } from '@/components/ui/fade-in';
import { ESP_UNITS } from '@/lib/constants';
import { Check, Lock } from 'lucide-react';

export default async function ESPTrustPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let request = null;
    let units: any[] = [];

    if (user) {
        // Fetch Request
        const { data: requestData } = await supabase
            .from('esp_requests')
            .select('*')
            .eq('user_id', user.id)
            .single();

        request = requestData;

        // Fetch Units if request exists
        if (request) {
            const { data: unitsData } = await supabase
                .from('esp_units')
                .select('*')
                .eq('request_id', request.id);
            units = unitsData || [];
        }
    }

    // We merge DB data with a static list constants

    const completedCount = ESP_UNITS.filter(tpl => {
        const unitIdentifier = `Unit ${tpl.id}`;
        const userUnit = units.find(u => u.unit_name === unitIdentifier);
        return userUnit?.is_completed;
    }).length;

    const progress = Math.round((completedCount / ESP_UNITS.length) * 100);

    return (
        <div className="space-y-8">
            <FadeIn>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">ESP Trust Servisi</h1>
                        <p className="text-muted-foreground">
                            İngilizce derslerin için otomatik takip ve puanlama sistemi.
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-neutral-800" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175} strokeDashoffset={175 - (175 * progress) / 100} className="text-green-500 transition-all duration-1000 ease-out" />
                            </svg>
                            <span className="absolute text-sm font-bold text-white">%{progress}</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-400">Genel İlerleme</p>
                            <p className="text-lg font-bold text-white">{completedCount} / {ESP_UNITS.length} Ünite</p>
                        </div>
                    </div>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Request Form */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                        <h3 className="text-xl font-semibold mb-4 text-white">Talep Oluştur</h3>
                        <p className="text-sm text-neutral-400 mb-6 hidden">
                            Lütfen ESP Trust şifrenizi almak için aşağıdaki formu doldurun.
                        </p>
                        <ESPRequestForm currentStatus={request?.status} />
                    </div>
                </div>

                {/* Right Side: Unit Grid */}
                <div className="lg:col-span-8">
                    <FadeIn delay={0.2}>
                        {/* Status Message */}
                        {request && (
                            <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-3">
                                <Check className="w-5 h-5" />
                                <div>
                                    <p className="font-semibold">Mevcut Durum: {request.status === 'pending' ? 'Beklemede' : request.status === 'processing' ? 'İnceleniyor' : 'Tamamlandı'}</p>
                                    <p className="text-xs opacity-80">Şifre ve bilgileriniz admin tarafından alındı. İşlemleriniz yapılıyor.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {ESP_UNITS.map((tpl) => {
                                const unitIdentifier = `Unit ${tpl.id}`;
                                const userUnit = units.find(u => u.unit_name === unitIdentifier);
                                const isCompleted = userUnit?.is_completed;
                                const note = userUnit?.admin_note;

                                return (
                                    <div
                                        key={tpl.id}
                                        className={`
                                            relative p-4 rounded-xl border transition-all duration-300 group
                                            flex flex-col items-center text-center gap-3 overflow-hidden
                                            ${isCompleted
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'}
                                        `}
                                    >
                                        {/* Status Icon */}
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                                            ${isCompleted
                                                ? 'bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                : 'bg-neutral-800 border-neutral-700 text-neutral-500 group-hover:border-neutral-600'}
                                        `}>
                                            {isCompleted ? <Check className="w-4 h-4" /> : <Lock className="w-3 h-3" />}
                                        </div>

                                        <div className="space-y-1 relative z-10 w-full">
                                            <span className={`text-2xl font-black block tracking-tighter ${isCompleted ? 'text-green-500' : 'text-neutral-700 group-hover:text-neutral-600'}`}>
                                                {tpl.id}
                                            </span>
                                            <span className={`text-[10px] font-semibold uppercase tracking-wide block ${isCompleted ? 'text-green-300' : 'text-neutral-500'}`}>
                                                UNIT
                                            </span>
                                        </div>

                                        {/* Admin Note / Score */}
                                        {note && (
                                            <div className="mt-1 px-2 py-1 bg-neutral-950 rounded text-xs font-mono text-yellow-500 w-full truncate border border-neutral-800">
                                                {note}
                                            </div>
                                        )}

                                        <p className={`text-xs font-medium leading-tight max-w-[90%] ${isCompleted ? 'text-green-200 line-through decoration-green-500/50' : 'text-neutral-400'}`}>
                                            {tpl.title}
                                        </p>

                                        {/* Completed Overlay Effect */}
                                        {isCompleted && (
                                            <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
