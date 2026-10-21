import React from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Tag,
  Star,
  BarChart3,
  Store,
  Wallet,
  Settings,
  ShieldCheck,
  Code2,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  onOpenCodeViewer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCodeViewer }) => {
  const { activeTab, setActiveTab, newOrdersCount, currentStore, merchant } = useMerchant();

  const primaryNav = [
    { id: 'dashboard', label: 'Ringkasan Bisnis', icon: LayoutDashboard },
    { id: 'orders', label: 'Kelola Pesanan', icon: ShoppingBag, badge: newOrdersCount },
    { id: 'products', label: 'Daftar Produk', icon: Package },
    { id: 'inventory', label: 'Manajemen Stok', icon: Boxes },
    { id: 'promotions', label: 'Promosi & Diskon', icon: Tag },
    { id: 'reviews', label: 'Ulasan Pelanggan', icon: Star },
    { id: 'reports', label: 'Laporan Penjualan', icon: BarChart3 },
    { id: 'wallet', label: 'Dompet & Pencairan', icon: Wallet },
    { id: 'store', label: 'Profil & Lokasi Toko', icon: Store },
    { id: 'auth_docs', label: 'Dokumen & Verifikasi', icon: ShieldCheck },
    { id: 'settings', label: 'Pengaturan Akun', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div>
        {/* Merchant Card with AWD Logo */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 dark:from-slate-800/90 dark:to-slate-850 border border-blue-100 dark:border-blue-900/50 mb-5 shadow-sm">
          <div className="relative shrink-0">
            <img
              src="/assets/aistudio/Designer_b056b7f0.png"
              alt="AWD Ecosystem"
              className="w-11 h-11 rounded-xl object-contain bg-white p-0.5 border border-blue-200 dark:border-blue-800 shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[7px] text-white font-black">
              ✓
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{currentStore.name}</h4>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">{merchant.ownerName}</p>
            <span className="inline-block text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">AWD Merchant Hub</span>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1">Menu Utama</p>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-orange-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Technical Resources */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={onOpenCodeViewer}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors"
        >
          <Code2 className="w-4 h-4 shrink-0" />
          <div className="text-left">
            <p className="leading-none">Flutter & SQL Schema</p>
            <p className="text-[10px] opacity-75 font-normal mt-0.5">Kode Sumber & 17 Tabel</p>
          </div>
        </button>

        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-[11px] text-blue-900 dark:text-blue-200">
          <p className="font-bold flex items-center gap-1.5">
            <span>🛡️ Mitra AWD Terverifikasi</span>
          </p>
          <p className="text-[10px] opacity-90 mt-0.5">Arjawinangun Delivery • Komisi 10% dipotong otomatis dari tiap pesanan selesai.</p>
        </div>
      </div>
    </aside>
  );
};
