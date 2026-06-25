import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, RefreshCw, FileJson, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DatasetEntry {
  id: string;
  name: string;
  description?: string;
  file: string;
  data: any;
  source: 'bundled' | 'saved';
}

const LIBRARY_STORAGE_KEY = 'board:library-dataset';
const SAVED_LIBRARY_KEY = 'board:library-saved';

// Auto-discover JSON files dropped in src/data/library/ — no index needed.
const bundledModules = import.meta.glob('@/data/library/*.json', { eager: true }) as Record<string, any>;

function readSaved(): DatasetEntry[] {
  try {
    const raw = localStorage.getItem(SAVED_LIBRARY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function Library() {
  const navigate = useNavigate();
  const [savedEntries, setSavedEntries] = useState<DatasetEntry[]>([]);

  useEffect(() => { setSavedEntries(readSaved()); }, []);

  const bundledEntries: DatasetEntry[] = useMemo(() => {
    return Object.entries(bundledModules).map(([path, mod]) => {
      const file = path.split('/').pop() || path;
      const data = (mod as any).default ?? mod;
      const name = data?.topic || file.replace(/\.json$/, '');
      return {
        id: `bundled:${file}`,
        name,
        description: data?.clues?.length ? `${data.clues.length} στοιχεία` : undefined,
        file,
        data,
        source: 'bundled' as const,
      };
    }).sort((a, b) => a.name.localeCompare(b.name, 'el'));
  }, []);

  const allEntries = [...savedEntries, ...bundledEntries];

  const handleLoad = (entry: DatasetEntry) => {
    sessionStorage.setItem(
      LIBRARY_STORAGE_KEY,
      JSON.stringify({ entry: { id: entry.id, name: entry.name, file: entry.file }, data: entry.data, loadedAt: Date.now() })
    );
    toast.success(`Φορτώθηκε: ${entry.name}`);
    navigate('/');
  };

  const handleDownload = (entry: DatasetEntry) => {
    const blob = new Blob([JSON.stringify(entry.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.file;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSaved = (id: string) => {
    const next = savedEntries.filter(e => e.id !== id);
    localStorage.setItem(SAVED_LIBRARY_KEY, JSON.stringify(next));
    setSavedEntries(next);
    toast.success('Διαγράφηκε');
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
        <div className="grid gap-3">
          {allEntries.length === 0 && (
            <p className="text-muted-foreground text-center py-12">
              Η βιβλιοθήκη είναι άδεια. Πρόσθεσε JSON αρχεία στο{' '}
              <code>src/data/library/</code> ή αποθήκευσε ένα live μάθημα από τον πίνακα.
            </p>
          )}
          {allEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-2 p-4 rounded-md border border-border bg-card/5 hover:bg-card/10 hover:border-accent transition-colors group"
            >
              <button onClick={() => handleLoad(entry)} className="flex items-start gap-3 flex-1 text-left min-w-0">
                <FileJson className="text-accent shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={20} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-foreground font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {entry.name}
                    </h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      entry.source === 'saved'
                        ? 'bg-string-agreement/20 text-string-agreement'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {entry.source === 'saved' ? 'Αποθηκευμένο' : 'Bundled'}
                    </span>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{entry.description}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">{entry.file}</p>
                </div>
              </button>
              <div className="flex flex-col gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => handleDownload(entry)} title="Λήψη JSON" className="h-8 w-8 p-0">
                  <Download size={14} />
                </Button>
                {entry.source === 'saved' && (
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteSaved(entry.id)} title="Διαγραφή" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-10 p-4 rounded-md border border-border/50 bg-secondary/30">
          <h4 className="text-sm font-bold text-foreground mb-2">📂 Πώς να προσθέσεις αρχεία</h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li><b>Μόνιμα:</b> ρίξε ένα <code>.json</code> αρχείο στο <code>src/data/library/</code> — εμφανίζεται αυτόματα χωρίς index</li>
            <li><b>Από live μάθημα:</b> στον πίνακα πάτα «💾 Αποθήκευση στη Βιβλιοθήκη» για να σώσεις το τρέχον μάθημα στον browser</li>
            <li>Με το κουμπί <Download size={10} className="inline" /> μπορείς να κατεβάσεις οποιοδήποτε αρχείο και να το βάλεις στον φάκελο για μόνιμη αρχειοθέτηση</li>
          </ol>
        </div>
      </div>
    </div>
  );
}