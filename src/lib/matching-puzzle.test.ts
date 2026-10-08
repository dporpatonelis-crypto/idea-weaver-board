import { describe, expect, it } from 'vitest';
import { BoardCard } from '@/types/board';
import lessonData from '@/data/clues.json';
import { buildMatchingLesson, checkMatching, placeItem, shuffle, matchingImageUrl } from './matching-puzzle';
const cards = lessonData.clues.map(clue => ({...clue,x:0,y:0,rotation:0})) as BoardCard[];

describe('meaning matching data', () => {
  it('builds objects and meaning slots from explicit groups and validates the teacher key', () => {
    const lesson = buildMatchingLesson(cards,lessonData.matchingPuzzle)!;
    expect(lesson.items).toHaveLength(6);expect(lesson.slots).toHaveLength(6);
    const placements=Object.fromEntries(lessonData.matchingPuzzle.answers.map(pair=>[pair.slotId,pair.itemId]));
    expect(checkMatching(lesson,placements)).toEqual({filled:6,correct:6,complete:true});
    const reordered=buildMatchingLesson([...cards].reverse(),lessonData.matchingPuzzle)!;
    expect(checkMatching(reordered,placements).correct).toBe(6);
  });
  it('never infers correct answers from positions, numbering, or incomplete keys', () => {
    const lesson=buildMatchingLesson(cards)!;
    expect(lesson.answers).toBeNull();
    expect(buildMatchingLesson(cards,{...lessonData.matchingPuzzle,answers:lessonData.matchingPuzzle.answers.slice(0,1)})!.answers).toBeNull();
    expect(buildMatchingLesson(cards,{...lessonData.matchingPuzzle,answers:lessonData.matchingPuzzle.answers.map(pair=>({...pair,slotId:'missing'}))})!.answers).toBeNull();
    expect(buildMatchingLesson(cards.map(card=>({...card,group:undefined})))).toBeNull();
    expect(buildMatchingLesson([...cards,cards[0]])).toBeNull();
  });
  it('distinguishes incomplete attempts from valid and incorrect matching', () => {
    const lesson=buildMatchingLesson(cards,lessonData.matchingPuzzle)!;
    expect(checkMatching(lesson,{})).toEqual({filled:0,correct:0,complete:false});
    expect(checkMatching(lesson,{'typology-evidence-2':'typology-evidence-3'}).correct).toBe(0);
  });
});
describe('move, swap, and return', () => {
  it('returns a displaced pool card without losing or duplicating items', () => {
    expect(placeItem({s1:'a',s2:'b'},'c','s1')).toEqual({s1:'c',s2:'b'});
    expect(placeItem({s1:'a',s2:'b'},'a','s2')).toEqual({s1:'b',s2:'a'});
    expect(placeItem({s1:'a',s2:'b'},'a',null)).toEqual({s2:'b'});
    expect(placeItem({s1:'a'},'a','s1')).toEqual({s1:'a'});
  });
  it('shuffles a copy with all items retained', () => {
    const original=['a','b','c'];
    expect(shuffle(original,()=>0)).not.toEqual(original);
    expect(original).toEqual(['a','b','c']);
    expect(shuffle(original).sort()).toEqual(original);
  });
});

describe('existing object media', () => {
  it('uses all six library illustrations and gives explicit lesson media precedence', () => {
    const objects=cards.filter(card=>card.group===lessonData.matchingPuzzle.itemGroup);
    expect(objects.every(card=>matchingImageUrl(card)?.endsWith('.webp'))).toBe(true);
    expect(new Set(objects.map(matchingImageUrl)).size).toBe(6);
    expect(matchingImageUrl({...objects[0],title:'ΠΛΑΚΕΣ ΤΟΥ ΝΟΜΟΥ'})).toBe(matchingImageUrl(objects[0]));
    expect(matchingImageUrl({...objects[0],imageUrl:'https://example.org/custom.png'})).toBe('https://example.org/custom.png');
    expect(matchingImageUrl({...objects[0],title:'Άλλο αντικείμενο'})).toBeUndefined();
  });
});
