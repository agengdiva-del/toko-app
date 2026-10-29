/**
 * MitraArja Merchant - Global State Management Context
 * Supports multi-store switching, real-time incoming orders with sound,
 * inventory adjustments, wallet withdrawals, promotion toggling, and review replies.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Merchant,
  Store,
  Product,
  ProductCategory,
  Order,
  Promotion,
  Wallet,
  WalletTransaction,
  Withdrawal,
  Review,
  NotificationItem,
  StockAdjustment,
  OrderStatus,
  WithdrawalMethod,
  MerchantStatus,
  MerchantRegistrationData,
  RegistrationVerificationStatus,
} from '../types/index.ts';
import {
  INITIAL_MERCHANT,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PROMOTIONS,
  INITIAL_WALLET,
  INITIAL_TRANSACTIONS,
  INITIAL_WITHDRAWALS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STOCK_ADJUSTMENTS,
} from '../data/mockData.ts';
import {
  calculateOrderFinancials,
  calculateAvailableStock,
  validateWithdrawal,
  WITHDRAWAL_FEE,
} from '../utils/merchantLogic.ts';
import { playOrderNotificationSound, playAlertSound } from '../utils/audio.ts';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface MerchantContextType {
  // Merchant & Stores
  merchant: Merchant;
  updateMerchantStatus: (status: MerchantStatus) => void;
  stores: Store[];
  currentStore: Store;
  setCurrentStoreId: (id: string) => void;
  updateCurrentStore: (data: Partial<Store>) => void;

  // Orders
  orders: Order[];
  activeOrdersCount: number;
  newOrdersCount: number;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  markPreparing: (orderId: string) => void;
  markReadyForPickup: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  simulateIncomingOrder: () => void;
  autoSimulate: boolean;
  setAutoSimulate: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Products & Inventory
  products: Product[];
  categories: ProductCategory[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'reservedStock'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => void;
  stockAdjustments: StockAdjustment[];
  adjustStock: (productId: string, type: 'Addition' | 'Reduction' | 'Adjustment', amount: number, reason: string) => void;

  // Promotions
  promotions: Promotion[];
  addPromotion: (promo: Omit<Promotion, 'id' | 'usageCount'>) => void;
  togglePromotionActive: (id: string) => void;
  togglePromotionFeatured: (id: string) => void;

  // Reviews
  reviews: Review[];
  replyReview: (reviewId: string, replyText: string) => void;

  // Wallet
  wallet: Wallet;
  transactions: WalletTransaction[];
  withdrawals: Withdrawal[];
  requestWithdrawal: (
    amount: number,
    method: WithdrawalMethod,
    destName: string,
    destNumber: string,
    recipientName: string
  ) => { success: boolean; error?: string };

  // Notifications
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // UI & Global Controls
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  deviceView: 'mobile' | 'desktop';
  setDeviceView: (val: 'mobile' | 'desktop') => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;

  // Registration & Account Lifecycle
  registrationData: MerchantRegistrationData;
  updateRegistrationStatus: (status: RegistrationVerificationStatus, reason?: string) => void;
  submitMerchantRegistration: (data: Omit<MerchantRegistrationData, 'id' | 'status' | 'submittedAt'>) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('desktop');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Core Data
  const [merchant, setMerchant] = useState<Merchant>(INITIAL_MERCHANT);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [currentStoreId, setCurrentStoreId] = useState<string>(INITIAL_STORES[0].id);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<ProductCategory[]>(INITIAL_CATEGORIES);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(INITIAL_STOCK_ADJUSTMENTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(INITIAL_WITHDRAWALS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Initial Registration Record for Arjawinangun local merchant
  const [registrationData, setRegistrationData] = useState<MerchantRegistrationData>({
    id: 'reg_arja_001',
    ownerName: 'Hj. Siti Fatimah',
    ownerPhone: '085224158990',
    isPhoneOtpVerified: true,
    email: 'siti.warungarja@gmail.com',
    password: '••••••••',
    passwordConfirmation: '••••••••',
    ownerPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    storeName: 'Warung Nasi Jamblang & Empal Bu Siti',
    storeCategory: 'Warung Makan & Kuliner Tradisional',
    storeWhatsapp: '085224158990',
    storeLogoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    storeDescription: 'Nasi jamblang daun jati asli, empal gentong kuah santan gurih, tahu tempe bacem, sambal terasi khas Arjawinangun.',
    productTypes: ['Makanan Siap Saji / Lauk Pauk', 'Minuman Dingin & Hangat', 'Camilan & Kerupuk Tradisional'],
    fullAddress: 'Jl. Raya By Pass Arjawinangun No. 88, Blok Karang Moncol RT.03/RW.02',
    village: 'Jungjang',
    district: 'Arjawinangun',
    gpsLocation: {
      lat: -6.6508,
      lng: 108.4124,
      label: 'Depan Pasar Gaya Arjawinangun Cirebon',
    },
    openingHours: '06:00',
    closingHours: '21:00',
    operationalDays: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    ktpPhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    agreedToTerms: true,
    status: 'Menunggu Verifikasi',
    submittedAt: '2026-03-28T09:15:00Z',
  });

  const currentStore = stores.find((s) => s.id === currentStoreId) || stores[0];

  // Helper Toast
  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update Merchant Status & Synchronize Registration State
  const updateMerchantStatus = (status: MerchantStatus) => {
    setMerchant((prev) => ({ ...prev, status }));
    setStores((prev) =>
      prev.map((s) => (s.merchantId === merchant.id ? { ...s, isVerified: status === 'Verified' } : s))
    );
    
    // Sync Indonesian registration status
    const mappedRegStatus: RegistrationVerificationStatus =
      status === 'Verified' ? 'Disetujui' : status === 'Pending' ? 'Menunggu Verifikasi' : 'Ditolak';
    setRegistrationData((prev) => ({
      ...prev,
      status: mappedRegStatus,
      reviewedAt: new Date().toISOString(),
      rejectionReason: status === 'Rejected' ? 'Verifikasi berkas belum memenuhi persyaratan standar kepatuhan AWD.' : undefined,
    }));

    addToast('info', 'Status Mitra Diperbarui', `Status merchant: ${status} (${mappedRegStatus})`);
  };

  // Update Registration Status lifecycle explicitly
  const updateRegistrationStatus = (status: RegistrationVerificationStatus, reason?: string) => {
    setRegistrationData((prev) => ({
      ...prev,
      status,
      reviewedAt: new Date().toISOString(),
      rejectionReason: status === 'Ditolak' ? (reason || 'Foto KTP tidak terbaca jelas atau koordinat GPS berada di luar jangkauan pengantaran.') : undefined,
    }));

    if (status === 'Disetujui') {
      setMerchant((prev) => ({ ...prev, status: 'Verified' }));
      setStores((prev) =>
        prev.map((s) => ({ ...s, isVerified: true }))
      );
      addToast('success', 'Pendaftaran Disetujui!', 'Selamat! Akun warung telah disetujui. Toko siap menerima pesanan, kelola stok & pencairan dana.');
    } else if (status === 'Menunggu Verifikasi') {
      setMerchant((prev) => ({ ...prev, status: 'Pending' }));
      setStores((prev) =>
        prev.map((s) => ({ ...s, isVerified: false }))
      );
      addToast('info', 'Status: Menunggu Verifikasi', 'Pengajuan pendaftaran sedang ditinjau oleh Tim Operasional AWD Arjawinangun.');
    } else {
      setMerchant((prev) => ({ ...prev, status: 'Rejected' }));
      setStores((prev) =>
        prev.map((s) => ({ ...s, isVerified: false }))
      );
      addToast('error', 'Pendaftaran Ditolak', reason || 'Periksa kembali dokumen KTP dan titik GPS lokasi warung Anda.');
    }
  };

  // Submit New Merchant Registration Form
  const submitMerchantRegistration = (data: Omit<MerchantRegistrationData, 'id' | 'status' | 'submittedAt'>) => {
    const newId = 'reg_' + Date.now();
    const newReg: MerchantRegistrationData = {
      ...data,
      id: newId,
      status: 'Menunggu Verifikasi',
      submittedAt: new Date().toISOString(),
    };
    setRegistrationData(newReg);

    // Update merchant profile with owner info
    setMerchant((prev) => ({
      ...prev,
      ownerName: data.ownerName,
      phone: data.ownerPhone,
      email: data.email || prev.email,
      status: 'Pending',
      verificationDocs: {
        ...prev.verificationDocs,
        ktpUrl: data.ktpPhotoUrl || prev.verificationDocs.ktpUrl,
        submittedAt: new Date().toISOString(),
      },
    }));

    // Create and add new store into store list
    const newStoreId = 'str_' + Date.now();
    const createdStore: Store = {
      id: newStoreId,
      merchantId: merchant.id,
      name: data.storeName,
      description: data.storeDescription || `Warung kuliner & usaha lokal di ${data.village}, ${data.district}.`,
      logoUrl: data.storeLogoUrl,
      bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      address: `${data.fullAddress}, Desa ${data.village}, Kec. ${data.district}, Cirebon`,
      latitude: data.gpsLocation.lat,
      longitude: data.gpsLocation.lng,
      phone: data.ownerPhone,
      whatsapp: data.storeWhatsapp || data.ownerPhone,
      openingHours: data.openingHours,
      closingHours: data.closingHours,
      deliveryRadiusKm: 7,
      category: data.storeCategory.includes('Kuliner') || data.storeCategory.includes('Warung Makan') ? 'Restaurant' : 'UMKM',
      operationalStatus: 'Open',
      isVerified: false,
      rating: 5.0,
      reviewCount: 0,
    };

    setStores((prev) => [createdStore, ...prev]);
    setCurrentStoreId(newStoreId);

    addToast(
      'success',
      'Pendaftaran Berhasil Dikirim!',
      `Warung "${data.storeName}" berhasil didaftarkan. Status: Menunggu Verifikasi.`
    );
  };

  // Update Current Store Info
  const updateCurrentStore = (data: Partial<Store>) => {
    setStores((prev) => prev.map((s) => (s.id === currentStore.id ? { ...s, ...data } : s)));
    addToast('success', 'Toko Diperbarui', 'Informasi operasional toko berhasil disimpan.');
  };

  // Counts
  const activeOrdersCount = orders.filter((o) =>
    ['Accepted', 'Preparing', 'ReadyForPickup', 'PickedUp', 'OnDelivery'].includes(o.status)
  ).length;
  const newOrdersCount = orders.filter((o) => o.status === 'New').length;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  // Order Actions
  const acceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Accepted' as OrderStatus } : o))
    );
    addToast('success', 'Pesanan Diterima', 'Pesanan masuk ke tahap persiapan dapur.');
  };

  const rejectOrder = (orderId: string, reason: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      // Return reserved stock
      target.items.forEach((item) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.productId
              ? { ...p, reservedStock: Math.max(0, p.reservedStock - item.quantity) }
              : p
          )
        );
      });
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'Cancelled' as OrderStatus, rejectReason: reason } : o
      )
    );
    addToast('info', 'Pesanan Ditolak', `Pesanan telah dibatalkan: ${reason}`);
  };

  const markPreparing = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Preparing' as OrderStatus } : o))
    );
    addToast('info', 'Sedang Disiapkan', 'Pesanan dalam proses peracikan bumbu / masak.');
  };

  const markReadyForPickup = (orderId: string) => {
    // Assign simulated driver
    const mockDriver = {
      id: 'drv_' + Math.floor(Math.random() * 1000),
      name: 'Agus Setiawan',
      phone: '085712349988',
      vehicleNumber: 'B 3821 TUL',
      vehicleType: 'Honda Vario 160 Putih',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: 4.9,
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'ReadyForPickup' as OrderStatus,
              assignedDriver: mockDriver,
            }
          : o
      )
    );
    addToast('success', 'Siap Diambil Driver', 'Driver MitraArja telah dihubungi untuk penjemputan.');
  };

  const completeOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Deduct stock permanently and remove reserved
    order.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.productId) {
            const nextStock = Math.max(0, p.stock - item.quantity);
            const nextReserved = Math.max(0, p.reservedStock - item.quantity);
            return {
              ...p,
              stock: nextStock,
              reservedStock: nextReserved,
              status: nextStock <= 0 ? 'OutOfStock' : p.status,
            };
          }
          return p;
        })
      );
    });

    // Financials & Wallet update
    const netEarnings = order.merchantNetAmount;
    const platformFee = order.platformFee;

    setWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance + netEarnings,
      withdrawableBalance: prev.withdrawableBalance + netEarnings,
    }));

    // Record transactions
    const txIncome: WalletTransaction = {
      id: 'tx_' + Date.now(),
      walletId: wallet.id,
      type: 'SalesIncome',
      amount: order.subtotal - order.discount,
      fee: platformFee,
      netAmount: netEarnings,
      referenceId: order.orderNumber,
      description: `Penjualan Selesai #${order.orderNumber} (${order.customerName})`,
      date: 'Baru saja',
      status: 'Success',
    };

    setTransactions((prev) => [txIncome, ...prev]);

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Completed' as OrderStatus } : o))
    );

    // Notification
    const notif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: 'Pesanan Selesai!',
      message: `Pesanan #${order.orderNumber} selesai. Dana Rp${netEarnings.toLocaleString('id-ID')} masuk ke saldo dompet.`,
      type: 'OrderCompleted',
      isRead: false,
      timestamp: 'Baru saja',
      orderId: order.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    addToast('success', 'Pesanan Selesai', `Pendapatan bersih ${netEarnings.toLocaleString('id-ID')} ditambahkan ke dompet.`);
  };

  // Simulate Incoming Order
  const simulateIncomingOrder = useCallback(() => {
    if (currentStore.operationalStatus === 'Closed' || !currentStore.isVerified) {
      addToast('error', 'Toko Tidak Aktif', 'Toko sedang tutup atau belum terverifikasi. Tidak dapat menerima pesanan baru.');
      return;
    }

    const availableProducts = products.filter((p) => p.stock > 0);
    if (availableProducts.length === 0) return;

    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const qty = Math.min(randomProduct.stock, Math.floor(Math.random() * 2) + 1);
    const itemSubtotal = (randomProduct.discountPrice || randomProduct.price) * qty;

    const { platformFee, merchantNetAmount } = calculateOrderFinancials(itemSubtotal, 0);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const customerNames = ['Rizky Ramadhan', 'Annisa Putri', 'Fauzan Hidayat', 'Nadia Syahrini', 'Bayu Pratama'];
    const randomCustomer = customerNames[Math.floor(Math.random() * customerNames.length)];

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber: `MA-${randomNum}`,
      storeId: currentStore.id,
      customerName: randomCustomer,
      customerPhone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      customerAvatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&w=150&q=80`,
      orderTime: 'Baru saja',
      items: [
        {
          id: 'itm_' + Date.now(),
          productId: randomProduct.id,
          productName: randomProduct.name,
          productImage: randomProduct.imageUrl,
          quantity: qty,
          unitPrice: randomProduct.discountPrice || randomProduct.price,
        },
      ],
      subtotal: itemSubtotal,
      discount: 0,
      deliveryFee: 10000,
      platformFee,
      totalAmount: itemSubtotal + 10000,
      merchantNetAmount,
      paymentMethod: 'GOPAY',
      deliveryAddress: 'Jl. Rasuna Said Kav. B4, Kuningan, Jakarta Selatan',
      distanceKm: 2.7,
      status: 'New',
      estimatedDeliveryMinutes: 20,
    };

    // Update reserved stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === randomProduct.id ? { ...p, reservedStock: p.reservedStock + qty } : p
      )
    );

    setOrders((prev) => [newOrder, ...prev]);

    // Ring sound
    if (soundEnabled) {
      playOrderNotificationSound();
    }

    // Add notification
    const notif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title: 'Orderan Baru Masuk! 🔔',
      message: `Pesanan #${newOrder.orderNumber} dari ${newOrder.customerName} sebesar Rp${newOrder.totalAmount.toLocaleString('id-ID')}`,
      type: 'NewOrder',
      isRead: false,
      timestamp: 'Baru saja',
      orderId: newOrder.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    addToast('success', '🔔 Orderan Baru!', `Pesanan #${newOrder.orderNumber} dari ${newOrder.customerName}`);
  }, [currentStore, products, soundEnabled, addToast]);

  // Auto simulate interval
  useEffect(() => {
    if (!autoSimulate) return;
    const interval = setInterval(() => {
      simulateIncomingOrder();
    }, 45000);
    return () => clearInterval(interval);
  }, [autoSimulate, simulateIncomingOrder]);

  // Product Actions
  const addProduct = (item: Omit<Product, 'id' | 'createdAt' | 'reservedStock'>) => {
    const newProd: Product = {
      ...item,
      id: 'prd_' + Date.now(),
      reservedStock: 0,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    addToast('success', 'Produk Ditambahkan', `Produk "${item.name}" berhasil dipublikasikan.`);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    addToast('success', 'Produk Diperbarui', 'Perubahan produk berhasil disimpan.');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('info', 'Produk Dihapus', `Produk "${prod?.name || ''}" telah dihapus dari etalase.`);
  };

  const duplicateProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const cloned: Product = {
      ...target,
      id: 'prd_' + Date.now(),
      name: `${target.name} (Salinan)`,
      sku: `${target.sku}-CPY`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [cloned, ...prev]);
    addToast('success', 'Produk Diduplikasi', `Salinan produk "${target.name}" berhasil dibuat.`);
  };

  // Stock Adjustment
  const adjustStock = (
    productId: string,
    type: 'Addition' | 'Reduction' | 'Adjustment',
    amount: number,
    reason: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    let nextStock = prod.stock;
    if (type === 'Addition') nextStock += amount;
    else if (type === 'Reduction') nextStock = Math.max(0, nextStock - amount);
    else if (type === 'Adjustment') nextStock = Math.max(0, amount);

    const log: StockAdjustment = {
      id: 'adj_' + Date.now(),
      productId,
      productName: prod.name,
      type,
      amount,
      previousStock: prod.stock,
      newStock: nextStock,
      reason,
      timestamp: new Date().toISOString(),
    };

    setStockAdjustments((prev) => [log, ...prev]);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stock: nextStock,
              status: nextStock <= 0 ? 'OutOfStock' : p.status === 'OutOfStock' ? 'Active' : p.status,
            }
          : p
      )
    );

    // Alert if low stock
    if (nextStock < 5 && nextStock > 0 && soundEnabled) {
      playAlertSound();
      const alertNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        title: 'Peringatan Stok Rendah',
        message: `Stok "${prod.name}" tersisa ${nextStock} item.`,
        type: 'LowStock',
        isRead: false,
        timestamp: 'Baru saja',
      };
      setNotifications((prev) => [alertNotif, ...prev]);
    }

    addToast('success', 'Stok Diperbarui', `Stok "${prod.name}" kini menjadi ${nextStock}.`);
  };

  // Promotions Actions
  const addPromotion = (promo: Omit<Promotion, 'id' | 'usageCount'>) => {
    const newPromo: Promotion = {
      ...promo,
      id: 'prm_' + Date.now(),
      usageCount: 0,
    };
    setPromotions((prev) => [newPromo, ...prev]);
    addToast('success', 'Promosi Dibuat', `Promo "${promo.title}" berhasil diaktifkan.`);
  };

  const togglePromotionActive = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const togglePromotionFeatured = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
    );
  };

  // Review Actions
  const replyReview = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              merchantReply: replyText,
              replyDate: 'Hari ini',
            }
          : r
      )
    );
    addToast('success', 'Balasan Terkirim', 'Balasan ulasan berhasil disampaikan ke pelanggan.');
  };

  // Wallet Withdrawal Request
  const requestWithdrawal = (
    amount: number,
    method: WithdrawalMethod,
    destName: string,
    destNumber: string,
    recipientName: string
  ): { success: boolean; error?: string } => {
    const check = validateWithdrawal(amount, wallet.withdrawableBalance);
    if (!check.valid) {
      addToast('error', 'Gagal Tarik Saldo', check.error || 'Nominal tidak memenuhi ketentuan.');
      return { success: false, error: check.error };
    }

    const totalDeducted = amount + WITHDRAWAL_FEE;
    setWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - totalDeducted,
      withdrawableBalance: prev.withdrawableBalance - totalDeducted,
    }));

    const newWd: Withdrawal = {
      id: 'wd_' + Date.now(),
      walletId: wallet.id,
      amount,
      fee: WITHDRAWAL_FEE,
      netAmount: amount,
      method,
      destinationName: destName,
      destinationNumber: destNumber,
      recipientName,
      status: 'Approved',
      requestedAt: new Date().toISOString(),
    };

    const newTx: WalletTransaction = {
      id: 'tx_' + Date.now(),
      walletId: wallet.id,
      type: 'Withdrawal',
      amount,
      fee: WITHDRAWAL_FEE,
      netAmount: -totalDeducted,
      referenceId: newWd.id,
      description: `Penarikan Saldo ke ${destName} (${destNumber})`,
      date: 'Baru saja',
      status: 'Success',
    };

    setWithdrawals((prev) => [newWd, ...prev]);
    setTransactions((prev) => [newTx, ...prev]);

    addToast(
      'success',
      'Pencairan Diproses',
      `Penarikan dana Rp${amount.toLocaleString('id-ID')} ke ${destName} sedang ditransfer.`
    );
    return { success: true };
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('info', 'Notifikasi Dibaca', 'Semua notifikasi ditandai telah dibaca.');
  };

  return (
    <MerchantContext.Provider
      value={{
        merchant,
        updateMerchantStatus,
        stores,
        currentStore,
        setCurrentStoreId,
        updateCurrentStore,
        orders,
        activeOrdersCount,
        newOrdersCount,
        acceptOrder,
        rejectOrder,
        markPreparing,
        markReadyForPickup,
        completeOrder,
        simulateIncomingOrder,
        autoSimulate,
        setAutoSimulate,
        soundEnabled,
        setSoundEnabled,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        stockAdjustments,
        adjustStock,
        promotions,
        addPromotion,
        togglePromotionActive,
        togglePromotionFeatured,
        reviews,
        replyReview,
        wallet,
        transactions,
        withdrawals,
        requestWithdrawal,
        notifications,
        unreadNotifsCount,
        markNotificationRead,
        markAllNotificationsRead,
        activeTab,
        setActiveTab,
        isDarkMode,
        setIsDarkMode,
        deviceView,
        setDeviceView,
        isOffline,
        setIsOffline,
        registrationData,
        updateRegistrationStatus,
        submitMerchantRegistration,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchant = (): MerchantContextType => {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
};
