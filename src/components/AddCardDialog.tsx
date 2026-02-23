import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BoardCard } from '@/types/board';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (card: Omit<BoardCard, 'id' | 'x' | 'y' | 'rotation'>) => void;
}

export default function AddCardDialog({ open, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BoardCard['type']>('suspect');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title, description, type, imageUrl: imageUrl || undefined });
    setTitle('');
    setDescription('');
    setType('suspect');
    setImageUrl('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-popover border-border text-popover-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Νέο Στοιχείο</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Τύπος</label>
            <div className="flex gap-2 mt-1">
              {(['suspect', 'evidence', 'note'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide transition-colors
                    ${type === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                >
                  {t === 'suspect' ? 'Ύποπτος' : t === 'evidence' ? 'Πειστήριο' : 'Σημείωση'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Τίτλος</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="π.χ. Πλάτων" className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Περιγραφή</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Περιγραφή..." className="mt-1" rows={2} />
          </div>
          {type !== 'note' && (
            <div>
              <label className="text-sm text-muted-foreground">URL Εικόνας (προαιρετικό)</label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Ακύρωση</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>Προσθήκη</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
