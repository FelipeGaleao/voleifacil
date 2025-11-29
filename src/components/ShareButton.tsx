import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useMatchStore } from '../store/useMatchStore';
import { generateShareLink } from '../utils/share';

export function ShareButton() {
    const store = useMatchStore();
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleShare = async () => {
        setLoading(true);
        try {
            // Extract only the state parts, not the actions
            const stateToShare = {
                players: store.players,
                queue: store.queue,
                match: store.match,
                pixKey: store.pixKey,
                courtValue: store.courtValue
            };

            const longLink = generateShareLink(stateToShare);
            let finalLink = longLink;

            // Attempt to shorten
            try {
                const response = await fetch('/api/shorten', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: longLink }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.shortUrl) {
                        finalLink = data.shortUrl;
                    }
                }
            } catch (err) {
                console.error("Shortening failed, using long link", err);
            }

            const message = `🏐 *Nosso Vôlei*\n\n Confira o placar, times e ranking do nosso jogo atualizados!\n\nAcesse aqui: ${finalLink}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

            window.open(whatsappUrl, '_blank');

            // Optional: Copy to clipboard as fallback/feedback
            navigator.clipboard.writeText(finalLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleShare}
            variant="outline"
            disabled={loading}
            className="gap-2 border-green-500 text-green-600 hover:bg-green-50"
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
            )}
            {loading ? 'Gerando...' : (copied ? 'Copiado!' : 'Compartilhar')}
        </Button>
    );
}
