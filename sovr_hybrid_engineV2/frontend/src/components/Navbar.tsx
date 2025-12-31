'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
    { href: '/', label: 'Trade' },
    { href: '/spend', label: 'Spend' },
    { href: '/history', label: 'History' },
];

export function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                            <span className="font-bold text-white text-sm">S</span>
                        </div>
                        <span className="font-light text-lg tracking-tight text-white/90">
                            SOVR<span className="text-orange-400">.credit</span>
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 text-sm font-light tracking-wide rounded-lg transition-all duration-200 ${pathname === item.href
                                    ? 'text-white bg-white/5'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center gap-4">
                    <div className="md:hidden">
                        <ConnectButton
                            showBalance={false}
                            chainStatus="none"
                            accountStatus="avatar"
                        />
                    </div>
                    <div className="hidden md:block">
                        <ConnectButton
                            showBalance={false}
                            chainStatus="icon"
                            accountStatus="address"
                        />
                    </div>

                    <button
                        className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-black/95 border-b border-white/10 backdrop-blur-xl absolute w-full left-0 top-16 py-4 px-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`px-4 py-3 text-base font-light tracking-wide rounded-lg transition-all duration-200 ${pathname === item.href
                                ? 'text-white bg-white/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
