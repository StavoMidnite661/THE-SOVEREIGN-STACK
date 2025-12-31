import React from 'react';

export const EnergyBeam = () => {
    return (
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none z-0 overflow-hidden h-[500px] flex items-center justify-center">
            {/* Container for the beam parts to ensure they stay centered */}
            <div className="relative w-full max-w-7xl mx-auto h-full flex items-center justify-center">

                {/* Core Beam - The intense white center */}
                <div className="absolute w-full h-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20" />

                {/* Inner Glow - Orange intense aura */}
                <div className="absolute w-full h-[4px] bg-orange-400 blur-[2px] animate-pulse z-10" />

                {/* Middle Glow - Wider spread */}
                <div className="absolute w-full h-[20px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50 blur-[10px]" />

                {/* Outer Haze - Large vertical wash */}
                <div className="absolute w-full h-[150px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-[40px] mix-blend-screen" />

                {/* Dynamic Particles/Noise (Optional effect overlay) */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-transparent skew-x-12 opacity-20" />

            </div>
        </div>
    );
};
