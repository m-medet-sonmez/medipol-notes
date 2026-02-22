'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock, ArrowLeft, User, Mail, Phone, Users, Calendar, AlertTriangle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProfileInfo {
    email: string;
    full_name: string;
    phone?: string;
    student_group?: string;
    department?: string;
}

interface PaymentRequest {
    id: string;
    user_id: string;
    full_name: string;
    status: string;
    created_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
    profile?: ProfileInfo;
}

export default function PaymentApprovalsPage() {
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const fetchRequests = async () => {
        try {
            // Step 1: Fetch payment requests
            const { data: paymentData, error: paymentError } = await supabase
                .from('payment_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (paymentError) {
                console.error('Payment requests fetch error:', paymentError);
                setError(`Talepler yüklenemedi: ${paymentError.message}`);
                setLoading(false);
                return;
            }

            if (!paymentData || paymentData.length === 0) {
                setRequests([]);
                setLoading(false);
                return;
            }

            // Step 2: Fetch profiles for each unique user_id
            const userIds = [...new Set(paymentData.map(r => r.user_id))];
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, email, full_name, phone, student_group, department')
                .in('id', userIds);

            if (profilesError) {
                console.error('Profiles fetch error:', profilesError);
            }

            // Step 3: Merge profiles into payment requests
            const profileMap = new Map<string, ProfileInfo>();
            if (profilesData) {
                profilesData.forEach((p: any) => {
                    profileMap.set(p.id, {
                        email: p.email,
                        full_name: p.full_name,
                        phone: p.phone,
                        student_group: p.student_group,
                        department: p.department,
                    });
                });
            }

            const enrichedRequests: PaymentRequest[] = paymentData.map((req: any) => ({
                ...req,
                profile: profileMap.get(req.user_id),
            }));

            setRequests(enrichedRequests);
            setError(null);
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(`Beklenmeyen hata: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        const channel = supabase
            .channel('payment-requests')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'payment_requests',
                },
                () => {
                    fetchRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleApprove = async (request: PaymentRequest) => {
        setProcessingId(request.id);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            await supabase
                .from('payment_requests')
                .update({
                    status: 'approved',
                    reviewed_by: user?.id,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', request.id);

            await supabase
                .from('subscriptions')
                .update({ is_active: false })
                .eq('user_id', request.user_id);

            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 120);

            await supabase
                .from('subscriptions')
                .insert({
                    user_id: request.user_id,
                    plan: 'semester',
                    amount: 2999,
                    subscription_start_date: new Date().toISOString(),
                    subscription_end_date: endDate.toISOString(),
                    is_active: true,
                });

            fetchRequests();
        } catch (error) {
            console.error('Approval error:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (request: PaymentRequest) => {
        setProcessingId(request.id);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            await supabase
                .from('payment_requests')
                .update({
                    status: 'rejected',
                    reviewed_by: user?.id,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', request.id);

            fetchRequests();
        } catch (error) {
            console.error('Rejection error:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        setProcessingId(id);
        try {
            const { error } = await supabase
                .from('payment_requests')
                .delete()
                .eq('id', id);

            if (error) {
                toast.error('Talep silinirken bir hata oluştu.');
                console.error('Delete error:', error);
            } else {
                setRequests(prev => prev.filter(r => r.id !== id));
                toast.success('Ödeme talebi silindi.');
            }
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Beklenmeyen bir hata oluştu.');
        } finally {
            setProcessingId(null);
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const processedRequests = requests.filter(r => r.status !== 'pending');

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-neutral-800 rounded w-1/3" />
                    <div className="h-4 bg-neutral-800 rounded w-1/2" />
                    <div className="h-32 bg-neutral-800 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ödeme Onayları</h1>
                    <p className="text-muted-foreground">
                        Öğrencilerin ödeme taleplerini buradan kontrol edin ve onaylayın.
                    </p>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Pending Requests */}
            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    Bekleyen Talepler
                    {pendingRequests.length > 0 && (
                        <span className="ml-2 px-2.5 py-0.5 bg-yellow-500/10 text-yellow-400 text-sm font-bold rounded-full border border-yellow-500/20">
                            {pendingRequests.length}
                        </span>
                    )}
                </h2>

                {pendingRequests.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-neutral-700 rounded-xl text-neutral-400">
                        Bekleyen ödeme talebi bulunmuyor.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingRequests.map((req) => (
                            <div key={req.id} className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-yellow-500/30 transition-colors">
                                {/* Top row: Icon + Name + Buttons */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400 ring-1 ring-yellow-500/20">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-white">{req.profile?.full_name || req.full_name}</p>
                                            <p className="text-sm text-neutral-400">Ödeme talebi gönderdi</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleApprove(req)}
                                            disabled={processingId === req.id}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Onayla
                                        </button>
                                        <button
                                            onClick={() => handleReject(req)}
                                            disabled={processingId === req.id}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm font-semibold rounded-xl border border-red-500/20 transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reddet
                                        </button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    disabled={processingId === req.id}
                                                    className="p-2.5 hover:bg-neutral-800 text-neutral-500 hover:text-red-400 rounded-xl transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Talebi Sil</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {req.profile?.full_name || req.full_name} adlı kişinin ödeme talebini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(req.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                        Sil
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                {/* Detail grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">E-posta</p>
                                            <p className="text-sm text-white font-medium truncate">{req.profile?.email || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Telefon</p>
                                            <p className="text-sm text-white font-medium">{req.profile?.phone || 'Belirtilmedi'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Grup</p>
                                            <p className="text-sm text-white font-medium">{req.profile?.student_group || 'Belirtilmedi'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Talep Tarihi</p>
                                            <p className="text-sm text-white font-medium">
                                                {format(new Date(req.created_at), 'd MMM yyyy HH:mm', { locale: tr })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Processed Requests */}
            {processedRequests.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-neutral-400">İşlenen Talepler</h2>
                    <div className="space-y-3">
                        {processedRequests.map((req) => (
                            <div key={req.id} className="p-5 bg-neutral-900/50 border border-neutral-800/50 rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${req.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {req.status === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-200">{req.profile?.full_name || req.full_name}</p>
                                            <p className="text-xs text-neutral-500">{req.profile?.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${req.status === 'approved'
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                        </span>
                                        {req.reviewed_at && (
                                            <span className="text-xs text-neutral-600">
                                                {format(new Date(req.reviewed_at), 'd MMM HH:mm', { locale: tr })}
                                            </span>
                                        )}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    className="p-2 hover:bg-neutral-800 text-neutral-600 hover:text-red-400 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Talebi Sil</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {req.profile?.full_name || req.full_name} adlı kişinin ödeme talebini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(req.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                        Sil
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                <div className="flex gap-6 text-xs text-neutral-500 pl-11">
                                    {req.profile?.phone && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="w-3 h-3" /> {req.profile.phone}
                                        </span>
                                    )}
                                    {req.profile?.student_group && (
                                        <span className="flex items-center gap-1.5">
                                            <Users className="w-3 h-3" /> {req.profile.student_group}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(req.created_at), 'd MMM yyyy', { locale: tr })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
