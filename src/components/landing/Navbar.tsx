'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function Navbar({ className }: { className?: string }) {
    const [isOpen, setIsOpen] = React.useState(false);

    const navigation = [
        { name: 'Nasıl Çalışır?', href: '#how-it-works' },
        { name: 'Özellikler', href: '#features' },
        { name: 'Fiyatlandırma', href: '#pricing' },
        // { name: 'SSS', href: '#faq' },
    ];

    return (
        <header className={cn("absolute inset-x-0 top-0 z-50", className)}>
            <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 transition-opacity hover:opacity-80">
                        <Logo />
                    </Link>
                </div>

                {/* Mobile Menu Trigger */}
                <div className="flex lg:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                                <span className="sr-only">Open main menu</span>
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-black/90 backdrop-blur-xl border-white/10 text-white w-full sm:max-w-xs">
                            <div className="flex items-center justify-between mb-8">
                                <Link href="/" className="-m-1.5 p-1.5" onClick={() => setIsOpen(false)}>
                                    <Logo />
                                </Link>
                                {/* Close button is handled by Sheet primitive but we can add custom if needed */}
                            </div>
                            <div className="mt-6 flow-root">
                                <div className="-my-6 divide-y divide-white/10">
                                    <div className="space-y-4 py-6">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10 hover:text-purple-400 transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                        <Link
                                            href="/giris"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-white/10 hover:text-purple-400 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Giriş Yap
                                        </Link>
                                    </div>
                                    <div className="py-6">
                                        <Link
                                            href="/kayit"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-purple-600/20 hover:text-purple-400 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Kayıt Ol &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex lg:gap-x-8">
                    {navigation.map((item) => (
                        <Link key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors">
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6 items-center">
                    <Link href="/giris" className="text-sm font-medium leading-6 text-gray-300 hover:text-white transition-colors relative group">
                        Giriş Yap
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full"></span>
                    </Link>
                    <Link
                        href="/kayit"
                        className="group relative inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-2 text-sm font-medium text-white ring-1 ring-white/10 hover:ring-purple-500/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <span className="relative flex items-center gap-2">
                            Kayıt Ol <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </span>
                    </Link>
                </div>
            </nav>
        </header>
    );
}
