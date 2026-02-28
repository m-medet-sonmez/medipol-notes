'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import Lottie to avoid server-side rendering issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LottieAnimationProps {
    animationData: any;
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
}

export function LottieAnimation({ 
    animationData, 
    className, 
    loop = true, 
    autoplay = true 
}: LottieAnimationProps) {
    return (
        <div className={className}>
            <Lottie 
                animationData={animationData} 
                loop={loop} 
                autoplay={autoplay}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}
