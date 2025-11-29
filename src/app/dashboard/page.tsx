'use client';

import { useMatchStore, Location } from '../../store/useMatchStore';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';
import { playSound } from '../../utils/sounds';
import { ShareButton } from "@/components/ShareButton";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DropAnimation,
    useDroppable
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { SortablePlayer } from '@/components/SortablePlayer';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Dashboard() {
    const { match, queue, players, shuffleTeams, rotateQueue, movePlayer, reorderQueue, startMatch } = useMatchStore();
    const router = useRouter();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        playSound('click');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find source and target containers
        const findContainer = (id: string): Location | undefined => {
            if (id === 'queue' || id === 'teamA' || id === 'teamB') return id as Location;
            if (match.teamA.includes(id)) return 'teamA';
            if (match.teamB.includes(id)) return 'teamB';
            if (queue.includes(id)) return 'queue';
            return undefined;
        };

        const source = findContainer(activeId);
        const target = findContainer(overId);

        if (!source || !target) return;

        if (source === target) {
            // Reordering within the same list
            if (source === 'queue') {
                const oldIndex = queue.indexOf(activeId);
                const newIndex = queue.indexOf(overId);
                if (oldIndex !== newIndex) {
                    reorderQueue(arrayMove(queue, oldIndex, newIndex));
                    playSound('click');
                }
            }
            // We don't reorder teams as they are sets, but visual reordering could be added if needed.
        } else {
            // Moving between lists
            movePlayer(source, target, activeId);
            playSound('click');
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    // Droppable Container Component for Teams
    const TeamContainer = ({ id, title, players: teamPlayers, colorClass, bgClass }: { id: string, title: string, players: string[], colorClass: string, bgClass: string }) => {
        const { setNodeRef } = useDroppable({ id });

        return (
            <Card ref={setNodeRef} className={`p-3 ${bgClass} border-0 shadow-lg rounded-3xl flex flex-col gap-2 min-h-[180px]`}>
                <h2 className="text-xs font-bold text-white/90 uppercase tracking-wider text-center">{title}</h2>
                <div className="space-y-1.5 flex-1">
                    <SortableContext id={id} items={teamPlayers} strategy={rectSortingStrategy}>
                        {teamPlayers.map((playerId) => (
                            <SortablePlayer key={playerId} id={playerId} className="h-9 bg-white rounded-full flex items-center px-2 gap-2 shadow-sm">
                                <div className={`w-6 h-6 rounded-full ${colorClass.replace('text-', 'bg-').replace('600', '100')} flex items-center justify-center ${colorClass} text-[10px] font-bold shrink-0`}>
                                    {getPlayerName(playerId).substring(0, 1)}
                                </div>
                                <span className="text-xs font-bold text-slate-700 truncate">
                                    {getPlayerName(playerId)}
                                </span>
                            </SortablePlayer>
                        ))}
                        {/* Render empty slots if less than 4 players */}
                        {Array.from({ length: Math.max(0, 4 - teamPlayers.length) }).map((_, i) => (
                            <div key={`empty-${id}-${i}`} className="h-9 bg-white/20 rounded-full border border-white/30 border-dashed flex items-center justify-center">
                                <span className="text-white/50 text-[10px] font-bold">Vazio</span>
                            </div>
                        ))}
                    </SortableContext>
                </div>
            </Card>
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
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
                    <TeamContainer
                        id="teamA"
                        title="TIME A"
                        players={match.teamA}
                        colorClass="text-blue-600"
                        bgClass="bg-blue-500"
                    />
                    <TeamContainer
                        id="teamB"
                        title="TIME B"
                        players={match.teamB}
                        colorClass="text-green-600"
                        bgClass="bg-green-500"
                    />
                </div>

                {/* Queue Section */}
                <div className="flex-1 flex flex-col min-h-0 mb-4">
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                            Próximos ({queue.length})
                        </h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={shuffleTeams} className="h-7 text-xs px-2">
                                Embaralhar
                            </Button>
                            <Button variant="outline" size="sm" onClick={rotateQueue} className="h-7 text-xs px-2">
                                Girar
                            </Button>
                        </div>
                    </div>

                    <Card className="flex-1 bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-2">
                                <SortableContext id="queue" items={queue} strategy={verticalListSortingStrategy}>
                                    <div ref={useDroppable({ id: 'queue' }).setNodeRef} className="min-h-[100px] space-y-2">
                                        {queue.length === 0 ? (
                                            <div className="text-center py-8 text-slate-400 text-sm italic">
                                                Ninguém na fila
                                            </div>
                                        ) : (
                                            queue.map((playerId, index) => (
                                                <SortablePlayer key={playerId} id={playerId} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <span className="font-semibold text-slate-700 text-sm">
                                                        {getPlayerName(playerId)}
                                                    </span>
                                                </SortablePlayer>
                                            ))
                                        )}
                                    </div>
                                </SortableContext>
                            </div>
                        </ScrollArea>
                    </Card>
                </div>

                {/* Start Match Button */}
                <Button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-2xl shadow-lg shadow-slate-900/20 shrink-0"
                    onClick={() => {
                        startMatch();
                        router.push('/match');
                    }}
                    disabled={match.teamA.length !== 4 || match.teamB.length !== 4}
                >
                    INICIAR PARTIDA
                </Button>
            </div>

            {/* Drag Overlay */}
            {mounted && createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <div className="h-9 bg-white rounded-full flex items-center px-2 gap-2 shadow-lg ring-2 ring-slate-900/10 opacity-90 cursor-grabbing w-[150px]">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold shrink-0">
                                {getPlayerName(activeId).substring(0, 1)}
                            </div>
                            <span className="text-xs font-bold text-slate-700 truncate">
                                {getPlayerName(activeId)}
                            </span>
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
