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
          <h1 className="text-3xl md:text-4xl font-bold text-card-foreground text-center tracking-wide">
            📜 Συμπέρασμα Έρευνας
          </h1>
          <p className="text-sm text-card-foreground/70 text-center italic">
            Καταγράψτε τα τελικά συμπεράσματα της υπόθεσης
          </p>

          <Textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            rows={12}
            className="w-full bg-card-foreground/5 border-card-foreground/20 text-card-foreground placeholder:text-card-foreground/40 text-base leading-relaxed resize-y"
            placeholder="Γράψτε τα συμπεράσματά σας εδώ..."
          />

          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="gap-2 border-card-foreground/30 text-card-foreground hover:bg-card-foreground/10"
            >
              <ArrowLeft size={16} />
              Επιστροφή στον Πίνακα
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
