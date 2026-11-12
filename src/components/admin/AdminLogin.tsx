import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { loginAdmin } = useTournament();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleKeypadPress = (val: string) => {
    if (pin.length < 6) {
      const newPin = pin + val;
      setPin(newPin);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('দয়া করে পিন নম্বর প্রদান করুন');
      return;
    }
    const success = loginAdmin(pin);
    if (success) {
      onSuccess();
    } else {
      setError('ভুল পিন নম্বর! আবার চেষ্টা করুন (ডিফল্ট: 7254 / ৭২৫৪)');
    }
  };

  return (
    <div className="p-6 text-slate-100 max-w-sm mx-auto">
      <div className="text-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white mx-auto mb-3 shadow-lg border border-emerald-400/40">
          <KeyRound className="w-7 h-7 text-amber-300" />
        </div>
        <h3 className="text-lg font-bold text-white">অ্যাডমিন প্রবেশদ্বার</h3>
        <p className="text-xs text-slate-400 mt-1">
          টুর্নামেন্ট নিয়ন্ত্রণ প্যানেলে প্রবেশের জন্য পিন প্রদান করুন
        </p>
        <p className="text-[11px] text-amber-400 font-semibold mt-1 bg-amber-950/60 py-0.5 px-2.5 rounded-full inline-block border border-amber-600/30">
          ডিফল্ট পিন: 7254 / ৭২৫৪
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PIN Input Dots / Display */}
        <div className="flex items-center justify-center gap-3 my-3">
          {[0, 1, 2, 3].map((idx) => {
            const hasChar = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-11 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-display border-2 transition-all ${
                  hasChar
                    ? 'border-emerald-400 bg-emerald-950/80 text-amber-400 shadow-md scale-105'
                    : 'border-slate-700 bg-slate-900/60 text-slate-500'
                }`}
              >
                {hasChar ? '●' : ''}
              </div>
            );
          })}
        </div>

        {/* Direct Keyboard Input (Accepts English 7254 or Bengali ৭২৫৪) */}
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="কীবোর্ডে পিন লিখুন (যেমন: 7254 বা ৭২৫৪)"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError('');
          }}
          className="w-full min-h-[40px] bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 text-center text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs text-center justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric On-Screen Keypad for Mobile Comfort */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              type="button"
              key={digit}
              onClick={() => handleKeypadPress(digit)}
              className="min-h-[50px] rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-display font-bold text-lg active:scale-95 transition shadow-sm border border-slate-700/60"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="min-h-[50px] rounded-xl bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 font-medium text-xs active:scale-95 transition"
          >
            মুছুন
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="min-h-[50px] rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-display font-bold text-lg active:scale-95 transition shadow-sm border border-slate-700/60"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="min-h-[50px] rounded-xl bg-slate-800/40 hover:bg-slate-700/60 text-slate-300 font-medium text-xs active:scale-95 transition"
          >
            ⌫
          </button>
        </div>

        {/* Submit Action */}
        <div className="flex items-center gap-2 pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            বাতিল
          </button>
          <button
            type="submit"
            className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>প্রবেশ করুন</span>
          </button>
        </div>
      </form>
    </div>
  );
};
