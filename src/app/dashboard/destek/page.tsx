import { createClient } from '@/lib/supabase/server';
import { TicketList } from '@/components/support/TicketList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function SupportPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: tickets } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Destek Merkezi</h1>
                    <p className="text-muted-foreground">
                        Sorularınızı ve taleplerinizi buradan takip edebilirsiniz.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/destek/yeni">
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Talep
                    </Link>
                </Button>
            </div>

            <TicketList tickets={tickets || []} />
        </div>
    );
}
