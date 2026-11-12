import React, { useState } from 'react';

interface AplLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  customUrl?: string;
  className?: string;
  showText?: boolean;
}

export const AplLogo: React.FC<AplLogoProps> = ({
  size = 'md',
  customUrl,
  className = '',
  showText = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${sizeClasses} shrink-0 drop-shadow-md select-none`}>
        {customUrl && !imageError ? (
          <img
            src={customUrl}
            alt="APL লোগো"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain rounded-xl"
          />
        ) : (
          <img
            src="/apl-logo.svg"
            alt="আখরকান্দা দক্ষিণ পাড়া প্রিমিয়ার লিগ - APL ক্রেস্ট লোগো"
            className="w-full h-full object-contain filter drop-shadow hover:scale-105 transition-transform duration-200"
          />
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-amber-400 tracking-wider text-lg leading-tight">
              APL
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
              ২০২৬
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-200 leading-tight">
            আখরকান্দা দক্ষিণ পাড়া প্রিমিয়ার লিগ
          </span>
        </div>
      )}
    </div>
  );
};
