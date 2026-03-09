import { Copy, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface OtpDisplayProps {
  code: string;
  onCopy?: () => void;
}

export function OtpDisplay({ code, onCopy }: OtpDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-6 mb-6"
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-900">Code OTP reçu par SMS</p>
            <p className="text-xs text-emerald-700 mt-1">Valide pendant 10 minutes</p>
          </div>
          <button
            onClick={() => setVisible(!visible)}
            className="p-2 hover:bg-emerald-200 rounded-full transition"
            title={visible ? "Masquer" : "Afficher"}
          >
            {visible ? (
              <Eye className="w-5 h-5 text-emerald-700" />
            ) : (
              <EyeOff className="w-5 h-5 text-emerald-700" />
            )}
          </button>
        </div>

        {/* Code Display */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {visible ? (
              <div className="flex gap-2">
                {code.split('').map((digit, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-1 min-h-14 bg-white rounded-lg flex items-center justify-center border-2 border-emerald-300 shadow-sm"
                  >
                    <span className="text-2xl font-bold text-emerald-600">{digit}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-14 bg-white rounded-lg flex items-center justify-center border-2 border-emerald-300">
                <span className="text-2xl tracking-widest text-emerald-300">••••••</span>
              </div>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition font-medium text-sm whitespace-nowrap"
            title="Copier le code"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? 'Copié!' : 'Copier'}</span>
          </button>
        </div>

        {/* Info */}
        <div className="text-xs text-emerald-700 bg-emerald-100 rounded-lg p-3">
          <p>💡 Le code peut prendre jusqu'à 2 minutes pour arriver. Consulstez vos SMS.</p>
        </div>
      </div>
    </motion.div>
  );
}
