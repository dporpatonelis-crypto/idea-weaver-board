import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import parchmentBg from '@/assets/parchment-bg.png';

export default function Conclusion() {
  const navigate = useNavigate();
  const [conclusion, setConclusion] = useState(
    'Μετά από προσεκτική εξέταση του πίνακα έρευνας, οι βασικές διαπιστώσεις είναι:\n\n' +
    '• Ο Σωκράτης επηρέασε βαθιά τον Πλάτωνα μέσω της μαιευτικής μεθόδου.\n' +
    '• Ο Πλάτων ανέπτυξε τη Θεωρία των Ιδεών και τη θεωρία της Ανάμνησης.\n' +
    '• Ο Αριστοτέλης, μαθητής του Πλάτωνα, διαφώνησε με την Προϋπαρξη της ψυχής.\n\n' +
    'Συμπέρασμα: Η φιλοσοφική σκέψη εξελίχθηκε μέσω διαλόγου, συμφωνίας και αντίθεσης.'
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Parchment container */}
      <div
        className="relative w-full max-w-3xl rounded-sm overflow-hidden"
        style={{
          backgroundImage: `url(${parchmentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 10px 40px hsl(0 0% 0% / 0.6), 0 2px 8px hsl(0 0% 0% / 0.4)',
        }}
      >
        <div className="p-10 md:p-14 space-y-6" style={{ backgroundColor: 'hsl(35 30% 78% / 0.3)' }}>
          {/* Quill icon header */}
          <div className="flex flex-col items-center gap-3">
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="opacity-70">
              <path d="M52 4C52 4 48 12 40 20C32 28 20 36 14 42C10 46 8 50 8 54C8 58 10 60 14 60C18 60 22 56 26 52C30 48 34 42 36 38L38 34C42 26 48 16 52 4Z" fill="hsl(20, 40%, 15%)" />
              <path d="M36 38L14 60" stroke="hsl(20, 40%, 15%)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8 54L6 62" stroke="hsl(20, 40%, 15%)" strokeWidth="2" strokeLinecap="round" />
              <path d="M52 4C52 4 56 6 58 10C54 14 48 22 42 28" stroke="hsl(35, 30%, 50%)" strokeWidth="1" />
            </svg>
            <h1
              className="text-3xl md:text-4xl text-card-foreground text-center tracking-wide"
              style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}
            >
              Συμπέρασμα Ερεύνης
            </h1>
            <div className="w-32 h-px bg-card-foreground/30" />
            <p
              className="text-sm text-card-foreground/60 text-center italic"
              style={{ fontFamily: "'MedievalSharp', cursive" }}
            >
              Καταγράψατε τα τελικά συμπεράσματα τῆς ὑποθέσεως
            </p>
          </div>

          <Textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            rows={12}
            className="w-full bg-transparent border-none text-card-foreground placeholder:text-card-foreground/40 text-base md:text-lg leading-loose resize-y font-bold focus-visible:ring-0 focus-visible:ring-offset-0 px-6 md:px-10"
            style={{
              fontFamily: "'MedievalSharp', cursive",
              color: 'hsl(220, 60%, 15%)',
              caretColor: 'hsl(220, 60%, 15%)',
            }}
            placeholder="Γράψτε τα συμπεράσματά σας εδώ..."
          />

          {/* Red wax seal */}
          <div className="flex justify-center pt-4">
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 90,
                height: 90,
              }}
            >
              {/* Outer wax blob */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 38% 35%, hsl(0, 55%, 48%), hsl(0, 60%, 30%) 70%, hsl(0, 50%, 20%))',
                  boxShadow:
                    '0 4px 12px hsl(0 0% 0% / 0.5), inset 0 2px 6px hsl(0 0% 100% / 0.15), inset 0 -3px 6px hsl(0 0% 0% / 0.3)',
                  borderRadius: '50% 48% 52% 50% / 50% 52% 48% 50%',
                }}
              />
              {/* Inner seal design */}
              <div
                className="relative z-10 flex items-center justify-center"
                style={{
                  width: 62,
                  height: 62,
                  border: '2px solid hsl(0, 40%, 40%)',
                  borderRadius: '50%',
                }}
              >
                <span
                  className="text-2xl font-bold select-none"
                  style={{
                    fontFamily: "'UnifrakturMaguntia', cursive",
                    color: 'hsl(0, 30%, 22%)',
                    textShadow: '0 1px 1px hsl(0 0% 100% / 0.1)',
                  }}
                >
                  ΣΕ
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="gap-2 border-card-foreground/30 text-card-foreground hover:bg-card-foreground/10"
              style={{ fontFamily: "'MedievalSharp', cursive" }}
            >
              <ArrowLeft size={16} />
              Ἐπιστροφὴ εἰς τὸν Πίνακα
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
