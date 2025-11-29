import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    pixKey: string;
    courtValue: number;
};

// --- Actions Interface ---

export type Location = 'queue' | 'teamA' | 'teamB';

interface MatchStore extends AppState {
    addPlayer: (name: string) => void;
    togglePresence: (id: string) => void;
    startMatch: () => void;
    scorePoint: (team: Team) => void;
    decreasePoint: (team: Team) => void;
    endMatch: (winner: Team) => void;
    shuffleTeams: () => void;
    rotateQueue: () => void;
    deletePlayer: (id: string) => void;
    editPlayerName: (id: string, name: string) => void;
    // New actions for drag-and-drop
    movePlayer: (source: Location, target: Location, playerId: string) => void;
    reorderQueue: (newOrder: string[]) => void;
    resetMatch: () => void; // Helper to reset match state if needed
    importState: (newState: AppState) => void;
    setPixKey: (key: string) => void;
    setCourtValue: (value: number) => void;
}

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
    pixKey: '',
    courtValue: 0,
};

// --- Store ---

export const useMatchStore = create<MatchStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            addPlayer: (name) => set((state) => {
                const newPlayer: Player = {
                    id: crypto.randomUUID(),
                    name,
                    isPresent: true,
                    wins: 0,
                    gamesPlayed: 0,
                };
                return {
                    players: [...state.players, newPlayer],
                    queue: [...state.queue, newPlayer.id],
                };
            }),

            deletePlayer: (id) => set((state) => {
                const newPlayers = state.players.filter(p => p.id !== id);
                const newQueue = state.queue.filter(qId => qId !== id);
                const newTeamA = state.match.teamA.filter(tId => tId !== id);
                const newTeamB = state.match.teamB.filter(tId => tId !== id);

                return {
                    players: newPlayers,
                    queue: newQueue,
                    match: {
                        ...state.match,
                        teamA: newTeamA,
                        teamB: newTeamB,
                    }
                };
            }),

            editPlayerName: (id, name) => set((state) => ({
                players: state.players.map(p =>
                    p.id === id ? { ...p, name } : p
                )
            })),

            // Move a player between queue and teams or between teams
            movePlayer: (source, target, playerId) => set((state) => {
                // Helper to remove from a list
                const removeFrom = (list: string[]) => list.filter((id) => id !== playerId);
                // Helper to add to a list (avoid duplicates)
                const addTo = (list: string[]) => (list.includes(playerId) ? list : [...list, playerId]);

                const newState: Partial<MatchStore> = {};

                // Remove from source
                if (source === 'queue') newState.queue = removeFrom(state.queue);
                else if (source === 'teamA') newState.match = { ...state.match, teamA: removeFrom(state.match.teamA) };
                else if (source === 'teamB') newState.match = { ...state.match, teamB: removeFrom(state.match.teamB) };

                // Add to target
                if (target === 'queue') newState.queue = addTo(newState.queue ?? state.queue);
                else if (target === 'teamA') {
                    const teamA = addTo((newState.match?.teamA ?? state.match.teamA));
                    newState.match = { ...(newState.match ?? state.match), teamA };
                } else if (target === 'teamB') {
                    const teamB = addTo((newState.match?.teamB ?? state.match.teamB));
                    newState.match = { ...(newState.match ?? state.match), teamB };
                }

                return { ...newState } as MatchStore;
            }),

            // Reorder the queue (newOrder is an array of player IDs in desired order)
            reorderQueue: (newOrder) => set(() => ({ queue: newOrder })),

            togglePresence: (id) => set((state) => {
                const player = state.players.find((p) => p.id === id);
                if (!player) return state;

                const isPresent = !player.isPresent;
                let newQueue = state.queue;

                if (isPresent) {
                    if (!newQueue.includes(id) && !state.match.teamA.includes(id) && !state.match.teamB.includes(id)) {
                        newQueue = [...newQueue, id];
                    }
                } else {
                    newQueue = newQueue.filter((qId) => qId !== id);
                }

                return {
                    players: state.players.map((p) =>
                        p.id === id ? { ...p, isPresent } : p
                    ),
                    queue: newQueue,
                };
            }),

            startMatch: () => set((state) => {
                if (state.match.active) return state;

                if (state.match.teamA.length === 4 && state.match.teamB.length === 4) {
                    return {
                        match: {
                            ...state.match,
                            active: true,
                            scoreA: 0,
                            scoreB: 0
                        }
                    };
                }

                if (state.queue.length < 8) return state;

                const teamA = state.queue.slice(0, 4);
                const teamB = state.queue.slice(4, 8);
                const remainingQueue = state.queue.slice(8);

                return {
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
            }),

            scorePoint: (team) => set((state) => {
                if (!state.match.active) return state;
                const newScoreA = team === 'A' ? state.match.scoreA + 1 : state.match.scoreA;
                const newScoreB = team === 'B' ? state.match.scoreB + 1 : state.match.scoreB;
                return {
                    match: {
                        ...state.match,
                        scoreA: newScoreA,
                        scoreB: newScoreB,
                    },
                };
            }),

            decreasePoint: (team) => set((state) => {
                if (!state.match.active) return state;
                const newScoreA = team === 'A' ? Math.max(0, state.match.scoreA - 1) : state.match.scoreA;
                const newScoreB = team === 'B' ? Math.max(0, state.match.scoreB - 1) : state.match.scoreB;
                return {
                    match: {
                        ...state.match,
                        scoreA: newScoreA,
                        scoreB: newScoreB,
                    },
                };
            }),

            endMatch: (winner) => set((state) => {
                if (!state.match.active) return state;

                const winnerIds = winner === 'A' ? state.match.teamA : state.match.teamB;
                const loserIds = winner === 'A' ? state.match.teamB : state.match.teamA;

                const newPlayers = state.players.map((p) => {
                    if (winnerIds.includes(p.id)) {
                        return { ...p, wins: p.wins + 1, gamesPlayed: p.gamesPlayed + 1 };
                    }
                    if (loserIds.includes(p.id)) {
                        return { ...p, gamesPlayed: p.gamesPlayed + 1 };
                    }
                    return p;
                });

                const isSameTeam = state.match.streakTeamIds.length > 0 &&
                    winnerIds.length === state.match.streakTeamIds.length &&
                    winnerIds.every(id => state.match.streakTeamIds.includes(id));

                const currentStreak = isSameTeam ? state.match.streak + 1 : 1;
                const limitReached = currentStreak >= 2;

                let nextQueue: string[];
                let newStreak: number;
                let newStreakIds: string[];

                if (limitReached) {
                    nextQueue = [...state.queue, ...loserIds, ...winnerIds];
                    newStreak = 0;
                    newStreakIds = [];
                } else {
                    nextQueue = [...winnerIds, ...state.queue, ...loserIds];
                    newStreak = currentStreak;
                    newStreakIds = winnerIds;
                }

                return {
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
                                winner,
                                score: `${state.match.scoreA}-${state.match.scoreB}`,
                                teamA: state.match.teamA,
                                teamB: state.match.teamB
                            },
                        ],
                        streak: newStreak,
                        streakTeamIds: newStreakIds,
                    },
                };
            }),

            shuffleTeams: () => set((state) => {
                let pool = [...state.match.teamA, ...state.match.teamB];
                let newQueue = [...state.queue];

                if (pool.length < 8) {
                    const needed = 8 - pool.length;
                    const pulled = newQueue.slice(0, needed);
                    newQueue = newQueue.slice(needed);
                    pool = [...pool, ...pulled];
                }

                for (let i = pool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [pool[i], pool[j]] = [pool[j], pool[i]];
                }

                const newTeamA = pool.slice(0, 4);
                const newTeamB = pool.slice(4, 8);
                const remainingPool = pool.slice(8);

                return {
                    queue: [...remainingPool, ...newQueue],
                    match: {
                        ...state.match,
                        teamA: newTeamA,
                        teamB: newTeamB,
                        streak: 0,
                        streakTeamIds: [],
                    }
                };
            }),

            rotateQueue: () => set((state) => {
                const { teamA, teamB } = state.match;
                let { queue } = state;

                if (teamA.length === 0 && teamB.length === 0) {
                    const newTeamA = queue.slice(0, 4);
                    const newTeamB = queue.slice(4, 8);
                    const newQueue = queue.slice(8);
                    return {
                        queue: newQueue,
                        match: { ...state.match, teamA: newTeamA, teamB: newTeamB }
                    };
                }

                const playersFromQueue = queue.slice(0, 4);
                const remainingQueue = queue.slice(4);
                const newQueue = [...remainingQueue, ...teamB];

                return {
                    queue: newQueue,
                    match: {
                        ...state.match,
                        teamB: playersFromQueue,
                    }
                };
            }),

            resetMatch: () => set((state) => ({
                match: {
                    ...state.match,
                    active: false,
                    scoreA: 0,
                    scoreB: 0,
                }
            })),

            importState: (newState) => set(() => ({
                ...newState
            })),

            setPixKey: (key) => set(() => ({ pixKey: key })),
            setCourtValue: (value) => set(() => ({ courtValue: value })),
        }),
        {
            name: 'volei-manager-state', // Keep the same key to preserve data
            storage: createJSONStorage(() => localStorage),
            migrate: (persistedState: any, version) => {
                // Migration logic from LOAD_STATE
                if (persistedState && persistedState.match) {
                    const loadedMatch = persistedState.match;
                    return {
                        ...persistedState,
                        match: {
                            ...loadedMatch,
                            streak: loadedMatch.streak ?? 0,
                            streakTeamIds: loadedMatch.streakTeamIds ?? [],
                            history: (loadedMatch.history || []).map((h: any) => ({
                                ...h,
                                teamA: h.teamA ?? [],
                                ...h,
                                teamB: h.teamB ?? []
                            }))
                        },
                        pixKey: persistedState.pixKey ?? '',
                        courtValue: persistedState.courtValue ?? 0,
                    };
                }
                return persistedState;
            },
        }
    )
);
