import React from 'react';

export const ESPLogo = ({ className = "w-auto h-12" }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 240 85"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* 'esp' text - Dark Navy Blue */}
            <text x="10" y="60" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="75" fill="#0f172a" className="dark:fill-white">
                esp
            </text>

            {/* Cursor Arrow - Orange */}
            {/* Positioning it to overlap the bottom right of the 'e' */}
            <path
                d="M55 52 L68 65 L60 70 L55 52 Z"
                fill="#f97316"
                stroke="white"
                strokeWidth="3"
                className="dark:stroke-neutral-900"
            />

            {/* 'TRUST' text - Orange */}
            {/* Aligned below or next to esp depending on design. User image shows it under 'sp' mostly or next to it. 
                Let's place it next to 'esp' but slightly offset or below as per second image. 
                Actually image 2 shows 'esp' (huge) and TRUST (smaller, orange) under 'sp'.
            */}
            <text x="85" y="78" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="24" fill="#f97316" letterSpacing="4">
                TRUST
            </text>
        </svg>
    );
};
