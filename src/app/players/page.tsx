'use client';

import { useState } from 'react';
import { useMatch } from '../../context/MatchContext';
import Link from 'next/link';

export default function PlayersPage() {
    const { state, dispatch } = useMatch();
    const [newPlayerName, setNewPlayerName] = useState('');

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlayerName.trim()) return;
        dispatch({ type: 'ADD_PLAYER', name: newPlayerName.trim() });
        setNewPlayerName('');
    };

    return (
        <div className="min-h-screen p-4 pb-24">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-sport italic">Player Manager</h1>
                <Link href="/" className="text-blue-600 font-bold">Done</Link>
            </header>

            {/* Add Player Form */}
            <form onSubmit={handleAddPlayer} className="card mb-6 flex gap-2">
                <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="New Player Name"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-lg"
                />
                <button type="submit" className="btn btn-primary">
                    Add
                </button>
            </form>

            {/* Player List */}
            <div className="space-y-3">
                {state.players.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">No players yet. Add some!</p>
                ) : (
                    state.players.map((player) => (
                        <div
                            key={player.id}
                            className={`card flex justify-between items-center transition-colors ${player.isPresent ? 'border-l-4 border-green-500' : 'opacity-60'
                                }`}
                        >
                            <div>
                                <h3 className="font-bold text-lg">{player.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {player.wins} Wins / {player.gamesPlayed} Games
                                </p>
                            </div>
                            <button
                                onClick={() => dispatch({ type: 'TOGGLE_PRESENCE', id: player.id })}
                                className={`btn ${player.isPresent ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {player.isPresent ? 'Present' : 'Absent'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
