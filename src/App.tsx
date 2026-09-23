import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { LoginModal } from './components/auth/LoginModal';
import { LockScreenModal } from './components/auth/LockScreenModal';
import { POSView } from './components/pos/POSView';
import { OrdersView } from './components/orders/OrdersView';
import { ProductsView } from './components/products/ProductsView';
import { InventoryView } from './components/inventory/InventoryView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { CustomersView } from './components/customers/CustomersView';
import { SettingsView } from './components/settings/SettingsView';

const MainAppContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useStore();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'pos':
        return <POSView />;
      case 'orders':
        return <OrdersView />;
      case 'products':
        return <ProductsView />;
      case 'inventory':
        return <InventoryView />;
      case 'expenses':
        return <ExpensesView />;
      case 'reports':
        return <ReportsView />;
      case 'customers':
        return <CustomersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <POSView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#2C1A0E] flex flex-col antialiased selection:bg-[#D97706] selection:text-white">
      {isAuthenticated && (
        <>
          <Navbar />
          <main className="flex-1 overflow-x-hidden">{renderActiveTab()}</main>
        </>
      )}

      {/* Auth & Security Overlays */}
      <LoginModal />
      <LockScreenModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
