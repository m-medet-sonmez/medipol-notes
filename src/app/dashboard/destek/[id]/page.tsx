import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, User, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Props {
    params: { id: string };
}

export default async function TicketDetailPage({ params }: Props) {
    const supabase = await createClient();
    const { id } = params;

    const { data: ticket } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', id)
        .single();

    if (!ticket) {
        return <div>Talep bulunamadı.</div>;
    }

    const statusMap = {
        open: { label: 'Açık', variant: 'default' },
        in_progress: { label: 'İşleniyor', variant: 'secondary' },
        resolved: { label: 'Çözüldü', variant: 'outline' },
        closed: { label: 'Kapatıldı', variant: 'destructive' },
    };

    const status = statusMap[ticket.status as keyof typeof statusMap] || statusMap.open;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/destek">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Talep Detayı</h1>
                    <p className="text-muted-foreground">ID: {ticket.id}</p>
                </div>
            </div>

            {/* Main Ticket Info */}
            <Card>
                <CardHeader className="border-b bg-muted/20">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle>{ticket.subject}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant={status.variant as any}>{status.label}</Badge>
                                <span>•</span>
                                <span>{ticket.category}</span>
                                <span>•</span>
                                <span>{format(new Date(ticket.created_at), 'd MMM yyyy HH:mm', { locale: tr })}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">Siz</p>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {ticket.message}
                            </p>
                        </div>
                    </div>

                    {ticket.admin_reply && (
                        <div className="flex gap-4 pl-4 md:pl-12 border-t pt-6">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-5 w-5 text-green-700" />
                            </div>
                            <div className="space-y-2 w-full">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium text-green-800">Destek Ekibi</p>
                                    <span className="text-xs text-muted-foreground">
                                        {ticket.replied_at && format(new Date(ticket.replied_at), 'd MMM HH:mm', { locale: tr })}
                                    </span>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-sm text-green-900 leading-relaxed whitespace-pre-wrap">
                                    {ticket.admin_reply}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
