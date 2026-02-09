import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="relative flex items-center justify-center">
                {/* Custom SVG Logo: Graduate with Book */}
                <svg
                    width="70"
                    height="70"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#9333ea]"
                >
                    {/* Mortarboard (Cap) - Moved up slightly */}
                    <path
                        d="M20 55 L100 20 L180 55 L100 90 L20 55 Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinejoin="round"
                    />
                    {/* Tassel */}
                    <path
                        d="M175 55 V90"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <circle cx="175" cy="95" r="5" fill="currentColor" />

                    {/* Head - Centered and overlapped by cap slightly */}
                    <circle cx="100" cy="100" r="28" fill="currentColor" />

                    {/* Neck/Tie Area */}
                    <path
                        d="M100 130 L90 150 H110 L100 130 Z"
                        fill="currentColor"
                    />

                    {/* Body - Full bust shape */}
                    <path
                        d="M40 145 
                           Q 20 155 20 180 
                           V 195 
                           H 180 
                           V 180 
                           Q 180 155 160 145
                           Q 100 130 40 145
                           Z"
                        fill="currentColor"
                    />

                    {/* The Open Book - Positioned on chest */}
                    <path
                        d="M 35 155
                           L 35 185
                           Q 100 205 165 185
                           L 165 155
                           Q 100 175 35 155
                           Z"
                        fill="white"
                    />
                    {/* Book Spine Detail */}
                    <path
                        d="M 100 165 V 195"
                        stroke="#9333ea"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            <span className="text-3xl font-bold text-[#9333ea] tracking-tight">
                Kafarahat
            </span>
        </div>
    );
}

