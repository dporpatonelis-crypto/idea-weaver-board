import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import MatchingPuzzleDialog from './MatchingPuzzleDialog';
import { buildMatchingLesson } from '@/lib/matching-puzzle';
import { BoardCard } from '@/types/board';
import data from '@/data/clues.json';
const cards=data.clues.map(clue=>({...clue,x:0,y:0,rotation:0})) as BoardCard[];
const lesson=buildMatchingLesson(cards,data.matchingPuzzle)!;
beforeEach(()=>cleanup());
function mount() { return render(<MatchingPuzzleDialog open onClose={vi.fn()} lesson={lesson} topic={data.topic} />); }
function place(itemTitle:string,slotTitle:string) {
  fireEvent.click(screen.getByRole('button',{name:`Επιλογή αντικειμένου: ${itemTitle}`}));
  fireEvent.click(screen.getByRole('button',{name:`Τοποθέτηση στην υποδοχή: ${slotTitle}`}));
}
describe('matching activity', () => {
  it('starts empty, conceals feedback, and supports click/tap placement and return', () => {
    mount();
    expect(document.querySelectorAll('[data-puzzle-item]')).toHaveLength(6);
    expect(screen.getAllByRole('button',{name:/Τοποθέτηση στην υποδοχή:/})).toHaveLength(6);
    expect(screen.queryByText('✓ Σωστή αντιστοίχιση')).not.toBeInTheDocument();
    place('Πλάκες του Νόμου','Νόμος στις ανθρώπινες καρδιές');
    expect(screen.getByText('1 / 6 τοποθετημένα')).toBeInTheDocument();
    expect(screen.queryByText('✓ Σωστή αντιστοίχιση')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Έλεγχος αντιστοίχισης'}));
    expect(screen.getByText('✓ Σωστή αντιστοίχιση')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Επιστροφή στα διαθέσιμα: Πλάκες του Νόμου'}));
    expect(screen.getByText('0 / 6 τοποθετημένα')).toBeInTheDocument();
    expect(screen.queryByText('✓ Σωστή αντιστοίχιση')).not.toBeInTheDocument();
  });
  it('checks by meaning and completes all six pairs independently of random order', () => {
    mount();
    for(const pair of data.matchingPuzzle.answers) {
      place(cards.find(c=>c.id===pair.itemId)!.title,cards.find(c=>c.id===pair.slotId)!.title);
    }
    fireEvent.click(screen.getByRole('button',{name:'Έλεγχος αντιστοίχισης'}));
    expect(screen.getByText(/Όλες οι αντιστοιχίσεις είναι σωστές/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Ανάμειξη & επαναφορά'}));
    expect(screen.getByText('0 / 6 τοποθετημένα')).toBeInTheDocument();
    expect(screen.getAllByRole('button',{name:/Τοποθέτηση στην υποδοχή:/})).toHaveLength(6);
  });
  it('allows replacement, swaps placed items, and clears outdated feedback after correction', () => {
    mount();
    place('Πλάκες του Νόμου','Θεία Ευχαριστία');
    fireEvent.click(screen.getByRole('button',{name:'Έλεγχος αντιστοίχισης'}));
    expect(screen.getByText('↔ Επανεξετάστε την αντιστοίχιση')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Επιλογή αντικειμένου: Στάμνα με το Μάννα'}));
    fireEvent.click(screen.getByRole('button',{name:'Αντικατάσταση στην υποδοχή: Θεία Ευχαριστία'}));
    expect(document.querySelector('[data-puzzle-drop="pool"] [data-puzzle-item="typology-evidence-1"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-puzzle-item]')).toHaveLength(6);
    expect(screen.queryByText('↔ Επανεξετάστε την αντιστοίχιση')).not.toBeInTheDocument();
    place('Πλάκες του Νόμου','Νόμος στις ανθρώπινες καρδιές');
    fireEvent.click(screen.getByRole('button',{name:'Επιλογή αντικειμένου: Πλάκες του Νόμου'}));
    fireEvent.click(screen.getByRole('button',{name:'Αντικατάσταση στην υποδοχή: Θεία Ευχαριστία'}));
    expect(document.querySelector('[data-puzzle-drop="typology-evidence-2"] [data-puzzle-item="typology-evidence-5"]')).toBeInTheDocument();
  });
  it('keeps an attempt on close/reopen and resets when the lesson changes', () => {
    const view=mount();place('Πλάκες του Νόμου','Νόμος στις ανθρώπινες καρδιές');
    view.rerender(<MatchingPuzzleDialog open={false} onClose={vi.fn()} lesson={lesson} topic={data.topic} />);
    view.rerender(<MatchingPuzzleDialog open onClose={vi.fn()} lesson={lesson} topic={data.topic} />);
    expect(screen.getByText('1 / 6 τοποθετημένα')).toBeInTheDocument();
    view.rerender(<MatchingPuzzleDialog open onClose={vi.fn()} lesson={{...lesson,items:lesson.items.slice(0,1),answers:null}} topic="Άλλο" />);
    expect(screen.getByText('0 / 1 τοποθετημένα')).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Έλεγχος τοποθετήσεων'})).toBeInTheDocument();
  });
});
