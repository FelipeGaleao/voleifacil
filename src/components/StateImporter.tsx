'use client';

import { useEffect, useState } from 'react';
import { useMatchStore } from '../store/useMatchStore';
import { parseStateFromLink } from '../utils/share';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function StateImporter() {
    const { importState } = useMatchStore();
    const [pendingState, setPendingState] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash.includes('state=')) {
            const newState = parseStateFromLink(window.location.hash);
            if (newState) {
                setPendingState(newState);
            }
        }
    }, []);

    const handleConfirm = () => {
        if (pendingState) {
            importState(pendingState);
            setPendingState(null);
            // Clear hash
            window.history.pushState("", document.title, window.location.pathname + window.location.search);
            alert('Estado carregado com sucesso!');
        }
    };

    const handleCancel = () => {
        setPendingState(null);
        // Clear hash
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
    };

    if (!pendingState) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-sm p-6 bg-white shadow-xl rounded-2xl">
                <h2 className="text-lg font-bold mb-2 text-slate-800">Carregar Estado Compartilhado?</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Isso substituirá todos os dados atuais (jogadores, placar, histórico) pelos dados do link.
                </p>
                <div className="flex gap-3">
                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Carregar
                    </Button>
                </div>
            </Card>
        </div>
    );
}
