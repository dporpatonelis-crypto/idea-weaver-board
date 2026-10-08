import { BoardCard } from '@/types/board';
import matchingMedia from '@/data/matching-media.json';

export interface MatchingPuzzleConfig {
  itemGroup?: string;
  slotGroup?: string;
  answers?: { itemId: string; slotId: string }[];
}
export interface MatchingLesson {
  items: BoardCard[];
  slots: BoardCard[];
  itemGroup: string;
  slotGroup: string;
  answers: Record<string, string> | null;
}
export type Placements = Record<string, string>;

/** Category metadata defines the two roles; array order never defines answers. */
export function buildMatchingLesson(cards: BoardCard[], config?: MatchingPuzzleConfig): MatchingLesson | null {
  const grouped = cards.filter(card => card.group && card.type !== 'note');
  const groups = [...new Set(grouped.map(card => card.group!))];
  if (groups.length !== 2 || new Set(grouped.map(card => card.id)).size !== grouped.length) return null;
  const itemGroup = config?.itemGroup ?? groups[0];
  const slotGroup = config?.slotGroup ?? groups.find(group => group !== itemGroup);
  if (!groups.includes(itemGroup) || !slotGroup || !groups.includes(slotGroup) || itemGroup === slotGroup) return null;
  const items = grouped.filter(card => card.group === itemGroup);
  const slots = grouped.filter(card => card.group === slotGroup);
  if (!items.length || !slots.length || items.length > slots.length) return null;
  const pairs = config?.answers;
  const valid = Array.isArray(pairs) && pairs.length === items.length &&
    new Set(pairs.map(pair => pair.itemId)).size === items.length &&
    new Set(pairs.map(pair => pair.slotId)).size === pairs.length &&
    pairs.every(pair => items.some(card => card.id === pair.itemId) && slots.some(card => card.id === pair.slotId));
  return { items, slots, itemGroup, slotGroup,
    answers: valid ? Object.fromEntries(pairs.map(pair => [pair.slotId, pair.itemId])) : null };
}

/** A pool replacement returns the displaced card; moving between slots swaps. */
export function placeItem(placements: Placements, itemId: string, slotId: string | null): Placements {
  const next = { ...placements };
  const from = Object.keys(next).find(key => next[key] === itemId);
  if (from === slotId) return next;
  if (from) delete next[from];
  if (slotId) {
    const displaced = next[slotId];
    if (displaced && from) next[from] = displaced;
    next[slotId] = itemId;
  }
  return next;
}

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

export function checkMatching(lesson: MatchingLesson, placements: Placements) {
  const filled = lesson.slots.filter(slot => lesson.items.some(item => item.id === placements[slot.id])).length;
  const correct = lesson.answers ? lesson.slots.filter(slot =>
    placements[slot.id] && lesson.answers![slot.id] === placements[slot.id]).length : null;
  return { filled, correct, complete: filled === lesson.items.length };
}

/** Use supplied card media first, then the existing object illustrations by title. */
export function matchingImageUrl(card: BoardCard): string | undefined {
  if (card.imageUrl) return card.imageUrl;
  const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('el').replace(/\s+/g, ' ').trim();
  const match = matchingMedia.find(media => media.titles.some(title => normalize(title) === normalize(card.title)));
  return match ? `${import.meta.env.BASE_URL}${match.path}` : undefined;
}
