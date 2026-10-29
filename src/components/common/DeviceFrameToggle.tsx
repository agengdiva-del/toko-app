import React from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import { Wifi, Battery, Signal, Smartphone, Monitor } from 'lucide-react';

interface DeviceFrameToggleProps {
  children: React.ReactNode;
}

export const DeviceFrameToggle: React.FC<DeviceFrameToggleProps> = ({ children }) => {
  const { deviceView, setDeviceView, isDarkMode } = useMerchant();

  if (deviceView === 'desktop') {
    return <div className="w-full h-screen overflow-hidden flex flex-col">{children}</div>;
  }

  // Mobile Simulator Shell
  return (
    <div className="h-screen overflow-hidden bg-slate-900/95 py-2 px-2 sm:px-4 flex flex-col items-center justify-center">
      {/* Top Banner Notice */}
      <div className="mb-2 flex items-center justify-between w-full max-w-[420px] text-[11px] text-slate-400 px-2 shrink-0">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>AWD Mobile App Simulator</span>
        </div>
        <button
          onClick={() => setDeviceView('desktop')}
          className="hover:text-blue-400 underline font-semibold flex items-center gap-1 text-[11px]"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Mode Portal Desktop</span>
        </button>
      </div>

      {/* Phone Hardware Bezel Frame */}
      <div className="w-full max-w-[420px] bg-slate-800 p-2 sm:p-2.5 rounded-[40px] shadow-2xl border-4 border-slate-700/80 ring-1 ring-white/10 relative flex-1 max-h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
        {/* Screen Container */}
        <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-[32px] overflow-hidden flex-1 flex flex-col relative border border-slate-700/50 shadow-inner">
          {/* Native Status Bar */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 pt-2 pb-1 flex items-center justify-between text-[10px] font-bold text-slate-800 dark:text-slate-200 z-40 select-none shrink-0">
            <span>09:41</span>
            {/* Dynamic Island / Notch */}
            <div className="w-20 h-3.5 bg-black rounded-full mx-auto -mt-0.5 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>
            <div className="flex items-center gap-1.5">
              <Signal className="w-2.5 h-2.5" />
              <Wifi className="w-2.5 h-2.5" />
              <Battery className="w-3 h-3" />
            </div>
          </div>

          {/* Scrollable Mobile Screen Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {children}
          </div>

          {/* iOS / Android Home Indicator Bar */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-0.5 pb-1 flex justify-center z-40 select-none shrink-0">
            <div className="w-28 h-1 bg-slate-400/60 dark:bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
