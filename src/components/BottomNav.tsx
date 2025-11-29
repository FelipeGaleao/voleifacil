'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50 pb-safe">
            <Link href="/" className={`flex flex-col items-center gap-1 p-2 ${isActive('/') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <span className="text-[10px] font-bold">Jogadores</span>
            </Link>

            <Link href="/dashboard" className={`flex flex-col items-center gap-1 p-2 ${isActive('/dashboard') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                <span className="text-[10px] font-bold">Times</span>
            </Link>

            <Link href="/match" className={`flex flex-col items-center gap-1 p-2 ${isActive('/match') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2" /><path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" /></svg>
                <span className="text-[10px] font-bold">Placar</span>
            </Link>

            <Link href="/stats" className={`flex flex-col items-center gap-1 p-2 ${isActive('/stats') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
                <span className="text-[10px] font-bold">Ranking</span>
            </Link>
        </div>
    );
}
