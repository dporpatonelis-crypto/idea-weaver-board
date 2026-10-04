import { BoardCard } from '@/types/board';

export function cardWidth(card: BoardCard): number {
  return card.width ?? (card.type === 'note' ? 160 : 180);
}

export interface BoardGroup {
  title: string;
  x: number;
  width: number;
  count: number;
}

export function arrangeCards(cards: BoardCard[], viewportWidth: number) {
  const groups = [...new Set(cards.map(card => card.group).filter(Boolean))];
  if (groups.length !== 2 || cards.some(card => !card.group)) {
    const columns = Math.max(2, Math.floor((viewportWidth - 80) / 240));
    return {
      cards: cards.map((card, index) => ({ ...card, x: 40 + (index % columns) * 240,
        y: 40 + Math.floor(index / columns) * 340, rotation: 0 })),
      groups: [] as BoardGroup[],
      width: Math.max(viewportWidth, columns * 240 + 40),
    };
  }

  const width = Math.max(600, viewportWidth);
  const bankWidth = (width - 64 - 64) / 2;
  const columns = bankWidth >= 424 ? 2 : 1;
  const rowHeight = Math.max(180, ...cards.map(card => {
    // Reserve room for wrapped titles/descriptions and optional images.
    const titleLines = Math.ceil(card.title.length / 19);
    const bodyLines = card.description.split('\n').reduce((n, line) => n + Math.ceil(line.length / 23), 0);
    return 60 + titleLines * 22 + Math.min(200, bodyLines * 18) + (card.imageUrl ? 90 : 0) + 24;
  }));
  const arranged: BoardCard[] = [];
  const headers = groups.map((title, groupIndex) => {
    const members = cards.filter(card => card.group === title);
    const x = 32 + groupIndex * (bankWidth + 64);
    const inset = (bankWidth - (columns * 200 + (columns - 1) * 24)) / 2;
    members.forEach((card, index) => arranged.push({ ...card, width: 200, rotation: 0,
      x: x + inset + (index % columns) * 224,
      y: 88 + Math.floor(index / columns) * rowHeight }));
    return { title, x, width: bankWidth, count: members.length };
  });
  return { cards: arranged, groups: headers, width };
}

/** Recover the explicit evidence-wall family from older text-block syncs.
 * Do not filter unrelated lesson/library datasets. */
export function normalizeSlideDataset<T extends { topic?: string; clues?: Record<string, unknown>[] }>(source: T): T {
  const clues = source?.clues;
  if (!Array.isArray(clues)) return source;
  const heading = clues.find(clue => /^ΤΟΙΧΟΣ ΕΡΕΥΝΑΣ\s*[—–]/iu.test(String(clue.title ?? '')));
  const evidence = clues.filter(clue => /^ΤΕΚΜΗΡΙΟ\s+\d+$/iu.test(String(clue.title ?? '').trim()));
  if (!heading || !evidence.length) return source;
  const question = clues.find(clue => /^Ερώτημα:/iu.test(String(clue.title ?? '')));
  const cleaned = clues.flatMap((clue, index) => {
    if (!/^ΤΕΚΜΗΡΙΟ\s+\d+$/iu.test(String(clue.title ?? '').trim())) return [];
    const text = String(clue.description ?? '').trim();
    const split = text.search(/[\n,]/u);
    if (split < 1 || !text.slice(split + 1).trim()) return [];
    return [{ ...clue, id: clue.id ?? `clue-${index + 1}`,
      title: text.slice(0, split).trim(), description: text.slice(split + 1).trim() }];
  });
  if (cleaned.length !== evidence.length) return source;
  return { ...source, topic: String(heading.title).replace(/^ΤΟΙΧΟΣ ΕΡΕΥΝΑΣ\s*[—–]\s*/iu, ''),
    instruction: question ? String(question.title).replace(/^Ερώτημα:\s*/iu, '') : undefined,
    clues: cleaned, connections: [] } as T;
}
