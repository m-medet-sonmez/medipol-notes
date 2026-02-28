'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface TicketListProps {
    tickets: any[];
}

export function TicketList({ tickets }: TicketListProps) {
    const statusMap = {
        open: { label: 'Açık', variant: 'default' },
        in_progress: { label: 'İşleniyor', variant: 'secondary' },
        resolved: { label: 'Çözüldü', variant: 'outline' },
        closed: { label: 'Kapatıldı', variant: 'destructive' },
    };

    return (
        <div className="space-y-4">
            {tickets.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Henüz Destek Talebiniz Yok</h3>
                        <p className="text-muted-foreground mb-6">
                            Bir sorunuz veya sorununuz varsa yeni bir talep oluşturabilirsiniz.
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/destek/yeni">
                                <Plus className="mr-2 h-4 w-4" />
                                Yeni Talep Oluştur
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket) => {
                        const status = statusMap[ticket.status as keyof typeof statusMap] || statusMap.open;
                        return (
                            <Link key={ticket.id} href={`/dashboard/destek/${ticket.id}`}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold">{ticket.subject}</h4>
                                                    <Badge variant={status.variant as any}>{status.label}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {ticket.message}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                    <span>{ticket.category}</span>
                                                    <span>•</span>
                                                    <span>{format(new Date(ticket.created_at), 'd MMM yyyy HH:mm', { locale: tr })}</span>
                                                </div>
                                            </div>

                                            {ticket.admin_reply && (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    Yanıtlandı
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
