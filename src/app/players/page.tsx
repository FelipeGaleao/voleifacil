'use client';

import { useState } from 'react';
import { useMatchStore } from '../../store/useMatchStore';
import Link from 'next/link';

export default function PlayersPage() {
    const { players, addPlayer, togglePresence } = useMatchStore();
    const [newPlayerName, setNewPlayerName] = useState('');

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlayerName.trim()) return;
        addPlayer(newPlayerName.trim());
        setNewPlayerName('');
    };

    return (
        <div className="min-h-screen p-4 pb-24">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-sport italic">Gerenciar Jogadores</h1>
                <Link href="/" className="text-blue-600 font-bold">Concluído</Link>
            </header>

            {/* Add Player Form */}
            <form onSubmit={handleAddPlayer} className="card mb-6 flex gap-2">
                <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Nome do Jogador"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
                />
                <button type="submit" className="btn btn-primary">
                    Adicionar
                </button>
            </form>

            {/* Player List */}
            <div className="space-y-3">
                {players.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">Sem jogadores. Adicione alguém!</p>
                ) : (
                    players.map((player) => (
                        <div
                            key={player.id}
                            className={`card flex justify-between items-center transition-colors ${player.isPresent ? 'border-l-4 border-green-500' : 'opacity-60'
                                }`}
                        >
                            <div>
                                <h3 className="font-bold text-lg">{player.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {player.wins} Vitórias / {player.gamesPlayed} Jogos
                                </p>
                            </div>
                            <button
                                onClick={() => togglePresence(player.id)}
                                className={`btn ${player.isPresent ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {player.isPresent ? 'Presente' : 'Ausente'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
