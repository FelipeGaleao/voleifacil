'use client';

import Link from 'next/link';
import { useMatch } from '../../context/MatchContext';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function StatsPage() {
    const { state } = useMatch();
    const { players, match } = state;

    // Sort players by Wins (desc), then Games Played (desc)
    const sortedByWins = [...players].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.gamesPlayed - a.gamesPlayed;
    });

    const totalGames = match.history.length;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-6 font-sans text-slate-800">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 relative">
                <Link href="/dashboard" className="absolute left-0">
                    <Button variant="ghost" className="text-slate-400 hover:text-slate-800 -ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-center w-full text-slate-900 tracking-tight">
                    Estatísticas do Dia
                </h1>
            </header>

            <ScrollArea className="flex-1 -mx-4 px-4 md:-mx-6 md:px-6 pb-6">
                <div className="space-y-6 pb-8">

                    {/* Ranking Card */}
                    <section>
                        <h2 className="text-sm font-bold text-slate-500 text-center mb-3">Ranking</h2>
                        <Card className="bg-white border-2 border-blue-400 shadow-sm rounded-3xl overflow-hidden p-1">
                            <div className="divide-y divide-slate-50">
                                {sortedByWins.length === 0 ? (
                                    <p className="text-center text-slate-400 py-8 text-sm">Nenhuma vitória registrada.</p>
                                ) : (
                                    sortedByWins.map((player, index) => (
                                        <div key={player.id} className="flex items-center p-4 gap-3">
                                            {/* Position Badge */}
                                            <div className="w-8 flex justify-center">
                                                {index === 0 && (
                                                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold shadow-sm">1</div>
                                                )}
                                                {index === 1 && (
                                                    <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold shadow-sm">2</div>
                                                )}
                                                {index === 2 && (
                                                    <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold shadow-sm">3</div>
                                                )}
                                                {index > 2 && (
                                                    <span className="text-slate-400 font-bold text-lg">{index + 1}</span>
                                                )}
                                            </div>

                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border-2 border-white shadow-sm">
                                                {player.name.substring(0, 2).toUpperCase()}
                                            </div>

                                            {/* Name */}
                                            <div className="flex-1 font-bold text-slate-700 text-base truncate">
                                                {player.name}
                                            </div>

                                            {/* Wins Pill */}
                                            <div className={`
                        px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm
                        ${index === 0 || index === 1 ? 'bg-green-500' : 'bg-orange-400'}
                      `}>
                                                {player.wins} Vitórias
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </section>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Vitórias por Jogador (Mini Bars) */}
                        <Card className="bg-white border-0 shadow-sm rounded-3xl p-5 flex flex-col">
                            <h3 className="text-sm font-bold text-slate-700 mb-4">Vitórias por Jogador</h3>
                            <div className="space-y-3 flex-1">
                                {sortedByWins.slice(0, 3).map((player, idx) => (
                                    <div key={player.id} className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                            {player.name.substring(0, 1)}
                                        </div>
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-green-500' : 'bg-orange-400'}`}
                                                style={{ width: `${Math.max(10, (player.wins / (sortedByWins[0]?.wins || 1)) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {sortedByWins.length === 0 && <span className="text-slate-300 text-xs">Sem dados</span>}
                            </div>
                        </Card>

                        {/* Jogos Disputados */}
                        <Card className="bg-white border-0 shadow-sm rounded-3xl p-5 flex flex-col items-center justify-center text-center">
                            <h3 className="text-sm font-bold text-slate-700 mb-2">Jogos Disputados</h3>
                            <div className="text-5xl font-black text-slate-900 mb-1">
                                {totalGames}
                            </div>
                            <div className="text-sm text-slate-400 mb-3">Total</div>
                            <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                Hoje
                            </div>
                        </Card>
                    </div>

                    {/* Match History Card */}
                    <section>
                        <h2 className="text-sm font-bold text-slate-700 mb-3 ml-1">Histórico das Partidas</h2>
                        <Card className="bg-white border-0 shadow-sm rounded-3xl overflow-hidden">
                            <div className="divide-y divide-slate-50 p-2">
                                {match.history.length === 0 ? (
                                    <p className="text-center text-slate-400 py-6 text-sm">Nenhuma partida finalizada.</p>
                                ) : (
                                    [...match.history].reverse().map((item, index) => (
                                        <div key={index} className="p-3 flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-slate-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                            </div>
                                            <div className="flex-1 text-sm text-slate-600">
                                                <span className="font-medium text-slate-800">Time {item.winner}</span> venceu
                                                <span className="text-slate-400 mx-1">-</span>
                                                <span className="text-slate-500">{item.score}</span>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${item.winner === 'A' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </section>

                </div>
            </ScrollArea>


        </div>
    );
}
