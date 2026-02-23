import { useState, useCallback } from 'react';
import { BoardCard, Connection, ConnectionType } from '@/types/board';
import BoardCardComponent from './BoardCardComponent';
import ConnectionLines from './ConnectionLines';
import AddCardDialog from './AddCardDialog';
import ConnectionDialog from './ConnectionDialog';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const initialCards: BoardCard[] = [
  { id: '1', title: 'Πλάτων', description: 'Θεωρία των Ιδεών, η Πολιτεία, η Ανάμνηση', type: 'suspect', x: 80, y: 60, rotation: -2 },
  { id: '2', title: 'Αριστοτέλης', description: 'Μαθητής του Πλάτωνα, εμπειρισμός', type: 'suspect', x: 400, y: 80, rotation: 1.5 },
  { id: '3', title: 'Σωκράτης', description: 'Η μαιευτική μέθοδος, «Εν οίδα ότι ουδέν οίδα»', type: 'suspect', x: 700, y: 60, rotation: -1 },
  { id: '4', title: 'Η Ανάμνηση', description: 'Η ψυχή γνωρίζει ήδη τις αλήθειες πριν τη γέννηση', type: 'evidence', x: 150, y: 280, rotation: 3 },
  { id: '5', title: 'Η Προϋπαρξη', description: 'Η ψυχή υπάρχει πριν το σώμα', type: 'evidence', x: 500, y: 300, rotation: -2.5 },
  { id: '6', title: 'Σημείωση', description: 'Ελέγξτε τη σύνδεση μεταξύ ανάμνησης και μαιευτικής', type: 'note', x: 350, y: 180, rotation: 4 },
];

const initialConnections: Connection[] = [
  { id: 'c1', fromId: '1', toId: '2', type: 'evolution' },
  { id: 'c2', fromId: '1', toId: '4', type: 'agreement' },
  { id: 'c3', fromId: '2', toId: '5', type: 'disagreement' },
  { id: 'c4', fromId: '3', toId: '1', type: 'agreement' },
];

let nextId = 10;

export default function InvestigationBoard() {
  const [cards, setCards] = useState<BoardCard[]>(initialCards);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [pendingConnectionTo, setPendingConnectionTo] = useState<string | null>(null);

  const handleMove = useCallback((id: string, x: number, y: number) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, x, y } : c));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    setConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleConnectionStart = useCallback((id: string) => {
    if (connectingFromId === null) {
      setConnectingFromId(id);
      toast('Κάνε κλικ στο σύνδεσμο ενός άλλου στοιχείου για σύνδεση', { duration: 3000 });
    } else if (connectingFromId !== id) {
      // Complete connection
      setPendingConnectionTo(id);
      setShowConnectionDialog(true);
    } else {
      setConnectingFromId(null);
    }
  }, [connectingFromId]);

  const handleConnectionTypeSelect = useCallback((type: ConnectionType) => {
    if (connectingFromId && pendingConnectionTo) {
      const id = `c${nextId++}`;
      setConnections(prev => [...prev, { id, fromId: connectingFromId, toId: pendingConnectionTo, type }]);
    }
    setConnectingFromId(null);
    setPendingConnectionTo(null);
  }, [connectingFromId, pendingConnectionTo]);

  const handleAddCard = useCallback((card: Omit<BoardCard, 'id' | 'x' | 'y' | 'rotation'>) => {
    const id = `card-${nextId++}`;
    const x = 100 + Math.random() * 400;
    const y = 100 + Math.random() * 200;
    const rotation = (Math.random() - 0.5) * 8;
    setCards(prev => [...prev, { ...card, id, x, y, rotation }]);
  }, []);

  const handleDeleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-secondary border-b border-border">
        <h1 className="text-xl font-bold text-foreground tracking-wide">
          🔍 Πίνακας Έρευνας — Υπόθεση Φιλοσόφου
        </h1>
        <div className="flex items-center gap-3">
          {connectingFromId && (
            <span className="text-sm text-string-agreement animate-pulse">
              ● Σύνδεση ενεργή...
            </span>
          )}
          <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-1.5">
            <Plus size={14} />
            Νέο Στοιχείο
          </Button>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 relative cork-texture wood-frame overflow-auto">
        <ConnectionLines
          connections={connections}
          cards={cards}
          onDeleteConnection={handleDeleteConnection}
        />
        {cards.map((card) => (
          <BoardCardComponent
            key={card.id}
            card={card}
            isSelected={selectedId === card.id}
            isConnecting={connectingFromId === card.id}
            onSelect={setSelectedId}
            onMove={handleMove}
            onDelete={handleDelete}
            onConnectionStart={handleConnectionStart}
          />
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 aged-paper rounded p-3 z-20">
          <h4 className="text-xs font-bold text-card-foreground mb-2 uppercase tracking-wider">Συνδέσεις</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-card-foreground">
              <span className="w-6 h-0.5 bg-string-agreement" /> Συμφωνία
            </div>
            <div className="flex items-center gap-2 text-xs text-card-foreground">
              <span className="w-6 h-0.5 bg-string-evolution" /> Εξέλιξη
            </div>
            <div className="flex items-center gap-2 text-xs text-card-foreground">
              <span className="w-6 h-0.5 bg-string-disagreement" /> Αντίθεση
            </div>
          </div>
        </div>
      </div>

      <AddCardDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} onAdd={handleAddCard} />
      <ConnectionDialog
        open={showConnectionDialog}
        onClose={() => { setShowConnectionDialog(false); setConnectingFromId(null); setPendingConnectionTo(null); }}
        onSelect={handleConnectionTypeSelect}
      />
    </div>
  );
}
