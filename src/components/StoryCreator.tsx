'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { toast } from "sonner";
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

    const generateCanvas = async () => {
        if (!storyRef.current) return null;

        // Create a wrapper to hold the clone without affecting layout
        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.zIndex = '-9999';
        wrapper.style.overflow = 'hidden';
        wrapper.style.pointerEvents = 'none';
        wrapper.style.opacity = '0'; // Hide from view but keep renderable

        document.body.appendChild(wrapper);

        // Clone the element
        const clone = storyRef.current.cloneNode(true) as HTMLElement;

        // Reset styles for the clone
        clone.style.width = '400px'; // Fixed width for consistency
        clone.style.height = '711px'; // 9:16 aspect ratio (400 * 16/9)
        clone.style.transform = 'none';
        clone.style.borderRadius = '0'; // Remove border radius for the image

        // Remove classes that may cause html2canvas issues on mobile
        clone.classList.remove('backdrop-blur-md');
        clone.style.backdropFilter = 'none';
        // Ensure background colors are explicit
        clone.style.backgroundColor = '#000000';

        wrapper.appendChild(clone);

        try {
            // Wait for images to render in the clone
            await new Promise(resolve => setTimeout(resolve, 800)); // Increased timeout

            const canvas = await html2canvas(clone, {
                useCORS: false,
                allowTaint: true,
                scale: 2, // Good quality
                backgroundColor: '#000000',
                logging: false,
                width: 400,
                height: 711,
            });

            return canvas;
        } catch (err) {
            console.error('Canvas generation failed:', err);
            throw err;
        } finally {
            document.body.removeChild(wrapper);
        }
    };

    const handleShare = async () => {
        setIsGenerating(true);

        try {
            const canvas = await generateCanvas();
            if (!canvas) throw new Error("Falha ao gerar canvas");

            canvas.toBlob(async (blob) => {
                if (!blob) throw new Error("Falha ao gerar imagem");

                const file = new File([blob], 'volei-ranking.png', { type: 'image/png' });

                if (navigator.share) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Ranking do Vôlei',
                            text: 'Confira o ranking de hoje!'
                        });
                        toast.success('Compartilhado com sucesso!');
                    } catch (err) {
                        console.error('Error sharing:', err);
                        // User cancelled
                    }
                } else {
                    // Fallback
                    const link = document.createElement('a');
                    link.download = 'volei-ranking.png';
                    link.href = canvas.toDataURL();
                    link.click();
                    toast.info('Compartilhamento nativo indisponível. Imagem baixada!');
                }
                setIsGenerating(false);
            }, 'image/png');

        } catch (err) {
            console.error('Error generating image:', err);
            toast.error('Erro ao criar imagem. Tente novamente.');
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        setIsGenerating(true);

        try {
            const canvas = await generateCanvas();
            if (!canvas) throw new Error("Falha ao gerar canvas");

            const link = document.createElement('a');
            link.download = 'volei-ranking.png';
            link.href = canvas.toDataURL();
            link.click();
            toast.success('Imagem baixada com sucesso!');

        } catch (err) {
            console.error('Error downloading:', err);
            toast.error('Erro ao baixar imagem.');
        } finally {
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
                            style={{ backgroundColor: '#000000' }}
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
                            <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.8))' }}
                            />

                            {/* Content Overlay */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                {/* Header */}
                                <div className="text-center pt-4">
                                    <h1 className="text-3xl font-black italic tracking-tighter drop-shadow-lg" style={{ color: '#ffffff' }}>
                                        VÔLEI DE AREIA
                                    </h1>
                                    <p className="text-sm font-medium uppercase tracking-widest drop-shadow-md" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                        Resenha do Dia
                                    </p>
                                </div>

                                {/* Ranking List */}
                                <div
                                    className="backdrop-blur-md rounded-2xl p-4 shadow-xl"
                                    style={{
                                        backgroundColor: 'rgba(0,0,0,0.4)',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderWidth: '1px',
                                        borderStyle: 'solid'
                                    }}
                                >
                                    <h2 className="text-center font-bold mb-3 uppercase text-xs tracking-wider" style={{ color: '#ffffff' }}>
                                        Reis da Quadra
                                    </h2>
                                    <div className="space-y-2">
                                        {sortedPlayers.map((player, index) => (
                                            <div key={player.id} className="flex items-center gap-3">
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                                                    style={{
                                                        backgroundColor: index === 0 ? '#EAB308' : index === 1 ? '#94A3B8' : index === 2 ? '#F97316' : '#334155',
                                                        color: '#ffffff'
                                                    }}
                                                >
                                                    {index + 1}
                                                </div>
                                                <span className="flex-1 font-bold text-sm truncate drop-shadow-sm" style={{ color: '#ffffff' }}>
                                                    {player.name}
                                                </span>
                                                <span
                                                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                    style={{
                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                        color: 'rgba(255,255,255,0.9)'
                                                    }}
                                                >
                                                    {player.wins} Vitórias
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer / Date */}
                                <div className="text-center pb-4">
                                    <p className="font-bold text-lg drop-shadow-md mb-1" style={{ color: '#ffffff' }}>
                                        {totalGames} Sets Jogados
                                    </p>
                                    <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
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

                        <Button
                            variant="ghost"
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="w-full text-slate-400 hover:text-white hover:bg-slate-800 h-12 rounded-full"
                        >
                            Baixar Imagem ⬇️
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
