'use client';

import { useState } from 'react';
import { useMatchStore } from '../store/useMatchStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';

import { PaymentGenerator } from '@/components/PaymentGenerator';

export default function Home() {
  const { players, addPlayer, togglePresence, deletePlayer, editPlayerName } = useMatchStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const router = useRouter();

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    addPlayer(newPlayerName.trim());
    setNewPlayerName('');
  };

  const handleStartSession = () => {
    router.push('/dashboard');
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      editPlayerName(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este jogador?')) {
      deletePlayer(id);
    }
  };

  return (
    <div className="h-[calc(100dvh-4rem)] bg-slate-50 flex flex-col items-center p-4 font-sans text-slate-800 overflow-hidden">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-2 text-center text-slate-900 tracking-tight shrink-0">
        Vôlei de Areia STI
      </h1>

      {/* Main Card Container */}
      <Card className="w-full max-w-md flex-1 flex flex-col bg-white border-2 border-blue-400 shadow-sm rounded-3xl overflow-hidden min-h-0">

        {/* Header/Label */}
        <div className="pt-4 px-6 pb-2 shrink-0">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center">
            {players.length} Atletas
          </h2>
        </div>

        {/* Player List */}
        <ScrollArea className="flex-1 px-6 pb-4">
          <div className="space-y-3">
            {players.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-10">
                Nenhum atleta na lista.
              </p>
            ) : (
              players.map((player) => (
                <div key={player.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 group">
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border-2 border-white shadow-sm shrink-0">
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Name or Edit Input */}
                    {editingId === player.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => saveEdit(player.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(player.id)}
                        autoFocus
                        className="h-8 text-sm"
                      />
                    ) : (
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className="text-base font-bold text-slate-700 truncate cursor-pointer hover:text-blue-600"
                          onClick={() => startEditing(player.id, player.name)}
                        >
                          {player.name}
                        </span>
                        <button
                          onClick={() => startEditing(player.id, player.name)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={player.isPresent}
                      onCheckedChange={() => togglePresence(player.id)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                    <button
                      onClick={() => handleDelete(player.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Add Player Input */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <form onSubmit={handleAddPlayer} className="flex gap-2">
            <Input
              placeholder="Nome do craque..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="rounded-full bg-white border-slate-200 focus-visible:ring-blue-400 h-12 text-base px-6 shadow-sm flex-1"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm shrink-0"
              disabled={!newPlayerName.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
            </Button>
          </form>
        </div>
      </Card>

      {/* Start Button & Payment */}
      <div className="w-full max-w-md mt-4 mb-2 flex flex-col gap-3">
        <div className="flex justify-center">
          <PaymentGenerator />
        </div>
        <Button
          onClick={handleStartSession}
          className="w-full h-14 text-lg font-bold rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all active:scale-95"
        >
          Ir para a Quadra
        </Button>
      </div>
    </div>
  );
}
