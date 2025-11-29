'use client';

import { useMatch } from '../../context/MatchContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';
import { playSound } from '../../utils/sounds';

export default function Dashboard() {
    const { state, dispatch } = useMatch();
    const { match, queue, players } = state;
    const router = useRouter();

    const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';

    const handleShuffle = () => {
        dispatch({ type: 'SHUFFLE_TEAMS' });
    };

    const handleAdvance = () => {
        dispatch({ type: 'ROTATE_QUEUE' });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-6 font-sans text-slate-800">
            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-8 text-slate-900 tracking-tight">
                Formação de Times Automática
            </h1>

            {/* Teams Section */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Team A - Blue */}
                <Card className="p-4 bg-blue-500 border-0 shadow-lg rounded-3xl flex flex-col gap-3">
                    <h2 className="text-sm font-bold text-white/90 uppercase tracking-wider text-center">TIME A</h2>
                    <div className="space-y-2">
                        {[0, 1, 2, 3].map(i => {
                            const playerId = match.teamA[i];
                            return (
                                <div key={i} className="h-10 bg-white rounded-full flex items-center px-2 gap-2 shadow-sm">
                                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                                        {playerId ? getPlayerName(playerId).substring(0, 1) : '-'}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 truncate">
                                        {playerId ? getPlayerName(playerId) : ''}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Team B - Green */}
                <Card className="p-4 bg-green-500 border-0 shadow-lg rounded-3xl flex flex-col gap-3">
                    <h2 className="text-sm font-bold text-white/90 uppercase tracking-wider text-center">TIME B</h2>
                    <div className="space-y-2">
                        {[0, 1, 2, 3].map(i => {
                            const playerId = match.teamB[i];
                            return (
                                <div key={i} className="h-10 bg-white rounded-full flex items-center px-2 gap-2 shadow-sm">
                                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold shrink-0">
                                        {playerId ? getPlayerName(playerId).substring(0, 1) : '-'}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 truncate">
                                        {playerId ? getPlayerName(playerId) : ''}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Queue Section */}
            <div className="flex-1 flex flex-col min-h-0 mb-6">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">FILA DE JOGADORES</h2>
                <ScrollArea className="flex-1 -mx-2 px-2">
                    <div className="grid grid-cols-2 gap-3 pb-4">
                        {queue.length === 0 ? (
                            <p className="col-span-2 text-slate-400 text-sm text-center py-4">Fila vazia</p>
                        ) : (
                            queue.map((id) => (
                                <div key={id} className="h-12 bg-white rounded-full flex items-center px-3 gap-3 shadow-sm border border-slate-100">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                                        {getPlayerName(id).substring(0, 1)}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 truncate">{getPlayerName(id)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
                <Button
                    onClick={handleShuffle}
                    className="h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg active:scale-95 transition-all text-base"
                >
                    Misturar Times
                </Button>
                <Button
                    onClick={handleAdvance}
                    className="h-14 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg active:scale-95 transition-all text-base"
                >
                    Avançar Fila
                </Button>
            </div>

            {/* Hidden/Extra Link to Match (for usability) */}
            <div className="mt-4 text-center">
                <Button
                    className="w-full h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-xl active:scale-95 transition-all uppercase tracking-wide"
                    onClick={() => {
                        if (!match.active && match.teamA.length > 0) {
                            playSound('start');
                            dispatch({ type: 'START_MATCH' }); // Ensure active state
                        }
                        router.push('/match');
                    }}
                >
                    Iniciar partida
                </Button>
            </div>
        </div>
    );
}
