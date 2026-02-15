import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, User, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminReplyForm } from '@/components/support/AdminReplyForm';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminTicketDetailPage({ params }: Props) {
    const supabase = await createClient();
    const { id } = await params;

    const { data: ticket } = await supabase
        .from('support_tickets')
        .select(`
      *,
      profiles (
        full_name,
        email,
        role
      )
    `)
        .eq('id', id)
        .single();

    if (!ticket) {
        return <div>Talep bulunamadı.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/sorular">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Talep Yanıtla</h1>
                    <p className="text-muted-foreground">ID: {ticket.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sol Kolon: Talep Detayı ve Yanıt Formu */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="border-b bg-muted/20">
                            <CardTitle>{ticket.subject}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <Badge variant="outline">{ticket.category}</Badge>
                                <span>•</span>
                                <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'secondary'}>
                                    {ticket.priority.toUpperCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                        </CardContent>
                    </Card>

                    {/* Yanıt Formu (Sadece yanıtlanmamışsa veya güncellemek için) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Yanıt Gönder</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AdminReplyForm
                                ticketId={ticket.id}
                                currentStatus={ticket.status}
                                studentEmail={ticket.profiles?.email}
                                ticketSubject={ticket.subject}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sağ Kolon: Kullanıcı Bilgileri */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Öğrenci Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{ticket.profiles?.full_name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{ticket.profiles?.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{ticket.profiles?.email}</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Kayıt: {format(new Date(ticket.created_at), 'd MMM yyyy', { locale: tr })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
