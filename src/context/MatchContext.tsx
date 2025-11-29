'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// --- Types ---

export type Player = {
    id: string;
    name: string;
    isPresent: boolean;
    wins: number;
    gamesPlayed: number;
};

export type Team = 'A' | 'B';

export type MatchState = {
    active: boolean;
    teamA: string[]; // Player IDs
    teamB: string[]; // Player IDs
    scoreA: number;
    scoreB: number;
    history: { winner: Team; score: string }[];
};

export type AppState = {
    players: Player[];
    queue: string[]; // Player IDs
    match: MatchState;
};

// --- Actions ---

type Action =
    | { type: 'ADD_PLAYER'; name: string }
    | { type: 'TOGGLE_PRESENCE'; id: string }
    | { type: 'START_MATCH' }
    | { type: 'SCORE_POINT'; team: Team }
    | { type: 'END_MATCH'; winner: Team }
    | { type: 'SHUFFLE_TEAMS' }
    | { type: 'ROTATE_QUEUE' }
    | { type: 'DELETE_PLAYER'; id: string }
    | { type: 'EDIT_PLAYER_NAME'; id: string; name: string }
    | { type: 'DECREASE_POINT'; team: Team };

// --- Initial State ---

const initialState: AppState = {
    players: [],
    queue: [],
    match: {
        active: false,
        teamA: [],
        teamB: [],
        scoreA: 0,
        scoreB: 0,
        history: [],
    },
};

// --- Logic Helpers ---

const POINTS_TO_WIN = 15;
const MIN_LEAD = 2; // Extended scoring rule: must win by 2 if 15-15 (implied logic: if >= 15 and diff >= 2)

// --- Reducer ---

function matchReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'ADD_PLAYER': {
            const newPlayer: Player = {
                id: crypto.randomUUID(),
                name: action.name,
                isPresent: true, // Auto-mark present on add
                wins: 0,
                gamesPlayed: 0,
            };
            return {
                ...state,
                players: [...state.players, newPlayer],
                queue: [...state.queue, newPlayer.id], // Add to end of queue
            };
        }

        case 'DELETE_PLAYER': {
            // Remove from players list
            const newPlayers = state.players.filter(p => p.id !== action.id);
            // Remove from queue
            const newQueue = state.queue.filter(id => id !== action.id);
            // Remove from active match teams (if present)
            const newTeamA = state.match.teamA.filter(id => id !== action.id);
            const newTeamB = state.match.teamB.filter(id => id !== action.id);

            return {
                ...state,
                players: newPlayers,
                queue: newQueue,
                match: {
                    ...state.match,
                    teamA: newTeamA,
                    teamB: newTeamB,
                }
            };
        }

        case 'EDIT_PLAYER_NAME': {
            return {
                ...state,
                players: state.players.map(p =>
                    p.id === action.id ? { ...p, name: action.name } : p
                )
            };
        }

        case 'TOGGLE_PRESENCE': {
            const player = state.players.find((p) => p.id === action.id);
            if (!player) return state;

            const isPresent = !player.isPresent;
            let newQueue = state.queue;

            if (isPresent) {
                // If coming back, add to end of queue
                if (!newQueue.includes(action.id) && !state.match.teamA.includes(action.id) && !state.match.teamB.includes(action.id)) {
                    newQueue = [...newQueue, action.id];
                }
            } else {
                // If leaving, remove from queue
                newQueue = newQueue.filter((id) => id !== action.id);
                // Note: Handling removal from active match is complex, ignoring for MVP (assume they finish or manual reset)
            }

            return {
                ...state,
                players: state.players.map((p) =>
                    p.id === action.id ? { ...p, isPresent } : p
                ),
                queue: newQueue,
            };
        }

        case 'START_MATCH': {
            if (state.match.active) return state;

            // If teams are already formed (e.g. via Shuffle), just activate
            if (state.match.teamA.length === 4 && state.match.teamB.length === 4) {
                return {
                    ...state,
                    match: {
                        ...state.match,
                        active: true,
                        scoreA: 0,
                        scoreB: 0
                    }
                };
            }

            if (state.queue.length < 8) return state; // Need 8 players

            const teamA = state.queue.slice(0, 4);
            const teamB = state.queue.slice(4, 8);
            const remainingQueue = state.queue.slice(8);

            return {
                ...state,
                queue: remainingQueue,
                match: {
                    ...state.match,
                    active: true,
                    teamA,
                    teamB,
                    scoreA: 0,
                    scoreB: 0,
                },
            };
        }

        case 'SCORE_POINT': {
            if (!state.match.active) return state;

            const newScoreA = action.team === 'A' ? state.match.scoreA + 1 : state.match.scoreA;
            const newScoreB = action.team === 'B' ? state.match.scoreB + 1 : state.match.scoreB;

            return {
                ...state,
                match: {
                    ...state.match,
                    scoreA: newScoreA,
                    scoreB: newScoreB,
                },
            };
        }

        case 'DECREASE_POINT': {
            if (!state.match.active) return state;

            const newScoreA = action.team === 'A' ? Math.max(0, state.match.scoreA - 1) : state.match.scoreA;
            const newScoreB = action.team === 'B' ? Math.max(0, state.match.scoreB - 1) : state.match.scoreB;

            return {
                ...state,
                match: {
                    ...state.match,
                    scoreA: newScoreA,
                    scoreB: newScoreB,
                },
            };
        }

        case 'END_MATCH': {
            if (!state.match.active) return state;

            const winnerIds = action.winner === 'A' ? state.match.teamA : state.match.teamB;
            const loserIds = action.winner === 'A' ? state.match.teamB : state.match.teamA;

            // Update stats
            const newPlayers = state.players.map((p) => {
                if (winnerIds.includes(p.id)) {
                    return { ...p, wins: p.wins + 1, gamesPlayed: p.gamesPlayed + 1 };
                }
                if (loserIds.includes(p.id)) {
                    return { ...p, gamesPlayed: p.gamesPlayed + 1 };
                }
                return p;
            });

            // Standard Rotation: Winner -> Front of Queue (to be picked for Team A next), Next 4 -> Team B next. Loser -> End of Queue.
            const nextQueue = [...winnerIds, ...state.queue, ...loserIds];

            return {
                ...state,
                players: newPlayers,
                queue: nextQueue,
                match: {
                    ...state.match,
                    active: false,
                    teamA: [],
                    teamB: [],
                    scoreA: 0,
                    scoreB: 0,
                    history: [
                        ...state.match.history,
                        { winner: action.winner, score: `${state.match.scoreA}-${state.match.scoreB}` },
                    ],
                },
            };
        }

        case 'SHUFFLE_TEAMS': {
            // Combine current teams and queue to reshape if needed
            let pool = [...state.match.teamA, ...state.match.teamB];
            let newQueue = [...state.queue];

            // If we don't have 8 players in teams, try to fill from queue
            if (pool.length < 8) {
                const needed = 8 - pool.length;
                // We take as many as we can if queue doesn't have enough, or check logic
                // For now, take what's available
                const pulled = newQueue.slice(0, needed);
                newQueue = newQueue.slice(needed);
                pool = [...pool, ...pulled];
            }

            // Fisher-Yates shuffle
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }

            // Assign to teams
            const newTeamA = pool.slice(0, 4);
            const newTeamB = pool.slice(4, 8);
            // Any overflow goes back to queue (unlikely with this logic but safe)
            const remainingPool = pool.slice(8);

            return {
                ...state,
                queue: [...remainingPool, ...newQueue],
                match: {
                    ...state.match,
                    teamA: newTeamA,
                    teamB: newTeamB,
                    // We don't necessarily set active=true here, as this is just setup
                }
            };
        }

        case 'ROTATE_QUEUE': {
            const { teamA, teamB } = state.match;
            let { queue } = state;

            // If teams are empty, treat as "Fill Teams"
            if (teamA.length === 0 && teamB.length === 0) {
                const newTeamA = queue.slice(0, 4);
                const newTeamB = queue.slice(4, 8);
                const newQueue = queue.slice(8);
                return {
                    ...state,
                    queue: newQueue,
                    match: { ...state.match, teamA: newTeamA, teamB: newTeamB }
                };
            }

            // Standard Rotation: Team A stays, Team B out to end of queue, Queue front to Team B
            // (Or if Team A lost, they might go out? But "Avançar fila" usually implies a standard rotation cycle)
            // Let's assume: Team A stays, Team B -> Queue End, Queue Front -> Team B.

            // Check if we have enough in queue to replace Team B (need 4)
            // If not, maybe we just rotate players?
            // Let's assume we need 4.

            const playersFromQueue = queue.slice(0, 4);
            const remainingQueue = queue.slice(4);

            // Team B goes to end of queue
            const newQueue = [...remainingQueue, ...teamB];

            return {
                ...state,
                queue: newQueue,
                match: {
                    ...state.match,
                    teamB: playersFromQueue,
                    // Team A stays
                }
            };
        }

        default:
            return state;
    }
}

// --- Context ---

const MatchContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

export function MatchProvider({ children }: { children: ReactNode }) {
    // Load from local storage if available (Client side only)
    const [state, dispatch] = useReducer(matchReducer, initialState, (initial) => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('volei-manager-state');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error('Failed to parse saved state', e);
                }
            }
        }
        return initial;
    });

    // Save to local storage on every state change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('volei-manager-state', JSON.stringify(state));
        }
    }, [state]);

    return (
        <MatchContext.Provider value={{ state, dispatch }}>
            {children}
        </MatchContext.Provider>
    );
}

export function useMatch() {
    const context = useContext(MatchContext);
    if (!context) {
        throw new Error('useMatch must be used within a MatchProvider');
    }
    return context;
}
