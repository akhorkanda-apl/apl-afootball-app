import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { loginAdminWithEmail, isAuthChecking } = useTournament();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('দয়া করে ইমেইল এবং পাসওয়ার্ড উভয়ই লিখুন।');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const result = await loginAdminWithEmail(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
    } else {
      setError(result.message);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="p-8 text-center text-slate-300 space-y-2">
        <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mx-auto" />
        <p className="text-xs font-semibold">অ্যাডমিন সেশন যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 text-slate-100 max-w-sm w-full mx-auto">
      <div className="text-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white mx-auto mb-3 shadow-lg border border-emerald-400/40">
          <ShieldCheck className="w-7 h-7 text-amber-300" />
        </div>
        <h3 className="text-lg font-bold text-white">অ্যাডমিন প্রবেশদ্বার</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          মূল মালিক কর্তৃক অনুমোদিত ইমেইল, পাসওয়ার্ড ও <strong className="text-amber-300">admin</strong> রোল দিয়ে প্রবেশ করুন
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            অ্যাডমিন ইমেইল:
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full min-h-[44px] bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            পাসওয়ার্ড:
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full min-h-[44px] bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition disabled:opacity-50"
          >
            বাতিল
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>যাচাই হচ্ছে...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>প্রবেশ করুন</span>
              </>
            )}
          </button>
        </div>
      </form>

      <p className="text-[11px] text-slate-500 text-center mt-4 leading-relaxed">
        নিরাপত্তা: মূল মালিক Supabase অ্যাকাউন্ট থেকে যেকোনো সময় অ্যাডমিন এক্সেস চালু বা বন্ধ করতে পারবেন।
      </p>
    </div>
  );
};
