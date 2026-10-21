import React from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import { Wifi, Battery, Signal, Smartphone, Monitor } from 'lucide-react';

interface DeviceFrameToggleProps {
  children: React.ReactNode;
}

export const DeviceFrameToggle: React.FC<DeviceFrameToggleProps> = ({ children }) => {
  const { deviceView, setDeviceView, isDarkMode } = useMerchant();

  if (deviceView === 'desktop') {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  // Mobile Simulator Shell
  return (
    <div className="min-h-screen bg-slate-900/90 py-6 px-2 sm:px-4 flex flex-col items-center justify-start">
      {/* Top Banner Notice */}
      <div className="mb-4 flex items-center justify-between w-full max-w-[420px] text-xs text-slate-400 px-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>MitraArja Mobile App Simulator</span>
        </div>
        <button
          onClick={() => setDeviceView('desktop')}
          className="hover:text-emerald-400 underline font-semibold flex items-center gap-1"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Buka Mode Portal Desktop</span>
        </button>
      </div>

      {/* Phone Hardware Bezel Frame */}
      <div className="w-full max-w-[420px] bg-slate-800 p-3 sm:p-3.5 rounded-[48px] shadow-2xl border-4 border-slate-700/80 ring-1 ring-white/10 relative">
        {/* Hardware Silent Switch & Volume Buttons visual accents */}
        <div className="absolute -left-2 top-24 w-1 h-8 bg-slate-700 rounded-l-md" />
        <div className="absolute -left-2 top-36 w-1 h-12 bg-slate-700 rounded-l-md" />
        <div className="absolute -right-2 top-28 w-1 h-16 bg-slate-700 rounded-r-md" />

        {/* Screen Container */}
        <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-[40px] overflow-hidden min-h-[820px] max-h-[880px] flex flex-col relative border border-slate-700/50 shadow-inner">
          {/* Native Status Bar */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200 z-40 select-none">
            <span>09:41</span>
            {/* Dynamic Island / Notch */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto -mt-1 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
            </div>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Scrollable Mobile Screen Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {children}
          </div>

          {/* iOS / Android Home Indicator Bar */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-1 pb-2 flex justify-center z-40 select-none">
            <div className="w-32 h-1 bg-slate-400/60 dark:bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
