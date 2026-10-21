import React from 'react';
import { useMerchant } from '../../context/MerchantContext.tsx';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Star,
  PlusCircle,
  Eye,
  Tag,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  ChevronRight,
  Boxes,
  Zap,
  Printer,
} from 'lucide-react';
import { formatRupiah, calculateOrderFinancials } from '../../utils/merchantLogic.ts';
import { ThermalReceiptModal } from '../orders/ThermalReceiptModal.tsx';
import type { Order } from '../../types/index.ts';

export const DashboardView: React.FC = () => {
  const {
    currentStore,
    orders,
    products,
    reviews,
    wallet,
    setActiveTab,
    simulateIncomingOrder,
    acceptOrder,
    addToast,
  } = useMerchant();

  const [orderForThermalPrint, setOrderForThermalPrint] = React.useState<Order | null>(null);

  // Statistics calculation
  const completedOrders = orders.filter((o) => o.status === 'Completed');
  const todaySales = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.merchantNetAmount, 0);
  const todayOrdersCount = orders.filter((o) => o.status !== 'Cancelled').length;
  const monthlyRevenue = 18450000 + todaySales;

  // Recent Orders (take top 4)
  const recentOrders = orders.slice(0, 4);

  // Low Stock Items (< 5)
  const lowStockProducts = products.filter((p) => p.stock < 5);

  // Top Selling Products
  const topProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 3);

  // Chart data (Simulated 7 days)
  const chartDays = [
    { day: 'Sen', amount: 840000, height: '45%' },
    { day: 'Sel', amount: 1120000, height: '60%' },
    { day: 'Rab', amount: 950000, height: '52%' },
    { day: 'Kam', amount: 1300000, height: '70%' },
    { day: 'Jum', amount: 1680000, height: '88%' },
    { day: 'Sab', amount: 2100000, height: '100%' },
    { day: 'Min', amount: 1850000, height: '92%' },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Welcome Banner with AWD Blue Gradient & Quick Order Simulator */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-5 sm:p-6 shadow-xl shadow-blue-900/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                Dashboard Mitra AWD
              </span>
              <span className="text-xs text-blue-100">
                • {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Selamat datang kembali, {currentStore.name}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mt-1">
              Kelola pesanan masuk, cetak nota thermal siap kirim, pantau stok, dan maksimalkan penjualan di Arjawinangun Delivery.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={simulateIncomingOrder}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-950/20 flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Tes Order Masuk 🔔</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs sm:text-sm transition-all border border-white/20"
            >
              Lihat Semua Order
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -top-12 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* 4 Top Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Penjualan Hari Ini</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {formatRupiah(todaySales)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% dari kemarin</span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pesanan Hari Ini</span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {todayOrdersCount} Pesanan
          </p>
          <div className="flex items-center gap-1 text-[11px] text-orange-600 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+3 pesanan baru</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pendapatan Bulan Ini</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {formatRupiah(monthlyRevenue)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Target 85% tercapai</span>
          </div>
        </div>

        {/* Store Rating */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Rating Toko</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              ⭐ {currentStore.rating.toFixed(1)}
            </p>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Berdasarkan {currentStore.reviewCount} ulasan pembeli
          </div>
        </div>
      </div>

      {/* 4 Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('products')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-3 group text-left"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tambah Produk</h4>
            <p className="text-[11px] text-slate-400">Publikasi menu baru</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-3 group text-left"
        >
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 group-hover:scale-110 transition-transform">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Lihat Pesanan</h4>
            <p className="text-[11px] text-slate-400">Pantau proses dapur</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('promotions')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-purple-500 hover:shadow-md transition-all flex items-center gap-3 group text-left"
        >
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 group-hover:scale-110 transition-transform">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Buat Promosi</h4>
            <p className="text-[11px] text-slate-400">Diskon & voucher</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-3 group text-left"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 group-hover:scale-110 transition-transform">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tarik Saldo</h4>
            <p className="text-[11px] text-slate-400">{formatRupiah(wallet.withdrawableBalance)}</p>
          </div>
        </button>
      </div>

      {/* Main Grid: Orders & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Orders + Revenue Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders Widget */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Pesanan Terkini</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pantau dan proses pesanan yang butuh tindakan segera</p>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={order.customerAvatar}
                      alt={order.customerName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{order.orderNumber}</span>
                        <span className="text-[11px] text-slate-400">• {order.orderTime}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'New'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 animate-pulse'
                            : order.status === 'Accepted'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                            : order.status === 'Preparing'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : order.status === 'ReadyForPickup'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                            : order.status === 'Completed'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {order.status === 'New' ? 'Pesanan Baru' : order.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                        {order.customerName} • {order.items.length} Menu ({formatRupiah(order.totalAmount)})
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
                        {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => setOrderForThermalPrint(order)}
                      title="Cetak Struk Thermal (58mm/80mm)"
                      className="px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      aria-label="Cetak Struk Thermal"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span>Cetak Nota</span>
                    </button>

                    {order.status === 'New' ? (
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-500/25 transition-all"
                      >
                        Terima Pesanan
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        Detail
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart Widget */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Tren Penjualan 7 Hari Terakhir</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total pendapatan kotor seminggu: {formatRupiah(9840000)}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Omzet Harian</span>
              </div>
            </div>

            {/* Simulated Bar Visual */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-700">
              {chartDays.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {Math.round(item.amount / 1000)}k
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-t-lg h-32 flex items-end overflow-hidden">
                    <div
                      style={{ height: item.height }}
                      className="w-full bg-gradient-to-t from-blue-700 via-blue-600 to-indigo-400 rounded-t-lg transition-all duration-500 group-hover:from-blue-600 group-hover:to-cyan-400"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-1">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Low Stock Alert + Top Products + Reviews Snippet */}
        <div className="space-y-6">
          {/* Low Stock Alert Widget */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Peringatan Stok Rendah</h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {lowStockProducts.length} Produk
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">Semua stok produk dalam kondisi aman.</p>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                          Tersisa {p.stock} porsi (Min. 5)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shrink-0"
                    >
                      + Tambah
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Selling Products Widget */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Produk Terlaris</h3>
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-400">{formatRupiah(p.discountPrice || p.price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-xs shrink-0">
                    {p.stock + 120} terjual
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Snippet */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ulasan Pembeli Terbaru</h3>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            {reviews.slice(0, 2).map((rev) => (
              <div key={rev.id} className="border-b last:border-b-0 border-slate-100 dark:border-slate-700/60 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{rev.customerName}</span>
                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                  "{rev.comment}"
                </p>
                {rev.merchantReply && (
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                    ✓ Sudah dibalas oleh Toko
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thermal Receipt Modal */}
      <ThermalReceiptModal
        order={orderForThermalPrint}
        store={currentStore}
        isOpen={Boolean(orderForThermalPrint)}
        onClose={() => setOrderForThermalPrint(null)}
        onToast={addToast}
      />
    </div>
  );
};
