'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/fade-in';
import { ArrowRight, BookOpen, Shield, Zap } from 'lucide-react';

export function LandingHero() {
    return (
        <div className="relative isolate overflow-hidden bg-background">
            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
                    <FadeIn>
                        <div className="mt-24 sm:mt-32 lg:mt-16">
                            <a href="#" className="inline-flex space-x-6">
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
                                    Yeni Dönem Yayında
                                </span>
                            </a>
                        </div>
                        <h1 className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                            Üniversite Hayatını <span className="text-primary">Kolaylaştır</span>
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            Ders notları, podcast özetleri, ESP Trust sistemi ve sınav takvimi.
                            Başarılı olmak için ihtiyacın olan her şey tek bir platformda.
                        </p>
                        <div className="mt-10 flex items-center gap-x-6">
                            <Link href="/giris">
                                <Button size="lg" className="gap-2">
                                    Hemen Başla <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/about" className="text-sm font-semibold leading-6 text-foreground">
                                Daha Fazla Bilgi <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </FadeIn>
                </div>

                {/* Abstract Visual Pattern */}
                <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
                    <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                        <div className="relative w-[500px] h-[500px] bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <FadeIn delay={0.2} className="flex gap-4 p-6 bg-card rounded-2xl border">
                        <BookOpen className="w-10 h-10 text-primary" />
                        <div>
                            <h3 className="font-semibold text-lg">Ders Notları & Podcast</h3>
                            <p className="text-muted-foreground text-sm mt-1">Haftalık güncellenen notlara ve sesli özetlere erişin.</p>
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.3} className="flex gap-4 p-6 bg-card rounded-2xl border">
                        <Shield className="w-10 h-10 text-blue-500" />
                        <div>
                            <h3 className="font-semibold text-lg">ESP Trust Sistemi</h3>
                            <p className="text-muted-foreground text-sm mt-1">İngilizce hazırlıkta devamsızlık ve puan derdine son.</p>
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.4} className="flex gap-4 p-6 bg-card rounded-2xl border">
                        <Zap className="w-10 h-10 text-yellow-500" />
                        <div>
                            <h3 className="font-semibold text-lg">Hızlı & Mobil Uyumlu</h3>
                            <p className="text-muted-foreground text-sm mt-1">İster telefondan, ister tabletten kesintisiz erişim.</p>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
