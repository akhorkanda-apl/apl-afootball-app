import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, MoreVertical, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // If already running in standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowInstallGuide(true);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="min-h-[38px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        title="ফোনে APL অ্যাপ ইনস্টল করুন"
      >
        {isIOS ? (
          <Smartphone className="w-3.5 h-3.5" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">অ্যাপ ইনস্টল</span>
      </button>

      {showInstallGuide && (
        <div
          onClick={() => setShowInstallGuide(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-slate-900 border border-emerald-500/40 p-5 shadow-2xl text-slate-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <img
                  src="/pwa-192x192.png"
                  alt="APL অ্যাপ আইকন"
                  className="w-10 h-10 rounded-xl border border-amber-400/50 shadow-md"
                />
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    ফোনে অ্যাপ ইনস্টল করুন
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    APL Football হোম-স্ক্রিন অ্যাপ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/40">
                    ১
                  </span>
                  <p>
                    সাফারি ব্রাউজারের নিচে থাকা <Share2 className="w-3.5 h-3.5 inline text-amber-400 mx-0.5" />{' '}
                    <strong className="text-white">Share (শেয়ার)</strong> বাটনে চাপ দিন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/40">
                    ২
                  </span>
                  <p>
                    নিচে স্ক্রল করে <PlusSquare className="w-3.5 h-3.5 inline text-amber-400 mx-0.5" />{' '}
                    <strong className="text-amber-400">&apos;Add to Home Screen&apos;</strong> চাপুন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/40">
                    ৩
                  </span>
                  <p>
                    উপরে ডানপাশে <strong className="text-white">&apos;Add&apos;</strong> চাপলেই ফোনে APL লোগোসহ অ্যাপ সেট হয়ে যাবে!
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/40">
                    ১
                  </span>
                  <p>
                    ব্রাউজারের উপরে ডানপাশে <MoreVertical className="w-3.5 h-3.5 inline text-amber-400" />{' '}
                    <strong className="text-white">মেনু (৩ ডট)</strong> বাটনে চাপ দিন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/40">
                    ২
                  </span>
                  <p>
                    <strong className="text-amber-400">&apos;Install app&apos;</strong> অথবা{' '}
                    <strong className="text-amber-400">&apos;Add to Home screen&apos;</strong> নির্বাচন করুন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-900/80 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/40">
                    ৩
                  </span>
                  <p>
                    ইনস্টল নিশ্চিত করলেই ফোনের হোম স্ক্রিনে <strong className="text-white">APL</strong> আইকনসহ অ্যাপ যুক্ত হয়ে যাবে!
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowInstallGuide(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition"
            >
              ঠিক আছে, বুঝতে পেরেছি
            </button>
          </div>
        </div>
      )}
    </>
  );
};
