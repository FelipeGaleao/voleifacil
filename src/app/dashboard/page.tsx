'use client';

import { useMatchStore } from '../../store/useMatchStore';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';
import { playSound } from '../../utils/sounds';
import { ShareButton } from "@/components/ShareButton";
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { match, queue, players, shuffleTeams, rotateQueue, startMatch } = useMatchStore();
    const router = useRouter();

    const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';

    const handleShuffle = () => {
        shuffleTeams();
    };

    const handleAdvance = () => {
        rotateQueue();
    };

    return (
        <div className="h-[calc(100dvh-4rem)] bg-slate-50 flex flex-col p-4 font-sans text-slate-800 overflow-hidden">
            {/* Title */}
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Na Quadra
                </h1>
                <ShareButton />
            </div>

            {/* Teams Section */}
            <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
                {/* Team A - Blue */}
                <Card className="p-3 bg-blue-500 border-0 shadow-lg rounded-3xl flex flex-col gap-2">
                    <h2 className="text-xs font-bold text-white/90 uppercase tracking-wider text-center">TIME A</h2>
                    <div className="space-y-1.5">
                        <AnimatePresence mode="popLayout">
                            {[0, 1, 2, 3].map(i => {
                                const playerId = match.teamA[i];
                                return (
                                    <motion.div
                                        key={playerId || `empty-a-${i}`}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="h-9 bg-white rounded-full flex items-center px-2 gap-2 shadow-sm"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold shrink-0">
                                            {playerId ? getPlayerName(playerId).substring(0, 1) : '-'}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 truncate">
                                            {playerId ? getPlayerName(playerId) : ''}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </Card>

                {/* Team B - Green */}
                <Card className="p-3 bg-green-500 border-0 shadow-lg rounded-3xl flex flex-col gap-2">
                    <h2 className="text-xs font-bold text-white/90 uppercase tracking-wider text-center">TIME B</h2>
                    <div className="space-y-1.5">
                        <AnimatePresence mode="popLayout">
                            {[0, 1, 2, 3].map(i => {
                                const playerId = match.teamB[i];
                                return (
                                    <motion.div
                                        key={playerId || `empty-b-${i}`}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="h-9 bg-white rounded-full flex items-center px-2 gap-2 shadow-sm"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[10px] font-bold shrink-0">
                                            {playerId ? getPlayerName(playerId).substring(0, 1) : '-'}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 truncate">
                                            {playerId ? getPlayerName(playerId) : ''}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </Card>
            </div>

            {/* Queue Section */}
            <div className="flex-1 flex flex-col min-h-0 mb-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                    PRÓXIMOS (FILA) ({queue.length})
                </h2>
                <ScrollArea className="flex-1 -mx-2 px-2">
                    <div className="grid grid-cols-2 gap-3 pb-4">
                        <AnimatePresence mode="popLayout">
                            {queue.length === 0 ? (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-2 text-slate-400 text-sm text-center py-4"
                                >
                                    Ninguém na espera
                                </motion.p>
                            ) : (
                                queue.map((id) => (
                                    <motion.div
                                        key={id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="h-12 bg-white rounded-full flex items-center px-3 gap-3 shadow-sm border border-slate-100"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                                            {getPlayerName(id).substring(0, 1)}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 truncate">{getPlayerName(id)}</span>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
                <Button
                    onClick={handleShuffle}
                    className="h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg active:scale-95 transition-all text-base"
                >
                    Sortear Times
                </Button>
                <Button
                    onClick={handleAdvance}
                    className="h-14 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg active:scale-95 transition-all text-base"
                >
                    Rodar Fila
                </Button>
            </div>

            {/* Hidden/Extra Link to Match (for usability) */}
            <div className="mt-4 text-center">
                <Button
                    className="w-full h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-xl active:scale-95 transition-all uppercase tracking-wide"
                    onClick={() => {
                        if (!match.active && match.teamA.length > 0) {
                            playSound('start');
                            startMatch(); // Ensure active state
                        }
                        router.push('/match');
                    }}
                >
                    Valendo! (Iniciar)
                </Button>
            </div>
        </div>
    );
}
