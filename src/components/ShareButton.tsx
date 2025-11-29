import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useMatchStore } from '../store/useMatchStore';
import { generateShareLink } from '../utils/share';

export function ShareButton() {
    const store = useMatchStore();
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        // Extract only the state parts, not the actions
        const stateToShare = {
            players: store.players,
            queue: store.queue,
            match: store.match
        };

        const link = generateShareLink(stateToShare);
        const message = `🏐 *Nosso Vôlei*\n\n Confira o placar, times e ranking do nosso jogo atualizados!\n\nAcesse aqui: ${link}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');

        // Optional: Copy to clipboard as fallback/feedback
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            onClick={handleShare}
            variant="outline"
            className="gap-2 border-green-500 text-green-600 hover:bg-green-50"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
            {copied ? 'Link Copiado!' : 'Compartilhar'}
        </Button>
    );
}
