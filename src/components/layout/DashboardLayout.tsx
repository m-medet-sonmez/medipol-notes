'use client';

import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden md:flex flex-shrink-0" />

            {/* Mobile Sidebar & Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center p-4 border-b bg-card">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 border-r w-64">
                            <Sidebar className="border-none" />
                        </SheetContent>
                    </Sheet>
                    <span className="ml-4 font-bold text-lg">Medipol Notları</span>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
