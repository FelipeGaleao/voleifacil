'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if it's iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isIosDevice && !isStandalone) {
            setIsIOS(true);
            // Show iOS prompt only once per session or based on some logic
            // For now, we'll show it if it's not installed
            setIsVisible(true);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="p-4 bg-slate-900/90 backdrop-blur text-white border-0 shadow-2xl rounded-2xl flex items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-sm">Instalar App</h3>
                    <p className="text-xs text-slate-300">
                        {isIOS
                            ? "Toque em Compartilhar e depois em 'Adicionar à Tela de Início'"
                            : "Adicione à sua tela inicial para melhor experiência."}
                    </p>
                </div>

                {isIOS ? (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleClose}
                        className="shrink-0"
                    >
                        Ok, entendi
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleClose}
                            className="text-slate-300 hover:text-white hover:bg-white/10"
                        >
                            Agora não
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleInstallClick}
                            className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                        >
                            Instalar
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
