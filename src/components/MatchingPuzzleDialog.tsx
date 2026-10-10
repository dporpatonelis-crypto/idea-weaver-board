import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, GripVertical, RotateCcw, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BoardCard } from '@/types/board';
import { MatchingLesson, Placements, checkMatching, placeItem, shuffle, matchingImageUrl } from '@/lib/matching-puzzle';

interface Props { open: boolean; onClose: () => void; lesson: MatchingLesson; topic: string }
interface Drag { itemId: string; pointerId: number; startX: number; startY: number; moved: boolean }

export default function MatchingPuzzleDialog({ open, onClose, lesson, topic }: Props) {
  const [placements, setPlacements] = useState<Placements>({});
  const [order, setOrder] = useState<string[]>(() => shuffle(lesson.items.map(item => item.id)));
  const [slotOrder, setSlotOrder] = useState<string[]>(() => shuffle(lesson.slots.map(slot => slot.id)));
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [ghost, setGhost] = useState<{ itemId: string; x: number; y: number } | null>(null);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const point = useRef<{x:number;y:number} | null>(null);
  const isDragging = ghost !== null;

  // A changed lesson starts a fresh puzzle. Closing/reopening keeps this attempt.
  useEffect(() => {
    setPlacements({}); setSelected(null); setChecked(false); setAnnouncement('');
    setOrder(shuffle(lesson.items.map(item => item.id)));
    setSlotOrder(shuffle(lesson.slots.map(slot => slot.id)));
    drag.current = null; setGhost(null);
  }, [lesson]);
  useEffect(() => {
    if (!open) { drag.current = null; point.current = null; setGhost(null); }
  }, [open]);

  // Keep long touch drags usable near the edges of the scrolling modal.
  useEffect(() => {
    if (!isDragging) return;
    const timer = window.setInterval(() => {
      const container = contentRef.current;
      if (!container || !point.current) return;
      const {top, bottom} = container.getBoundingClientRect();
      const y = point.current.y;
      if (y < top + 72) container.scrollTop -= 14;
      else if (y > bottom - 72) container.scrollTop += 14;
    }, 40);
    return () => window.clearInterval(timer);
  }, [isDragging]);

  function move(itemId: string, slotId: string | null) {
    setPlacements(current => placeItem(current, itemId, slotId));
    setChecked(false); setSelected(null);
    const slot = lesson.slots.find(card => card.id === slotId);
    const item = lesson.items.find(card => card.id === itemId);
    setAnnouncement(slot ? `${item?.title}: τοποθετήθηκε στο «${slot.title}».` : `${item?.title}: επέστρεψε στα διαθέσιμα.`);
  }
  function startDrag(event: React.PointerEvent<HTMLButtonElement>, itemId: string) {
    if (event.button !== 0 || drag.current) return;
    drag.current = { itemId, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
    suppressClick.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function continueDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 7) current.moved = true;
    if (current.moved) {
      point.current = {x:event.clientX,y:event.clientY};
      setGhost({itemId:current.itemId,x:event.clientX,y:event.clientY});
    }
  }
  function finishDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (current.moved && event.type !== 'pointercancel') {
      // Pointer capture targets the source; hit-test the actual release location.
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-puzzle-drop]');
      if (target && contentRef.current?.contains(target)) {
        const slotId = target.dataset.puzzleDrop;
        move(current.itemId, slotId === 'pool' ? null : slotId!);
      }
      suppressClick.current = true;
    }
    drag.current = null; point.current = null; setGhost(null);
  }
  function itemButton(item: BoardCard) {
    const imageUrl = matchingImageUrl(item);
    return <button key={item.id} type="button" data-puzzle-item={item.id}
      aria-label={`Επιλογή αντικειμένου: ${item.title}`} aria-pressed={selected === item.id}
      className={`w-full rounded-lg border-2 p-3 text-left text-card-foreground bg-card shadow-sm select-none touch-none cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected === item.id ? 'border-accent ring-2 ring-accent' : 'border-border'}`}
      onPointerDown={event => startDrag(event, item.id)} onPointerMove={continueDrag}
      onPointerUp={finishDrag} onPointerCancel={finishDrag}
      onClick={event => {
        if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
        setSelected(current => current === item.id ? null : item.id);
        setAnnouncement(`Επιλέχθηκε: ${item.title}. Επιλέξτε υποδοχή.`);
      }}>
      {imageUrl && <img src={imageUrl} alt={item.title} draggable={false} className="w-full h-20 object-contain mb-2 pointer-events-none rounded bg-white/90" />}
      <span className="flex gap-2 items-start font-bold text-base"><GripVertical size={18} className="mt-0.5 shrink-0" />{item.title}</span>
      {item.description && <span className="block mt-2 text-sm leading-snug whitespace-pre-line">{item.description}</span>}
    </button>;
  }

  const result = checkMatching(lesson, placements);
  const occupied = new Set(Object.values(placements));
  const pool = order.map(id => lesson.items.find(item => item.id === id)).filter((item): item is BoardCard => Boolean(item) && !occupied.has(item.id));
  const selectedTitle = lesson.items.find(item => item.id === selected)?.title;
  const dragged = lesson.items.find(item => item.id === ghost?.itemId);
  return <Dialog open={open} onOpenChange={value => { if (!value) onClose(); }}>
    <DialogContent ref={contentRef} className="max-w-6xl w-[calc(100%-1rem)] max-h-[92dvh] overflow-y-auto p-4 sm:p-6 bg-background">
      <DialogHeader className="pr-6">
        <DialogTitle>Puzzle αντιστοίχισης</DialogTitle>
        <p className="text-sm text-muted-foreground">{topic}</p>
        <DialogDescription>Σύρετε κάθε αντικείμενο στην ερμηνεία που του ταιριάζει. Μπορείτε επίσης να αγγίξετε ένα αντικείμενο και έπειτα την υποδοχή.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">{result.filled} / {lesson.items.length} τοποθετημένα</span>
        <Button variant="outline" size="sm" onClick={() => {
          setPlacements({}); setSelected(null); setChecked(false); setGhost(null); drag.current = null;
          setOrder(shuffle(lesson.items.map(item => item.id))); setSlotOrder(shuffle(lesson.slots.map(slot => slot.id)));
          setAnnouncement('Νέα προσπάθεια. Όλα τα αντικείμενα επέστρεψαν στα διαθέσιμα.');
        }}><RotateCcw size={16} className="mr-2" />Ανάμειξη & επαναφορά</Button>
        <Button size="sm" onClick={() => setChecked(true)}><Check size={16} className="mr-2" />{lesson.answers ? 'Έλεγχος αντιστοίχισης' : 'Έλεγχος τοποθετήσεων'}</Button>
      </div>
      <div className="rounded border border-border bg-secondary p-2 text-sm" role="status" aria-live="polite">
        {selectedTitle ? `Επιλεγμένο: ${selectedTitle} — επιλέξτε υποδοχή.` : announcement || 'Οι υποδοχές ξεκινούν κενές. Βρείτε τις συνδέσεις με βάση το νόημα.'}
      </div>
      {checked && <p role="status" aria-live="polite" className="rounded bg-secondary p-3 font-semibold">
        {!result.complete ? `Τοποθετήθηκαν ${result.filled} από ${lesson.items.length}. Συμπληρώστε τις κενές θέσεις.` :
          result.correct === null ? 'Ολοκληρώθηκαν οι τοποθετήσεις. Συζητήστε και αιτιολογήστε τις αντιστοιχίσεις σας.' :
          result.correct === lesson.items.length ? 'Όλες οι αντιστοιχίσεις είναι σωστές! Αιτιολογήστε τις επιλογές σας.' :
          `${result.correct} από ${lesson.items.length} σωστές. Δοκιμάστε να αλλάξετε τις επισημασμένες τοποθετήσεις.`}
      </p>}
      <div className="grid gap-5 lg:grid-cols-[minmax(320px,1.1fr)_minmax(0,2fr)]">
        <section data-puzzle-drop="pool" className="rounded-xl border-2 border-dashed border-border bg-secondary/60 p-3">
          <div className="lg:sticky lg:top-0">
            <h2 className="font-bold mb-1">Διαθέσιμα αντικείμενα <span className="font-normal text-sm">· {pool.length}</span></h2>
            <p className="text-xs text-muted-foreground mb-3">{lesson.itemGroup}</p>
            <div className="grid grid-cols-2 gap-2">{pool.map(itemButton)}</div>
            {!pool.length && <p className="text-sm py-3">Όλα τα αντικείμενα έχουν τοποθετηθεί.</p>}
            {selected && occupied.has(selected) && <Button className="mt-3 w-full" size="sm" variant="outline" onClick={() => move(selected,null)}><Undo2 size={16} className="mr-2" />Επιστροφή στα διαθέσιμα</Button>}
          </div>
        </section>
        <section>
          <h2 className="font-bold mb-1">Υποδοχές ερμηνειών</h2>
          <p className="text-xs text-muted-foreground mb-3">{lesson.slotGroup}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {slotOrder.filter(id => lesson.slots.some(card => card.id === id)).map(id => {
              const slot = lesson.slots.find(card => card.id === id)!;
              const item = lesson.items.find(card => card.id === placements[slot.id]);
              const correct = checked && item && lesson.answers ? lesson.answers[slot.id] === item.id : null;
              return <div key={slot.id} data-puzzle-drop={slot.id} className={`rounded-xl border-2 p-3 flex flex-col gap-3 ${correct === true ? 'border-green-600 bg-green-500/10' : correct === false ? 'border-orange-600 bg-orange-500/10' : 'border-border bg-secondary/50'}`}>
                <div>
                  <h3 className="text-base font-bold">{slot.title}</h3>
                  <p className="text-sm mt-1 leading-snug whitespace-pre-line">{slot.description}</p>
                </div>
                {item ? <div className="mt-auto">{itemButton(item)}
                  <Button variant="ghost" size="sm" className="mt-1" aria-label={`Επιστροφή στα διαθέσιμα: ${item.title}`} onClick={() => move(item.id,null)}><Undo2 size={14} className="mr-2" />Επιστροφή</Button>
                </div> : <button type="button" className="mt-auto min-h-16 rounded-lg border-2 border-dashed border-border p-3 text-sm hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Τοποθέτηση στην υποδοχή: ${slot.title}`} onClick={() => { if (selected) move(selected, slot.id); else setAnnouncement('Επιλέξτε πρώτα ένα διαθέσιμο αντικείμενο.'); }}>Τοποθετήστε εδώ το αντικείμενο</button>}
                {item && selected && selected !== item.id && <Button variant="outline" size="sm" aria-label={`Αντικατάσταση στην υποδοχή: ${slot.title}`} onClick={() => move(selected,slot.id)}>Τοποθέτηση επιλεγμένου εδώ</Button>}
                {correct !== null && <p className="text-sm font-semibold">{correct ? '✓ Σωστή αντιστοίχιση' : '↔ Επανεξετάστε την αντιστοίχιση'}</p>}
              </div>;
            })}
          </div>
        </section>
      </div>
      {ghost && dragged && createPortal(<div aria-hidden="true" className="pointer-events-none fixed z-[80] max-w-60 rounded-lg bg-card text-card-foreground border-2 border-accent p-3 shadow-xl font-bold" style={{left:ghost.x,top:ghost.y,transform:'translate(-50%,-50%)'}}>{matchingImageUrl(dragged) && <img src={matchingImageUrl(dragged)} alt="" className="h-20 w-full object-contain mb-2" />} {dragged.title}</div>, document.body)}
    </DialogContent>
  </Dialog>;
}
