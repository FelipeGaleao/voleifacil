'use client';

import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';

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
    history: { winner: Team; score: string; teamA: string[]; teamB: string[] }[];
    streak: number;
    streakTeamIds: string[];
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
    | { type: 'EDIT_PLAYER_NAME'; id: string; name: string }
    | { type: 'DECREASE_POINT'; team: Team }
    | { type: 'LOAD_STATE'; payload: AppState };

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
        streak: 0,
        streakTeamIds: [],
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

            // Rotation Logic: 2-Game Limit
            const isSameTeam = state.match.streakTeamIds.length > 0 &&
                winnerIds.length === state.match.streakTeamIds.length &&
                winnerIds.every(id => state.match.streakTeamIds.includes(id));

            const currentStreak = isSameTeam ? state.match.streak + 1 : 1;
            const limitReached = currentStreak >= 2;

            let nextQueue: string[];
            let newStreak: number;
            let newStreakIds: string[];

            if (limitReached) {
                // Winner played 2 games -> Goes to end of queue
                // Loser also goes to end of queue
                // Order: Queue + Loser + Winner (Winner played most recently, so last?)
                // Usually: Loser rotates out first. Winner rotates out after.
                // Let's put Loser then Winner at the end.
                nextQueue = [...state.queue, ...loserIds, ...winnerIds];
                newStreak = 0;
                newStreakIds = [];
            } else {
                // Winner stays -> Front of queue
                // Loser -> End of queue
                nextQueue = [...winnerIds, ...state.queue, ...loserIds];
                newStreak = currentStreak;
                newStreakIds = winnerIds;
            }

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
                        {
                            winner: action.winner,
                            score: `${state.match.scoreA}-${state.match.scoreB}`,
                            teamA: state.match.teamA,
                            teamB: state.match.teamB
                        },
                    ],
                    streak: newStreak,
                    streakTeamIds: newStreakIds,
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
                    streak: 0,
                    streakTeamIds: [],
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

        case 'LOAD_STATE': {
            // Migration: Ensure new fields exist if loading old state
            const loadedMatch = action.payload.match;
            return {
                ...action.payload,
                match: {
                    ...loadedMatch,
                    streak: loadedMatch.streak ?? 0,
                    streakTeamIds: loadedMatch.streakTeamIds ?? [],
                    history: loadedMatch.history.map((h: any) => ({
                        ...h,
                        teamA: h.teamA ?? [],
                        teamB: h.teamB ?? []
                    }))
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
    isLoaded: boolean;
} | null>(null);

export function MatchProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(matchReducer, initialState);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('volei-manager-state');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    dispatch({ type: 'LOAD_STATE', payload: parsed });
                } catch (e) {
                    console.error('Failed to parse saved state', e);
                }
            }
            setIsLoaded(true);
        }
    }, []);

    // Save to local storage on every state change, ONLY if loaded
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined') {
            localStorage.setItem('volei-manager-state', JSON.stringify(state));
        }
    }, [state, isLoaded]);

    return (
        <MatchContext.Provider value={{ state, dispatch, isLoaded }}>
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
