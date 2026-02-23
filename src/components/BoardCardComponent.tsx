import { useRef, useCallback, useState } from 'react';
import { BoardCard } from '@/types/board';
import { X, GripVertical } from 'lucide-react';

interface Props {
  card: BoardCard;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onConnectionStart: (id: string) => void;
}

const pinColors = ['pin-red', 'pin-gold'];

export default function BoardCardComponent({
  card, isSelected, isConnecting, onSelect, onMove, onDelete, onConnectionStart,
}: Props) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    offset.current = { x: e.clientX - card.x, y: e.clientY - card.y };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      onMove(card.id, e.clientX - offset.current.x, e.clientY - offset.current.y);
    };
    const handleMouseUp = () => {
      dragging.current = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [card.id, card.x, card.y, onMove]);

  const pinColor = pinColors[card.id.charCodeAt(0) % 2];

  return (
    <div
      className={`absolute select-none transition-shadow duration-200 ${isDragging ? 'z-50 scale-105' : 'z-10'} ${isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-cork' : ''}`}
      style={{
        left: card.x,
        top: card.y,
        transform: `rotate(${card.rotation}deg)`,
        width: card.type === 'note' ? 160 : 180,
      }}
      onMouseDown={handleMouseDown}
      onClick={() => onSelect(card.id)}
    >
      {/* Pin */}
      <div className={`pin ${pinColor}`} />

      {/* Card body */}
      <div className={`aged-paper rounded-sm p-3 cursor-grab active:cursor-grabbing ${card.type === 'note' ? 'bg-yellow-100/90' : ''}`}
        style={card.type === 'note' ? {
          background: 'linear-gradient(135deg, hsl(50 80% 85%) 0%, hsl(48 70% 78%) 100%)',
        } : undefined}
      >
        {/* Delete button */}
        <button
          className="no-drag absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity text-xs z-20"
          style={{ opacity: isSelected ? 1 : undefined }}
          onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
        >
          <X size={10} />
        </button>

        {/* Connect handle */}
        <button
          className="no-drag absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform z-20"
          onClick={(e) => { e.stopPropagation(); onConnectionStart(card.id); }}
          title="Σύνδεση"
        >
          <GripVertical size={10} />
        </button>

        {/* Image */}
        {card.imageUrl && card.type !== 'note' && (
          <div className="mb-2 overflow-hidden rounded-sm border border-cork-dark/20">
            <img
              src={card.imageUrl}
              alt={card.title}
              className="w-full h-20 object-cover grayscale-[30%] sepia-[20%]"
              draggable={false}
            />
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-sm text-card-foreground leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          {card.title}
        </h3>

        {/* Description */}
        {card.description && (
          <p className="text-xs text-card-foreground/70 mt-1 leading-snug" style={{ fontFamily: "'Crimson Text', serif" }}>
            {card.description}
          </p>
        )}

        {/* Type badge */}
        <div className="mt-2 flex items-center gap-1">
          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-semibold
            ${card.type === 'suspect' ? 'bg-pin-red/20 text-pin-red' : ''}
            ${card.type === 'evidence' ? 'bg-accent/20 text-accent' : ''}
            ${card.type === 'note' ? 'bg-cork-dark/20 text-cork-dark' : ''}
          `}>
            {card.type === 'suspect' ? 'Ύποπτος' : card.type === 'evidence' ? 'Πειστήριο' : 'Σημείωση'}
          </span>
        </div>
      </div>
    </div>
  );
}
