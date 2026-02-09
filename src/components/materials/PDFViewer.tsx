'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker locally to avoid CDN issues (or use CDN if preferred)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    fileUrl: string;
    onDownload?: () => void;
}

export function PDFViewer({ fileUrl, onDownload }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [containerWidth, setContainerWidth] = useState<number>(0);

    useEffect(() => {
        // Simple responsive resize handler
        const updateWidth = () => {
            const w = document.getElementById('pdf-container')?.clientWidth;
            if (w) setContainerWidth(w);
        };
        window.addEventListener('resize', updateWidth);
        updateWidth();
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <FadeIn className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                        disabled={pageNumber <= 1}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium w-20 text-center">
                        {pageNumber} / {numPages || '-'}
                    </span>
                    <Button
                        onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                        disabled={pageNumber >= numPages}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium px-1 min-w-[3rem] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button
                        onClick={() => setScale(s => Math.min(2.5, s + 0.1))}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </div>

                {onDownload && (
                    <Button onClick={onDownload} size="sm" variant="secondary" className="ml-auto">
                        <Download className="w-4 h-4 mr-2" />
                        İndir
                    </Button>
                )}
            </div>

            {/* Document */}
            <div
                id="pdf-container"
                className="flex justify-center bg-neutral-950/50 border border-neutral-900 rounded-xl p-4 overflow-auto min-h-[500px]"
            >
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex items-center justify-center p-12 text-muted-foreground animate-pulse">
                            PDF Yükleniyor...
                        </div>
                    }
                    error={
                        <div className="flex items-center justify-center p-12 text-red-500">
                            PDF Yüklenirken Hata Oluştu.
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        width={containerWidth ? Math.min(containerWidth - 40, 800) : undefined}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-2xl rounded-sm overflow-hidden"
                    />
                </Document>
            </div>
        </FadeIn>
    );
}
