import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, RefreshCw, FileJson } from 'lucide-react';
import { toast } from 'sonner';

interface DatasetEntry {
  id: string;
  name: string;
  description?: string;
  file: string;
}

interface Manifest {
  datasets: DatasetEntry[];
}

const LIBRARY_STORAGE_KEY = 'board:library-dataset';

export default function Library() {
  const navigate = useNavigate();
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadManifest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/data/index.json?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Manifest;
      setManifest(data);
    } catch (e: any) {
      setError(e?.message || 'Σφάλμα φόρτωσης');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManifest();
  }, []);

  const handleLoad = async (entry: DatasetEntry) => {
    try {
      const res = await fetch(`/data/${entry.file}?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      sessionStorage.setItem(
        LIBRARY_STORAGE_KEY,
        JSON.stringify({ entry, data, loadedAt: Date.now() })
      );
      toast.success(`Φορτώθηκε: ${entry.name}`);
      navigate('/');
    } catch (e: any) {
      toast.error(`Αποτυχία φόρτωσης: ${e?.message || 'σφάλμα'}`);
    }
  };

  const handleRestoreSync = () => {
    sessionStorage.removeItem(LIBRARY_STORAGE_KEY);
    toast.success('Επαναφορά στον συγχρονισμό slides');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="text-accent" size={28} />
            <div>
              <h1
                className="text-3xl font-bold text-foreground tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Βιβλιοθήκη Υποθέσεων
              </h1>
              <p className="text-sm text-muted-foreground italic">
                Επιλέξτε ένα αρχείο για να φορτωθεί στον πίνακα
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft size={16} />
            Πίσω
          </Button>
        </div>

        {/* Sync info banner */}
        <div className="mb-6 p-4 rounded-md border border-border bg-secondary/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-foreground font-semibold mb-1">
                🔄 Συγχρονισμός Google Slides
              </p>
              <p className="text-xs text-muted-foreground">
                Ο πίνακας από προεπιλογή φορτώνει τα δεδομένα του τρέχοντος μαθήματος
                από το αρχείο συγχρονισμού (<code>src/data/clues.json</code>). Η βιβλιοθήκη
                είναι ξεχωριστή και δεν επηρεάζει τον συγχρονισμό.
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={handleRestoreSync} className="gap-1.5 shrink-0">
              <RefreshCw size={14} />
              Επαναφορά
            </Button>
          </div>
        </div>

        {/* List */}
        {loading && (
          <p className="text-muted-foreground text-center py-12">Φόρτωση...</p>
        )}

        {error && (
          <div className="p-4 rounded border border-destructive/40 bg-destructive/10 text-destructive text-sm">
            Σφάλμα: {error}
          </div>
        )}

        {manifest && !loading && (
          <div className="grid gap-3">
            {manifest.datasets.length === 0 && (
              <p className="text-muted-foreground text-center py-12">
                Η βιβλιοθήκη είναι άδεια. Πρόσθεσε JSON αρχεία στο{' '}
                <code>public/data/</code> και ενημέρωσε το{' '}
                <code>public/data/index.json</code>.
              </p>
            )}
            {manifest.datasets.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleLoad(entry)}
                className="text-left p-4 rounded-md border border-border bg-card/5 hover:bg-card/10 hover:border-accent transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <FileJson className="text-accent shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={20} />
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-foreground font-semibold mb-0.5"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {entry.name}
                    </h3>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                      {entry.file}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-10 p-4 rounded-md border border-border/50 bg-secondary/30">
          <h4 className="text-sm font-bold text-foreground mb-2">📂 Πώς να προσθέσεις αρχεία</h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Δημιούργησε ένα <code>.json</code> αρχείο στο <code>public/data/</code></li>
            <li>Πρόσθεσέ το στο <code>public/data/index.json</code> ως νέο entry</li>
            <li>Push στο GitHub — εμφανίζεται αυτόματα εδώ</li>
          </ol>
        </div>
      </div>
    </div>
  );
}