import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import type { NavigationTab } from '../../types/pos';
import {
  ShoppingBag,
  Clock,
  Coffee,
  Package,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  Lock,
  LogOut,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    getLowStockItems,
    orders,
    setIsLocked,
    setIsAuthenticated,
    settings,
  } = useStore();

  const [timeStr, setTimeStr] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const lowStockCount = getLowStockItems().length;
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'pos', label: 'POS Ordering', icon: <ShoppingBag className="w-5 h-5" /> },
    {
      id: 'orders',
      label: 'Order Queue',
      icon: <Clock className="w-5 h-5" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    { id: 'products', label: 'Menu & Products', icon: <Coffee className="w-5 h-5" /> },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-5 h-5" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    { id: 'expenses', label: 'Expenses', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'reports', label: 'Sales Reports', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleTabClick = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#2A180D] text-[#FFFDF9] sticky top-0 z-40 shadow-lg border-b border-[#4A2E19] no-print">
      {/* Top Banner Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#3D2314]">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src={settings.logo_url || '/8307.jpg'}
            alt="8307 Coffee Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-[#8C5338] shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/8307.jpg';
            }}
          />
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-wide text-white leading-none">
              {settings.shop_name}
            </h1>
            <p className="text-[10px] sm:text-xs text-[#C4A58E] font-medium tracking-wider mt-0.5">
              POS & STORE MANAGEMENT
            </p>
          </div>
        </div>

        {/* Live Clock & Quick Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4 text-xs font-medium">
          {/* Low Stock Warning Pill */}
          {lowStockCount > 0 && (
            <button
              onClick={() => handleTabClick('inventory')}
              className="px-2.5 py-1 rounded-full bg-red-950/90 border border-red-600 text-red-300 flex items-center gap-1.5 animate-pulse hover:bg-red-900 transition-colors text-[11px] sm:text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{lowStockCount} Alert{lowStockCount > 1 ? 's' : ''}</span>
            </button>
          )}

          {/* Time Display */}
          <div className="px-3 py-1.5 rounded-lg bg-[#3D2314] text-[#EFE4D6] font-mono tracking-widest hidden md:flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            {timeStr}
          </div>

          {/* Quick Lock */}
          <button
            onClick={() => setIsLocked(true)}
            className="p-2 rounded-lg bg-[#3D2314] hover:bg-[#4A2E19] text-[#C4A58E] hover:text-white transition-colors"
            title="Lock Screen"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Admin Profile */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#4A2E19]">
            <div className="w-7 h-7 rounded-full bg-[#D97706] text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-white leading-none">Admin</p>
              <p className="text-[10px] text-[#A88B77]">Full Access</p>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="p-1.5 hover:text-red-400 text-[#C4A58E] transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#3D2314] text-white hover:bg-[#4A2E19]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <nav className="hidden lg:flex px-3 items-center gap-1 overflow-x-auto py-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap relative touch-press ${
                isActive
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'text-[#C4A58E] hover:bg-[#3D2314] hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.id === 'inventory'
                      ? 'bg-red-500 text-white'
                      : isActive
                      ? 'bg-white text-[#D97706]'
                      : 'bg-[#D97706] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#2A180D] border-b border-[#4A2E19] p-3 space-y-1 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 mb-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center justify-between p-3 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-[#D97706] text-white shadow-md'
                      : 'bg-[#3D2314] text-[#C4A58E] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#3D2314] flex justify-between items-center text-xs text-[#C4A58E] px-1">
            <span>Admin Status: Authenticated</span>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-red-400 font-bold flex items-center gap-1 py-1"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
