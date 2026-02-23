import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConnectionType } from '@/types/board';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: ConnectionType) => void;
}

const options: { type: ConnectionType; label: string; color: string; icon: string }[] = [
  { type: 'agreement', label: 'Συμφωνία', color: 'bg-string-agreement', icon: '✓' },
  { type: 'evolution', label: 'Εξέλιξη', color: 'bg-string-evolution', icon: '→' },
  { type: 'disagreement', label: 'Αντίθεση', color: 'bg-string-disagreement', icon: '✗' },
];

export default function ConnectionDialog({ open, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-popover border-border text-popover-foreground max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-foreground">Τύπος Σύνδεσης</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <Button
              key={opt.type}
              variant="outline"
              className="justify-start gap-3 text-foreground"
              onClick={() => { onSelect(opt.type); onClose(); }}
            >
              <span className={`w-4 h-4 rounded-full ${opt.color}`} />
              <span className="text-lg">{opt.icon}</span>
              <span>{opt.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
