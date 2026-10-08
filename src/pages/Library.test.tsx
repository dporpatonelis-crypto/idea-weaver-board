import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Library from './Library';
import InvestigationBoard from '@/components/InvestigationBoard';
import permanentLesson from '@/data/library/typology-shadow-fulfillment-puzzle.json';

// A future slide sync replaces the active dataset, leaving library files intact.
vi.mock('@/data/clues.json', () => ({ default: {
  topic: 'Επόμενο συγχρονισμένο μάθημα',
  clues: [{ id: 'next', title: 'Νέο στοιχείο', description: 'Άλλο υλικό', type: 'evidence' }],
  connections: [],
} }));

beforeEach(() => {
  cleanup(); sessionStorage.clear(); localStorage.clear();
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

describe('permanent puzzle after another slide sync', () => {
  it('loads the archived lesson with images, hidden answers and grading, then returns to the new sync', () => {
    const { container } = render(<MemoryRouter initialEntries={['/library']}><Routes>
      <Route path="/library" element={<Library />} />
      <Route path="/" element={<InvestigationBoard />} />
    </Routes></MemoryRouter>);
    const entry = screen.getByRole('button', { name: new RegExp(permanentLesson.topic) });
    expect(entry).toHaveTextContent('Μόνιμο');
    fireEvent.click(entry);
    expect(container.querySelectorAll('[data-card-id]')).toHaveLength(12);
    expect(container.querySelectorAll('.connection-string')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Puzzle' }));
    expect(screen.getByText('0 / 6 τοποθετημένα')).toBeInTheDocument();
    expect(screen.queryByText('✓ Σωστή αντιστοίχιση')).not.toBeInTheDocument();
    const images = document.querySelectorAll('[data-puzzle-item] img');
    expect(images).toHaveLength(6);
    expect([...images].every(image => image.getAttribute('src')?.includes('images/typology/'))).toBe(true);
    for (const pair of permanentLesson.matchingPuzzle.answers) {
      const item = permanentLesson.clues.find(clue => clue.id === pair.itemId)!;
      const slot = permanentLesson.clues.find(clue => clue.id === pair.slotId)!;
      fireEvent.click(screen.getByRole('button', { name: `Επιλογή αντικειμένου: ${item.title}` }));
      fireEvent.click(screen.getByRole('button', { name: `Τοποθέτηση στην υποδοχή: ${slot.title}` }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Έλεγχος αντιστοίχισης' }));
    expect(screen.getByText(/Όλες οι αντιστοιχίσεις είναι σωστές/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'Βιβλιοθήκη' }));
    fireEvent.click(screen.getByRole('button', { name: 'Επαναφορά' }));
    expect(screen.getByRole('heading', { name: /Επόμενο συγχρονισμένο μάθημα/ })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-card-id]')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Puzzle' })).not.toBeInTheDocument();
  });
});
