import { useState, useCallback, useMemo } from 'react';
import { BoardCard, Connection, ConnectionType } from '@/types/board';
import BoardCardComponent from './BoardCardComponent';
import ConnectionLines from './ConnectionLines';
import AddCardDialog from './AddCardDialog';
import ConnectionDialog from './ConnectionDialog';
import { Plus, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import corkBg from '@/assets/cork-bg.jpg';
import woodFrame from '@/assets/wood-frame.jpg';
import platoImg from '@/assets/plato.jpg';
import aristotleImg from '@/assets/aristotle.jpg';
import socratesImg from '@/assets/socrates.jpg';
import cluesData from '@/data/clues.json';

const imageMap: Record<string, string> = {
  plato: platoImg,
  aristotle: aristotleImg,
  socrates: socratesImg,
};

const fallbackCards: BoardCard[] = [
  { id: '1', title: 'Πλάτων', description: 'Θεωρία των Ιδεών, η Πολιτεία, η Ανάμνηση', type: 'suspect', imageUrl: platoImg, x: 80, y: 60, rotation: -2 },
  { id: '2', title: 'Αριστοτέλης', description: 'Μαθητής του Πλάτωνα, εμπειρισμός', type: 'suspect', imageUrl: aristotleImg, x: 400, y: 80, rotation: 1.5 },
  { id: '3', title: 'Σωκράτης', description: 'Η μαιευτική μέθοδος, «Εν οίδα ότι ουδέν οίδα»', type: 'suspect', imageUrl: socratesImg, x: 700, y: 60, rotation: -1 },
  { id: '4', title: 'Η Ανάμνηση', description: 'Η ψυχή γνωρίζει ήδη τις αλήθειες πριν τη γέννηση', type: 'evidence', x: 150, y: 280, rotation: 3 },
  { id: '5', title: 'Η Προϋπαρξη', description: 'Η ψυχή υπάρχει πριν το σώμα', type: 'evidence', x: 500, y: 300, rotation: -2.5 },
  { id: '6', title: 'Σημείωση', description: 'Ελέγξτε τη σύνδεση μεταξύ ανάμνησης και μαιευτικής', type: 'note', x: 350, y: 180, rotation: 4 },
];

function extractImageUrl(text: string): { text: string; imageUrl?: string } {
  const urlMatch = text.match(/,?\s*(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp)\S*)\s*$/i);
  if (urlMatch) {
    return { text: text.slice(0, urlMatch.index).trim(), imageUrl: urlMatch[1] };
  }
  return { text };
}

function buildCardsFromClues(): BoardCard[] {
  try {
    if (!cluesData?.clues?.length) return fallbackCards;
    const positions = [
      { x: 80, y: 60 }, { x: 400, y: 80 }, { x: 700, y: 60 },
      { x: 150, y: 280 }, { x: 500, y: 300 }, { x: 350, y: 180 },
    ];
    return cluesData.clues.map((clue, i) => {
      const { text: descText, imageUrl: descImage } = extractImageUrl(clue.description || '');
      const { text: titleText, imageUrl: titleImage } = extractImageUrl(clue.title || '');
      const resolvedImage = (clue as any).imageUrl
        ? (imageMap[(clue as any).imageUrl] || (clue as any).imageUrl)
        : (descImage || titleImage);
      return {
        id: `clue-${i + 1}`,
        title: titleText,
        description: descText,
        type: (clue.type as BoardCard['type']) || 'evidence',
        imageUrl: resolvedImage,
        x: positions[i % positions.length].x + (i >= positions.length ? 50 * Math.floor(i / positions.length) : 0),
        y: positions[i % positions.length].y + (i >= positions.length ? 50 * Math.floor(i / positions.length) : 0),
        rotation: (Math.random() - 0.5) * 8,
      };
    });
  } catch {
    return fallbackCards;
  }
}

const initialConnections: Connection[] = [
  { id: 'c1', fromId: '1', toId: '2', type: 'evolution' },
  { id: 'c2', fromId: '1', toId: '4', type: 'agreement' },
  { id: 'c3', fromId: '2', toId: '5', type: 'disagreement' },
  { id: 'c4', fromId: '3', toId: '1', type: 'agreement' },
];

let nextId = 10;

export default function InvestigationBoard() {
  const navigate = useNavigate();
  const initialCards = useMemo(() => buildCardsFromClues(), []);
  const [cards, setCards] = useState<BoardCard[]>(initialCards);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [pendingConnectionTo, setPendingConnectionTo] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Map<string, ConnectionType>>(new Map());

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
      // Flip the target card when connection type is "evolution" or "agreement"
      if (type === 'evolution' || type === 'agreement' || type === 'disagreement') {
        setFlippedCards(prev => {
          const next = new Map(prev);
          next.set(pendingConnectionTo, type);
          return next;
        });
      }
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

  const handleUnflip = useCallback((id: string) => {
    setFlippedCards(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
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
          <Button onClick={() => navigate('/conclusion')} size="sm" variant="secondary" className="gap-1.5">
            <ScrollText size={14} />
            Συμπέρασμα
          </Button>
        </div>
      </header>

      {/* Board */}
      <div
        className="flex-1 relative cork-texture overflow-auto"
        style={{
          backgroundImage: `url(${corkBg})`,
          borderImage: `url(${woodFrame}) 30 round`,
          borderWidth: 14,
          borderStyle: 'solid',
        }}
      >
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
            isFlipped={flippedCards.has(card.id)}
            flipType={flippedCards.get(card.id)}
            onSelect={setSelectedId}
            onMove={handleMove}
            onDelete={handleDelete}
            onConnectionStart={handleConnectionStart}
            onUnflip={handleUnflip}
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
            <div className="flex items-center gap-2 text-xs text-card-foreground">
              <span className="w-6 h-0.5 bg-string-cause" /> Αιτία
            </div>
            <div className="flex items-center gap-2 text-xs text-card-foreground">
              <span className="w-6 h-0.5 bg-string-occasion" /> Αφορμή
            </div>
            <div className="flex items-center gap-2 text-xs text-card-foreground">
              <span className="w-6 h-0.5 bg-string-consequence" /> Συνέπεια
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
