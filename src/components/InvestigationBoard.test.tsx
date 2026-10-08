import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InvestigationBoard from './InvestigationBoard';

beforeEach(() => {
  cleanup(); sessionStorage.clear(); localStorage.clear();
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});
function mount() { return render(<MemoryRouter><InvestigationBoard /></MemoryRouter>); }
describe('lesson interactions', () => {
  it('starts unsolved and keeps a student-created connection after arranging', () => {
    const {container}=mount();
    expect(container.querySelectorAll('[data-card-id]')).toHaveLength(12);
    expect(screen.getByRole('heading',{name:/Παλαιά Διαθήκη · Σκιά/})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:/Καινή Διαθήκη · Πλήρωση/})).toBeInTheDocument();
    expect(container.querySelectorAll('.connection-string')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button',{name:'Σύνδεση: Πλάκες του Νόμου'}));
    fireEvent.click(screen.getByRole('button',{name:'Σύνδεση: Νόμος στις ανθρώπινες καρδιές'}));
    fireEvent.click(screen.getByRole('button',{name:/Αιτία/}));
    expect(container.querySelectorAll('.connection-string')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button',{name:'Τακτοποίηση'}));
    expect(container.querySelectorAll('.connection-string')).toHaveLength(1);
    expect(container.querySelectorAll('[data-card-id]')).toHaveLength(12);
  });
  it('preserves an explicitly loaded library activity', () => {
    sessionStorage.setItem('board:library-dataset',JSON.stringify({data:{topic:'Άλλο μάθημα',clues:[{id:'other',title:'Ένα στοιχείο',description:'Δικό του περιεχόμενο',type:'evidence',x:73,y:81}],connections:[]}}));
    const {container}=mount();
    expect(screen.getByRole('heading',{name:/Άλλο μάθημα/})).toBeInTheDocument();
    expect(container.querySelectorAll('[data-card-id]')).toHaveLength(1);
    expect(container.querySelector('[data-card-id]')).toHaveStyle({left:'73px',top:'81px'});
  });
  it('saves category and instruction metadata with the active preview/source', () => {
    vi.spyOn(window,'prompt').mockReturnValue('Νέο όνομα');
    mount();fireEvent.click(screen.getByRole('button',{name:'Αποθήκευση'}));
    const saved=JSON.parse(localStorage.getItem('board:library-saved')!)[0].data;
    expect(saved.topic).toBe('Νέο όνομα');
    expect(saved.clues).toHaveLength(12);
    expect(saved.clues.every((card:{group?:string})=>card.group)).toBe(true);
    expect(saved.instruction).toMatch(/Αιτιολογήστε|αιτιολογήστε/);
    expect(saved.connections).toEqual([]);
    expect(saved.matchingPuzzle.answers).toHaveLength(6);
  });
});
