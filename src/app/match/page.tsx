'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMatchStore } from '../../store/useMatchStore';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { playSound } from '../../utils/sounds';

export default function MatchPage() {
    const { match, players, scorePoint, decreasePoint, endMatch } = useMatchStore();
    const [isLoaded, setIsLoaded] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    // Redirect if no active match
    useEffect(() => {
        if (isLoaded && !match.active) {
            router.push('/dashboard');
        }
    }, [match.active, router, isLoaded]);

    if (!isLoaded || !match.active) return null;

    const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';

    const handleScore = (team: 'A' | 'B') => {
        playSound('score');
        scorePoint(team);
    };

    const playDecreaseSound = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, audioCtx.currentTime); // Lower pitch
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const handleDecrease = (e: React.MouseEvent, team: 'A' | 'B') => {
        e.stopPropagation(); // Prevent triggering the card click (score increase)
        playSound('decrease');
        decreasePoint(team);
    };

    // Check for win condition
    // Rule: First to 15 (Win by 2).
    // Exception: If 15-15, "Quem fazer 3 ganha" -> First to 18 (Hard Cap).
    const checkWin = () => {
        const { scoreA, scoreB } = match;

        // Hard Cap at 18 (Tie-break rule)
        if (scoreA === 18) return 'A';
        if (scoreB === 18) return 'B';

        // Standard Win by 2 (up to 18)
        if (scoreA >= 15 && scoreA >= scoreB + 2) return 'A';
        if (scoreB >= 15 && scoreB >= scoreA + 2) return 'B';

        return null;
    };

    const potentialWinner = checkWin();

    const handleFinishMatch = () => {
        if (potentialWinner) {
            playSound('finish');
            endMatch(potentialWinner);
            router.push('/stats');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="p-4 flex justify-between items-center bg-white border-b border-slate-100 shadow-sm z-10">
                <h1 className="font-bold text-slate-500 uppercase tracking-wider text-sm">Bola em Jogo</h1>
                <Button
                    variant="ghost"
                    className="text-slate-400 hover:text-slate-800"
                    onClick={() => router.push('/dashboard')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </Button>
            </header>

            {/* Scoreboard Area */}
            <main className="flex-1 flex flex-col p-4 gap-4">
                {/* Team A Area - Blue */}
                <Card
                    className="flex-1 relative bg-blue-500 border-0 shadow-lg rounded-3xl flex flex-col justify-center items-center p-6 transition-all active:scale-[0.98] active:bg-blue-600 cursor-pointer overflow-hidden group"
                    onClick={() => handleScore('A')}
                >
                    <div className="absolute top-6 left-6 text-blue-100/80 font-bold text-xl tracking-wider">TIME A</div>
                    <div className="text-[8rem] font-black leading-none text-white drop-shadow-md">{match.scoreA}</div>
                    <div className="mt-4 text-blue-100 text-center text-sm font-medium bg-blue-600/30 px-4 py-2 rounded-full backdrop-blur-sm">
                        {match.teamA.map(id => getPlayerName(id)).join(' • ')}
                    </div>

                    {/* Decrease Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-4 left-4 text-blue-200 hover:text-white hover:bg-blue-600/50 rounded-full w-12 h-12"
                        onClick={(e) => handleDecrease(e, 'A')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                    </Button>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-10 pointer-events-none">
                        <span className="text-9xl font-bold text-white">+1</span>
                    </div>
                </Card>

                {/* Team B Area - Green */}
                <Card
                    className="flex-1 relative bg-green-500 border-0 shadow-lg rounded-3xl flex flex-col justify-center items-center p-6 transition-all active:scale-[0.98] active:bg-green-600 cursor-pointer overflow-hidden group"
                    onClick={() => handleScore('B')}
                >
                    <div className="absolute top-6 left-6 text-green-100/80 font-bold text-xl tracking-wider">TIME B</div>
                    <div className="text-[8rem] font-black leading-none text-white drop-shadow-md">{match.scoreB}</div>
                    <div className="mt-4 text-green-100 text-center text-sm font-medium bg-green-600/30 px-4 py-2 rounded-full backdrop-blur-sm">
                        {match.teamB.map(id => getPlayerName(id)).join(' • ')}
                    </div>

                    {/* Decrease Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-4 left-4 text-green-200 hover:text-white hover:bg-green-600/50 rounded-full w-12 h-12"
                        onClick={(e) => handleDecrease(e, 'B')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                    </Button>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-10 pointer-events-none">
                        <span className="text-9xl font-bold text-white">+1</span>
                    </div>
                </Card>
            </main>

            {/* Winner Modal / Overlay */}
            {potentialWinner && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
                    <Card className="w-full max-w-sm p-8 bg-white border-0 shadow-2xl rounded-[2rem] text-center">
                        <h2 className="text-2xl font-black mb-2 uppercase text-slate-800 tracking-tight">
                            {potentialWinner === 'A' ? 'Vitória do Time A!' : 'Vitória do Time B!'}
                        </h2>
                        <p className="text-slate-500 mb-8 text-lg font-medium">
                            Placar Final: <span className="text-slate-800 font-bold">{match.scoreA} - {match.scoreB}</span>
                        </p>

                        <Button
                            onClick={handleFinishMatch}
                            className="w-full h-14 text-lg font-bold rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg mb-3 transition-all active:scale-95"
                        >
                            Encerrar Set
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => scorePoint(potentialWinner === 'A' ? 'B' : 'A')} // Undo/Continue
                            className="w-full h-12 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
                        >
                            Voltar / Corrigir
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
