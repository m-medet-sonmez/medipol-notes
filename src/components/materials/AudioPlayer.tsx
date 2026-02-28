'use client';

import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { FadeIn } from '@/components/ui/fade-in';
import { Music, AlertCircle } from 'lucide-react';
import '@/styles/audio-player.css'; // Custom styles we'll create

interface CustomAudioPlayerProps {
    src: string;
    title: string;
}

export function CustomAudioPlayer({ src, title }: CustomAudioPlayerProps) {
    if (!src) return null;

    return (
        <FadeIn>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Music className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">{title}</h3>
                        <p className="text-sm text-neutral-400">Podcast Özeti</p>
                    </div>
                </div>

                <AudioPlayer
                    src={src}
                    autoPlay={false}
                    showJumpControls={true}
                    customAdditionalControls={[]}
                    customVolumeControls={[]}
                    layout="horizontal-reverse"
                    style={{
                        background: 'transparent',
                        boxShadow: 'none',
                        padding: 0,
                    }}
                />
            </div>
        </FadeIn>
    );
}
