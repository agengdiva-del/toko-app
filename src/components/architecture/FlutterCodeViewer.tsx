import React, { useState } from 'react';
import {
  Code2,
  Database,
  Copy,
  Check,
  Download,
  FolderTree,
  X,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, FLUTTER_CODE_SAMPLES } from '../../data/flutterAndSchemaTemplates.ts';

interface FlutterCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterCodeViewer: React.FC<FlutterCodeViewerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'flutterTree' | 'main' | 'bloc' | 'service' | 'colors'>('sql');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const flutterFolderStructure = `mitraarja_merchant/
├── android/
├── ios/
├── assets/
│   ├── sounds/
│   │   └── order_chime.mp3
│   └── icons/
├── lib/
│   ├── main.dart                          # App Entry point & Supabase init
│   ├── injection_container.dart           # GetIt dependency injection
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart            # #16A34A Green, #F97316 Orange
│   │   │   └── api_endpoints.dart
│   │   ├── network/
│   │   │   └── supabase_service.dart      # Supabase realtime streams & RPC
│   │   ├── services/
│   │   │   ├── notification_service.dart  # Firebase Cloud Messaging push
│   │   │   ├── sound_service.dart         # AudioPlayer marketplace chime
│   │   │   └── location_service.dart       # Google Maps API geocoding
│   │   └── theme/
│   │       └── app_theme.dart             # Modern Light & Dark theme
│   └── features/
│       ├── auth/
│       │   ├── data/ (datasources, models, repositories)
│       │   ├── domain/ (entities, usecases)
│       │   └── presentation/ (bloc, screens: login, register, kyc_docs)
│       ├── dashboard/
│       │   └── presentation/ (bloc, widgets: stats_cards, revenue_chart)
│       ├── orders/
│       │   ├── data/ (order_model.dart, orders_remote_datasource.dart)
│       │   ├── domain/ (order_entity.dart, stream_orders_usecase.dart)
│       │   └── presentation/ (bloc: orders_bloc.dart, screens: orders_screen.dart)
│       ├── products/
│       │   ├── data/ (product_model.dart)
│       │   └── presentation/ (bloc, screens: product_list, add_product_form)
│       ├── inventory/
│       │   └── presentation/ (bloc, screens: stock_management, stock_history)
│       ├── wallet/
│       │   ├── data/ (wallet_model.dart, withdrawal_request.dart)
│       │   └── presentation/ (bloc: wallet_bloc.dart, screens: withdraw_modal)
│       ├── promotions/
│       │   └── presentation/ (bloc, screens: create_promo_screen.dart)
│       ├── reviews/
│       │   └── presentation/ (bloc, screens: review_replies_screen.dart)
│       └── store/
│           └── presentation/ (bloc, screens: store_settings, map_picker)
└── pubspec.yaml`;

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'sql':
        return SUPABASE_SQL_SCHEMA;
      case 'flutterTree':
        return flutterFolderStructure;
      case 'main':
        return FLUTTER_CODE_SAMPLES.mainDart;
      case 'bloc':
        return FLUTTER_CODE_SAMPLES.ordersBloc;
      case 'service':
        return FLUTTER_CODE_SAMPLES.supabaseService;
      case 'colors':
        return FLUTTER_CODE_SAMPLES.appColors;
      default:
        return SUPABASE_SQL_SCHEMA;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'sql' ? 'sql' : activeTab === 'flutterTree' ? 'txt' : 'dart';
    const filename = `mitraarja_${activeTab}.${ext}`;
    const blob = new Blob([getCurrentCode()], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl text-slate-100"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  MitraArja Codebase Architecture & Database Schema
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Clean Architecture
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full PostgreSQL Supabase 17 Tables, BLoC State Management, and Production Flutter Code
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/90 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'sql', label: '17 Tabel PostgreSQL & Supabase', icon: Database },
            { id: 'flutterTree', label: 'Struktur Folder Clean Architecture', icon: FolderTree },
            { id: 'main', label: 'lib/main.dart (Inisialisasi)', icon: FileCode },
            { id: 'bloc', label: 'orders_bloc.dart (Realtime Sound)', icon: Layers },
            { id: 'service', label: 'supabase_service.dart (RPC)', icon: Sparkles },
            { id: 'colors', label: 'app_colors.dart (#16A34A & #F97316)', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content Box */}
        <div className="flex-1 p-4 bg-slate-950 font-mono text-xs overflow-auto text-emerald-300 leading-relaxed select-text">
          <pre>{getCurrentCode()}</pre>
        </div>
      </div>
    </div>
  );
};
