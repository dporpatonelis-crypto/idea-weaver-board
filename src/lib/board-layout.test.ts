import { describe, expect, it } from 'vitest';
import { arrangeCards, normalizeSlideDataset } from './board-layout';
import lesson from '@/data/clues.json';
import { BoardCard } from '@/types/board';

const cards = lesson.clues.map(clue => ({ ...clue, x: 0, y: 0, rotation: 0 })) as BoardCard[];

describe('student discovery board', () => {
  it('keeps twelve independent concepts and no initial answers', () => {
    expect(cards).toHaveLength(12);
    expect(new Set(cards.map(card => card.id)).size).toBe(12);
    expect(lesson.connections).toEqual([]);
    expect(cards.every(card => card.title && card.description && !/^ΤΕΚΜΗΡΙΟ/.test(card.title))).toBe(true);
    expect(cards.filter(card => card.group === cards[0].group)).toHaveLength(6);
  });
  it.each([1280, 1024, 768, 390])('separates categories without overlapping cards at width %i', width => {
    const layout = arrangeCards(cards, width);
    expect(layout.groups.map(group => group.count)).toEqual([6, 6]);
    expect(layout.cards.map(card => card.id)).toEqual(cards.map(card => card.id));
    for (const card of layout.cards) {
      const group = layout.groups.find(group => group.title === card.group)!;
      expect(card.x).toBeGreaterThanOrEqual(group.x);
      expect(card.x + card.width!).toBeLessThanOrEqual(group.x + group.width);
      expect(card.y).toBeGreaterThanOrEqual(88);
      for (const other of layout.cards.filter(other => other.id !== card.id)) {
        expect(card.x + card.width! <= other.x || other.x + other.width! <= card.x ||
          Math.abs(card.y - other.y) >= 180).toBe(true);
      }
    }
    expect(arrangeCards(layout.cards.map(card => ({ ...card, x: 1, y: 1 })), width).cards).toEqual(layout.cards);
  });
});

describe('legacy evidence-wall sync', () => {
  const raw = { topic: 'Template', clues: [
    {title:'ΤΟΙΧΟΣ ΕΡΕΥΝΑΣ — Μάθημα',description:''},
    {title:'ΤΕΚΜΗΡΙΟ 1',description:'Πλάκες του Νόμου, Λίθινες, άψυχες πλάκες'},
    {title:'ΤΕΚΜΗΡΙΟ 2',description:'Νόμος στις καρδιές\nΤο νόημα'},
    {title:'Ερώτημα: Αιτιολογήστε.',description:''},
    {title:'TEMPLATE 02',description:''},
  ] };
  it('recovers concept titles while excluding decorations and preserving body commas', () => {
    const result = normalizeSlideDataset(raw) as typeof raw & { connections:unknown[]; instruction:string };
    expect(result.topic).toBe('Μάθημα');
    expect(result.clues).toHaveLength(2);
    expect(result.clues[0].title).toBe('Πλάκες του Νόμου');
    expect(result.clues[0].description).toBe('Λίθινες, άψυχες πλάκες');
    expect(result.instruction).toBe('Αιτιολογήστε.');
    expect(result.connections).toEqual([]);
  });
  it('does not alter other library lessons or discard malformed evidence', () => {
    const other = {topic:'Άλλο μάθημα',clues:[{title:'TEMPLATE 02',description:'Πραγματικό υλικό'}]};
    expect(normalizeSlideDataset(other)).toBe(other);
    const incomplete = {...raw, clues:[...raw.clues,{title:'ΤΕΚΜΗΡΙΟ 3',description:''}]};
    expect(normalizeSlideDataset(incomplete)).toBe(incomplete);
  });
});
