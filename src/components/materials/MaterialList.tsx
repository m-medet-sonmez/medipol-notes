'use client';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { FadeIn } from '@/components/ui/fade-in';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Music, Download, Calendar, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Material {
    id: string;
    title: string;
    description: string;
    course: {
        course_code: string;
        course_name: string;
    };
    week: {
        week_name: string;
        start_date: string;
    };
    pdf_file_path: string;
    audio_file_path: string;
    created_at: string;
}

export function MaterialList() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchMaterials() {
            // In a real scenario, this query would be complex with access control checks
            // For demo, we fetch all active materials
            const { data, error } = await supabase
                .from('materials')
                .select(`
          *,
          course:courses(course_code, course_name),
          week:weeks(week_name, start_date)
        `)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (data) setMaterials(data);
            setLoading(false);
        }

        fetchMaterials();
    }, []);

    const filteredMaterials = materials.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.course.course_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Filters */}
            <FadeIn>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Ders veya konu ara..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Tüm Dersler</Button>
                        <Button variant="outline" size="sm">Bu Hafta</Button>
                    </div>
                </div>
            </FadeIn>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMaterials.map((material, i) => (
                    <FadeIn key={material.id} delay={i * 0.1}>
                        <Link href={`/dashboard/notlar/${material.id}`}>
                            <SpotlightCard className="h-full flex flex-col p-0 group cursor-pointer border-neutral-800 bg-neutral-900/50 hover:border-primary/50 transition-colors">
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                            {material.course.course_code}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(material.week.start_date), 'd MMMM', { locale: tr })}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                            {material.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                            {material.description || 'Açıklama bulunmuyor.'}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        {material.pdf_file_path && (
                                            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-400">
                                                <FileText className="w-3 h-3" /> PDF
                                            </div>
                                        )}
                                        {material.audio_file_path && (
                                            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-400">
                                                <Music className="w-3 h-3" /> Podcast
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 border-t border-neutral-800 bg-neutral-900/80 flex justify-between items-center rounded-b-xl group-hover:bg-primary/5 transition-colors">
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">İncele</span>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </SpotlightCard>
                        </Link>
                    </FadeIn>
                ))}

                {!loading && filteredMaterials.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        Aradığınız kriterlere uygun materyal bulunamadı.
                    </div>
                )}
            </div>
        </div>
    );
}
