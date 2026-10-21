/**
 * MitraArja Merchant - Main Application Root
 * Local delivery marketplace ecosystem merchant management platform.
 */

import React, { useState } from 'react';
import { MerchantProvider, useMerchant } from './context/MerchantContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { BottomNav } from './components/layout/BottomNav.tsx';
import { Toasts } from './components/common/Toasts.tsx';
import { DeviceFrameToggle } from './components/common/DeviceFrameToggle.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { OrdersView } from './components/orders/OrdersView.tsx';
import { ProductsView } from './components/products/ProductsView.tsx';
import { InventoryView } from './components/inventory/InventoryView.tsx';
import { PromotionsView } from './components/promotions/PromotionsView.tsx';
import { ReviewsView } from './components/reviews/ReviewsView.tsx';
import { WalletView } from './components/wallet/WalletView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { StoreManagementView } from './components/store/StoreManagementView.tsx';
import { AuthAndVerificationView } from './components/auth/AuthAndVerificationView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { NotificationCenterModal } from './components/notifications/NotificationCenterModal.tsx';
import { FlutterCodeViewer } from './components/architecture/FlutterCodeViewer.tsx';

const MerchantAppContent: React.FC = () => {
  const { activeTab, deviceView, isDarkMode } = useMerchant();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);

  // Render view by active tab
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrdersView />;
      case 'products':
        return <ProductsView />;
      case 'inventory':
        return <InventoryView />;
      case 'promotions':
        return <PromotionsView />;
      case 'reviews':
        return <ReviewsView />;
      case 'wallet':
        return <WalletView />;
      case 'reports':
        return <ReportsView />;
      case 'store':
        return <StoreManagementView />;
      case 'auth_docs':
      case 'profile':
        return <AuthAndVerificationView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-blue-600 selection:text-white">
        <Toasts />
        <NotificationCenterModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        <FlutterCodeViewer isOpen={isCodeViewerOpen} onClose={() => setIsCodeViewerOpen(false)} />

        <DeviceFrameToggle>
          <Navbar
            onOpenNotifications={() => setIsNotifOpen(true)}
            onOpenCodeViewer={() => setIsCodeViewerOpen(true)}
          />

          <div className="flex">
            {/* Desktop Sidebar (hidden on mobile) */}
            {deviceView === 'desktop' && (
              <Sidebar onOpenCodeViewer={() => setIsCodeViewerOpen(true)} />
            )}

            {/* Main Content Area */}
            <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {renderActiveView()}
            </main>
          </div>

          {/* Bottom Nav on Mobile View */}
          {deviceView === 'mobile' && <BottomNav />}
        </DeviceFrameToggle>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <MerchantProvider>
      <MerchantAppContent />
    </MerchantProvider>
  );
}
