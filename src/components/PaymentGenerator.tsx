import { useState, useEffect } from 'react';
import { useMatchStore } from '../store/useMatchStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner"; // Assuming sonner is used, or we can use a simple alert/copy feedback

export function PaymentGenerator() {
    const { players, pixKey, courtValue, setPixKey, setCourtValue } = useMatchStore();

    // Initialize state correctly to avoid "0" being stuck
    const [localPixKey, setLocalPixKey] = useState(pixKey);
    const [localCourtValue, setLocalCourtValue] = useState(courtValue > 0 ? courtValue.toString() : '');
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [generatedText, setGeneratedText] = useState('');

    // Initialize selected players with all present players
    useEffect(() => {
        const presentPlayerIds = players.filter(p => p.isPresent).map(p => p.id);
        setSelectedPlayers(presentPlayerIds);
    }, [players]);

    // Update local state when store changes, but only if not editing
    useEffect(() => {
        if (!localPixKey) setLocalPixKey(pixKey);
        if (!localCourtValue && courtValue > 0) setLocalCourtValue(courtValue.toString());
    }, [pixKey, courtValue]);

    const handleTogglePlayer = (id: string) => {
        setSelectedPlayers(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleGenerate = () => {
        // Handle comma as decimal separator
        const value = parseFloat(localCourtValue.replace(',', '.'));
        if (isNaN(value) || value <= 0) {
            // Show error
            return;
        }

        // Save to store
        setPixKey(localPixKey);
        setCourtValue(value);

        const count = selectedPlayers.length;
        if (count === 0) return;

        const valuePerPerson = value / count;
        const formattedValue = valuePerPerson.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const playerList = players
            .filter(p => selectedPlayers.includes(p.id))
            .map((p, index) => `${index + 1} - ${p.name} `)
            .join('\n');

        const text = `Lista Final\nPix ${localPixKey}\n${formattedValue}\n\n${playerList}`;
        setGeneratedText(text);
    };

    const handleCopy = async () => {
        if (!generatedText) return;
        try {
            await navigator.clipboard.writeText(generatedText);
            // Feedback would go here
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                    Rachar Quadra
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90dvh] bg-white text-slate-900">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle className="text-slate-900">Rachar a Conta</DrawerTitle>
                        <DrawerDescription className="text-slate-500">Divide o valor da quadra entre a galera.</DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Total da Quadra</label>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400"
                                    value={localCourtValue}
                                    onChange={(e) => setLocalCourtValue(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Chave PIX (Recebedor)</label>
                                <Input
                                    placeholder="CPF/Email/Tel"
                                    className="bg-white text-slate-900 border-slate-300 placeholder:text-slate-400"
                                    value={localPixKey}
                                    onChange={(e) => setLocalPixKey(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-slate-700">Quem vai pagar? ({selectedPlayers.length})</label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-blue-500 hover:text-blue-700 hover:bg-transparent"
                                    onClick={() => {
                                        if (selectedPlayers.length === players.length) {
                                            setSelectedPlayers([]);
                                        } else {
                                            setSelectedPlayers(players.map(p => p.id));
                                        }
                                    }}
                                >
                                    {selectedPlayers.length === players.length ? 'Desmarcar todos' : 'Todos pagam'}
                                </Button>
                            </div>
                            <ScrollArea className="h-40 border border-slate-200 rounded-md p-2 bg-slate-50">
                                <div className="space-y-2">
                                    {players.map(player => (
                                        <div key={player.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`pay-${player.id}`}
                                                checked={selectedPlayers.includes(player.id)}
                                                onCheckedChange={() => handleTogglePlayer(player.id)}
                                                className="border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            <label
                                                htmlFor={`pay-${player.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-700"
                                            >
                                                {player.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {generatedText && (
                            <div className="bg-slate-100 p-3 rounded-md text-xs font-mono whitespace-pre-wrap border border-slate-200 text-slate-800">
                                {generatedText}
                            </div>
                        )}
                    </div>

                    <DrawerFooter>
                        {generatedText ? (
                            <div className="flex flex-col gap-2 w-full">
                                <Button onClick={handleCopy} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                                    Copiar pra Mandar
                                </Button>
                                <Button onClick={handleGenerate} variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 font-bold">
                                    Recalcular
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                Calcular Divisão
                            </Button>
                        )}
                        <DrawerClose asChild>
                            <Button variant="ghost" className="text-slate-400 hover:text-slate-600">Fechar</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
