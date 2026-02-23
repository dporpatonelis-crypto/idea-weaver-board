import { Connection, ConnectionType, BoardCard } from '@/types/board';

interface Props {
  connections: Connection[];
  cards: BoardCard[];
  onDeleteConnection: (id: string) => void;
}

const typeColors: Record<ConnectionType, string> = {
  agreement: 'hsl(120, 50%, 35%)',
  evolution: 'hsl(45, 80%, 50%)',
  disagreement: 'hsl(0, 70%, 45%)',
};

const typeLabels: Record<ConnectionType, string> = {
  agreement: 'Συμφωνία',
  evolution: 'Εξέλιξη',
  disagreement: 'Αντίθεση',
};

function getCardCenter(card: BoardCard): { x: number; y: number } {
  const width = card.type === 'note' ? 160 : 180;
  return { x: card.x + width / 2, y: card.y + 50 };
}

export default function ConnectionLines({ connections, cards, onDeleteConnection }: Props) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-5" style={{ zIndex: 5 }}>
      <defs>
        <filter id="string-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
        </filter>
      </defs>
      {connections.map((conn) => {
        const fromCard = cards.find(c => c.id === conn.fromId);
        const toCard = cards.find(c => c.id === conn.toId);
        if (!fromCard || !toCard) return null;

        const from = getCardCenter(fromCard);
        const to = getCardCenter(toCard);
        const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
        const color = typeColors[conn.type];

        // Slight curve
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const cx = mid.x - dy * 0.1;
        const cy = mid.y + dx * 0.1;

        return (
          <g key={conn.id} className="connection-string">
            {/* String line */}
            <path
              d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
              stroke={color}
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="8,4"
              filter="url(#string-shadow)"
              opacity="0.85"
            />
            {/* Label */}
            <g
              transform={`translate(${mid.x}, ${mid.y})`}
              className="pointer-events-auto cursor-pointer"
              onClick={() => onDeleteConnection(conn.id)}
            >
              <rect
                x="-35" y="-10" width="70" height="20" rx="3"
                fill="hsl(30, 25%, 18%)"
                fillOpacity="0.85"
                stroke={color}
                strokeWidth="1"
              />
              <text
                textAnchor="middle"
                dy="4"
                fontSize="9"
                fill={color}
                fontFamily="'Playfair Display', serif"
                fontWeight="600"
              >
                {typeLabels[conn.type]}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
