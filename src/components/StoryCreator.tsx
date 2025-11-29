'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Player } from '@/store/useMatchStore';

interface StoryCreatorProps {
    players: Player[];
    totalGames: number;
}

export function StoryCreator({ players, totalGames }: StoryCreatorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const storyRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sort players for the ranking overlay
    const sortedPlayers = [...players]
        .sort((a, b) => b.wins - a.wins || b.gamesPlayed - a.gamesPlayed)
        .slice(0, 5);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target?.result as string);
                setIsOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleShare = async () => {
        if (!storyRef.current) return;
        setIsGenerating(true);

        try {
            // Wait a bit for images to load/render
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(storyRef.current, {
                useCORS: true,
                scale: 2, // Better quality
                backgroundColor: null,
            });

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const file = new File([blob], 'volei-ranking.png', { type: 'image/png' });

                if (navigator.share) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Ranking do Vôlei',
                            text: 'Confira o ranking de hoje!'
                        });
                    } catch (err) {
                        console.error('Error sharing:', err);
                    }
                } else {
                    // Fallback to download
                    const link = document.createElement('a');
                    link.download = 'volei-ranking.png';
                    link.href = canvas.toDataURL();
                    link.click();
                }
                setIsGenerating(false);
            }, 'image/png');

        } catch (err) {
            console.error('Error generating image:', err);
            setIsGenerating(false);
        }
    };

    return (
        <>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <Button
                variant="outline"
                size="icon"
                className="md:w-auto md:px-4 gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Criar Story"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                <span className="hidden md:inline">Criar Story</span>
            </Button>

            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent className="bg-slate-900 border-slate-800 text-white max-h-[95dvh]">
                    <div className="mx-auto w-full max-w-md p-4 flex flex-col items-center gap-4 h-full overflow-y-auto">
                        <div className="flex justify-between w-full items-center">
                            <h3 className="font-bold text-lg">Pré-visualização</h3>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                    Cancelar
                                </Button>
                            </DrawerClose>
                        </div>

                        {/* Story Container (9:16 Aspect Ratio) */}
                        <div
                            ref={storyRef}
                            className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-2xl"
                        >
                            {/* Background Image */}
                            {image && (
                                <img
                                    src={image}
                                    alt="Background"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

                            {/* Content Overlay */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                {/* Header */}
                                <div className="text-center pt-4">
                                    <h1 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-lg">
                                        VÔLEI DE AREIA
                                    </h1>
                                    <p className="text-white/80 text-sm font-medium uppercase tracking-widest drop-shadow-md">
                                        Resenha do Dia
                                    </p>
                                </div>

                                {/* Ranking List */}
                                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl">
                                    <h2 className="text-center text-white font-bold mb-3 uppercase text-xs tracking-wider">
                                        Reis da Quadra
                                    </h2>
                                    <div className="space-y-2">
                                        {sortedPlayers.map((player, index) => (
                                            <div key={player.id} className="flex items-center gap-3">
                                                <div className={`
                                                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm
                                                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-orange-500' : 'bg-slate-700'}
                                                `}>
                                                    {index + 1}
                                                </div>
                                                <span className="flex-1 text-white font-bold text-sm truncate drop-shadow-sm">
                                                    {player.name}
                                                </span>
                                                <span className="text-white/90 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                                                    {player.wins} Vitórias
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer / Date */}
                                <div className="text-center pb-4">
                                    <p className="text-white font-bold text-lg drop-shadow-md mb-1">
                                        {totalGames} Sets Jogados
                                    </p>
                                    <p className="text-white/60 text-xs font-mono">
                                        {new Date().toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleShare}
                            disabled={isGenerating}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-full shadow-lg shadow-blue-900/20"
                        >
                            {isGenerating ? 'Gerando...' : 'Compartilhar Story 📸'}
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
