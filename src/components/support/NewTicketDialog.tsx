'use client';

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { TicketForm } from '@/components/support/TicketForm';

interface NewTicketDialogProps {
    trigger?: ReactNode;
}

export function NewTicketDialog({ trigger }: NewTicketDialogProps = {}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Talep
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[90vh] md:h-auto overflow-y-auto bg-neutral-950 border-neutral-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Yeni Destek Talebi</DialogTitle>
                    <DialogDescription>
                        Sorununuzu bize bildirin, en kısa sürede dönüş yapalım.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <TicketForm
                        onSuccess={() => setOpen(false)}
                        onCancel={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
