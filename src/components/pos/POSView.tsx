import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Product, Order } from '../../types/pos';
import { ProductCustomizerModal } from './ProductCustomizerModal';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { HoldOrdersModal } from './HoldOrdersModal';
import { SplitOrderModal } from './SplitOrderModal';
import {
  Search,
  Coffee,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Pause,
  Split,
  Utensils,
  CupSoda,
  Cookie,
  PlusCircle,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';

export const POSView: React.FC = () => {
  const {
    categories,
    products,
    cart,
    orderType,
    setOrderType,
    customerName,
    setCustomerName,
    tableNumber,
    setTableNumber,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    holdCurrentOrder,
    heldOrders,
    settings,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  // Mobile Cart Drawer State
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState<boolean>(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState<boolean>(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Filter Products
  const filteredProducts = products.filter((p) => {
    if (p.is_archived) return false;
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Totals calculation
  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSuccess = (completedOrder: Order) => {
    setIsCheckoutOpen(false);
    setIsMobileCartOpen(false);
    setLastCompletedOrder(completedOrder);
    setIsReceiptOpen(true);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'CupSoda':
        return <CupSoda className="w-4 h-4" />;
      case 'Cookie':
        return <Cookie className="w-4 h-4" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      default:
        return <PlusCircle className="w-4 h-4" />;
    }
  };

  const CartContent = (
    <div className="flex flex-col h-full bg-[#FFFDF9]">
      {/* Cart Header */}
      <div className="p-4 bg-[#2A180D] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#D97706]" />
          <h3 className="font-extrabold text-base">Current Order</h3>
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[#C4A58E] hover:text-red-400 font-semibold"
            >
              Clear
            </button>
          )}
          <span className="px-2.5 py-0.5 rounded-full bg-[#D97706] text-white font-mono text-xs font-bold">
            {totalCartCount}
          </span>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsMobileCartOpen(false)}
            className="lg:hidden p-1 rounded-full bg-[#3D2314] text-white ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cart Line Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#8C5338] text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#FAF5EF] flex items-center justify-center text-[#D0C7B9]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="font-bold text-sm text-[#2C1A0E]">Cart is Empty</p>
            <p className="text-xs text-[#A88B77]">
              Tap any coffee, drink, or food item to add it to this order.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.cart_item_id}
              className="p-3 bg-[#FAF5EF] rounded-2xl border border-[#EFE4D6] space-y-2 relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h5 className="font-bold text-xs text-[#2C1A0E]">{item.product.name}</h5>
                  <p className="text-[11px] text-[#D97706] font-semibold">
                    ₱{item.unit_price.toFixed(2)} each
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.cart_item_id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Customizations tags */}
              <div className="flex flex-wrap gap-1 text-[10px]">
                {item.customization.variant && (
                  <span className="px-2 py-0.5 bg-white border border-[#D0C7B9] rounded-md font-bold text-[#6F3E28]">
                    Size: {item.customization.variant.name}
                  </span>
                )}
                {item.customization.sugar_level && (
                  <span className="px-2 py-0.5 bg-white border border-[#D0C7B9] rounded-md text-[#6F3E28]">
                    Sugar: {item.customization.sugar_level}
                  </span>
                )}
                {item.customization.ice_level && (
                  <span className="px-2 py-0.5 bg-white border border-[#D0C7B9] rounded-md text-[#6F3E28]">
                    Ice: {item.customization.ice_level}
                  </span>
                )}
                {item.customization.milk_option && (
                  <span className="px-2 py-0.5 bg-white border border-[#D0C7B9] rounded-md text-[#6F3E28]">
                    {item.customization.milk_option}
                  </span>
                )}
                {item.customization.espresso_shots ? (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md">
                    +{item.customization.espresso_shots} Shot(s)
                  </span>
                ) : null}
                {item.customization.selected_add_ons?.map((a, aIdx) => (
                  <span
                    key={aIdx}
                    className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md font-medium"
                  >
                    + {a.name}
                  </span>
                ))}
                {item.customization.special_instructions && (
                  <p className="w-full text-[10px] text-amber-800 italic mt-0.5">
                    Note: "{item.customization.special_instructions}"
                  </p>
                )}
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between pt-1 border-t border-[#EFE4D6]">
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-[#D0C7B9]">
                  <button
                    onClick={() =>
                      updateCartQuantity(item.cart_item_id, item.quantity - 1)
                    }
                    className="w-6 h-6 rounded-lg bg-[#FAF5EF] text-[#3D2314] font-bold flex items-center justify-center hover:bg-[#EFE4D6]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateCartQuantity(item.cart_item_id, item.quantity + 1)
                    }
                    className="w-6 h-6 rounded-lg bg-[#3D2314] text-white font-bold flex items-center justify-center hover:bg-[#4A2E19]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <span className="font-extrabold text-sm text-[#2C1A0E]">
                  ₱{item.total_price.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Footer Actions & Checkout */}
      <div className="p-4 bg-[#FAF5EF] border-t border-[#EFE4D6] space-y-3">
        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={holdCurrentOrder}
            disabled={cart.length === 0}
            className="py-2 px-3 bg-white border border-[#D0C7B9] text-[#3D2314] rounded-xl text-xs font-bold hover:bg-[#EFE4D6] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Hold Order</span>
          </button>

          <button
            onClick={() => setIsSplitModalOpen(true)}
            disabled={cart.length === 0}
            className="py-2 px-3 bg-white border border-[#D0C7B9] text-[#3D2314] rounded-xl text-xs font-bold hover:bg-[#EFE4D6] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Split className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Split Bill</span>
          </button>
        </div>

        {/* Totals Summary */}
        <div className="space-y-1 text-xs text-[#6F3E28]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold">₱{subtotal.toFixed(2)}</span>
          </div>
          {settings.tax_rate > 0 && (
            <div className="flex justify-between text-[11px]">
              <span>Est. VAT ({settings.tax_rate}%):</span>
              <span>₱{((subtotal * settings.tax_rate) / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-[#2C1A0E] pt-1 border-t border-[#D0C7B9]">
            <span>TOTAL:</span>
            <span className="text-[#D97706]">₱{subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={() => setIsCheckoutOpen(true)}
          disabled={cart.length === 0}
          className="w-full py-4 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-extrabold rounded-2xl shadow-xl hover:shadow-2xl transition-all touch-press disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-6 text-base"
        >
          <span>Proceed to Payment</span>
          <div className="flex items-center gap-1">
            <span>₱{subtotal.toFixed(2)}</span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)] overflow-hidden bg-[#FAF5EF]">
      {/* LEFT PANEL: Menu Catalog & Controls */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-4 space-y-3.5">
        {/* Top Control Bar */}
        <div className="bg-[#FFFDF9] p-3 rounded-2xl border border-[#EFE4D6] shadow-sm flex flex-wrap items-center justify-between gap-2.5">
          {/* Dine-in vs Takeout Toggle */}
          <div className="flex items-center gap-1 bg-[#FAF5EF] p-1 rounded-xl border border-[#EFE4D6] w-full sm:w-auto justify-center">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-extrabold text-xs transition-all touch-press ${
                orderType === 'dine_in'
                  ? 'bg-[#3D2314] text-white shadow'
                  : 'text-[#8C5338] hover:text-[#2C1A0E]'
              }`}
            >
              🍽️ Dine-in
            </button>
            <button
              onClick={() => setOrderType('takeout')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-extrabold text-xs transition-all touch-press ${
                orderType === 'takeout'
                  ? 'bg-[#D97706] text-white shadow'
                  : 'text-[#8C5338] hover:text-[#2C1A0E]'
              }`}
            >
              🛍️ Takeout
            </button>
          </div>

          {/* Customer / Table Info Inputs */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            {orderType === 'dine_in' && (
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Table #"
                className="w-20 sm:w-24 px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-bold text-[#2C1A0E] focus:ring-2 focus:ring-[#D97706] outline-none"
              />
            )}
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name / Order Note"
              className="flex-1 px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-semibold text-[#2C1A0E] focus:ring-2 focus:ring-[#D97706] outline-none"
            />
          </div>

          {/* Held Orders Badge Trigger */}
          <button
            onClick={() => setIsHoldModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#FAF5EF] hover:bg-[#EFE4D6] border border-[#D0C7B9] text-[#3D2314] text-xs font-bold flex items-center gap-2 relative transition-all"
          >
            <Clock className="w-4 h-4 text-[#D97706]" />
            <span className="hidden sm:inline">Held Orders</span>
            {heldOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D97706] text-white text-[10px] font-black flex items-center justify-center shadow">
                {heldOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="space-y-3">
          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coffee, drinks, pastries, food..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D0C7B9] bg-white text-sm font-medium focus:ring-2 focus:ring-[#D97706] outline-none shadow-sm"
            />
            <Search className="w-5 h-5 text-[#8C5338] absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-[#8C5338] font-bold hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 whitespace-nowrap transition-all touch-press ${
                selectedCategory === 'all'
                  ? 'bg-[#3D2314] text-white shadow-md'
                  : 'bg-white border border-[#EFE4D6] text-[#6F3E28] hover:bg-[#FAF5EF]'
              }`}
            >
              <span>All Products</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                {products.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = products.filter((p) => p.category_id === cat.id && !p.is_archived).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 whitespace-nowrap transition-all touch-press ${
                    isSelected
                      ? 'bg-[#D97706] text-white shadow-md'
                      : 'bg-white border border-[#EFE4D6] text-[#6F3E28] hover:bg-[#FAF5EF]'
                  }`}
                >
                  {getCategoryIcon(cat.icon)}
                  <span>{cat.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 pb-20 lg:pb-6">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-[#8C5338] space-y-2">
              <Coffee className="w-12 h-12 mx-auto text-[#D0C7B9]" />
              <p className="font-bold text-base">No items found</p>
              <p className="text-xs text-[#A88B77]">Try adjusting your search query or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((prod) => {
                const isSoldOut = !prod.is_available;
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      if (!isSoldOut) setCustomizingProduct(prod);
                    }}
                    className={`bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-200 ${
                      isSoldOut
                        ? 'opacity-60 cursor-not-allowed grayscale'
                        : 'hover:border-[#D97706] hover:shadow-md cursor-pointer touch-press'
                    }`}
                  >
                    {/* Product Image Header corresponding to item name */}
                    <div className="relative h-28 sm:h-32 w-full bg-[#2A180D] flex items-center justify-center overflow-hidden border-b border-[#3D2314]">
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      {isSoldOut ? (
                        <div className="absolute inset-0 bg-black/75 z-10 flex items-center justify-center">
                          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow">
                            SOLD OUT
                          </span>
                        </div>
                      ) : (
                        prod.variants &&
                        prod.variants.length > 0 && (
                          <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-md bg-black/70 text-white font-bold text-[10px] backdrop-blur-sm border border-white/10">
                            {prod.variants.length} Sizes
                          </div>
                        )
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#2C1A0E] line-clamp-1">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-[#8C5338] line-clamp-2 mt-0.5 leading-tight">
                          {prod.description}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-[#D97706]">
                          ₱{prod.base_price.toFixed(2)}
                        </span>
                        <div className="w-7 h-7 rounded-xl bg-[#3D2314] text-white flex items-center justify-center shadow-sm">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP RIGHT PANEL: Shopping Cart (35% width on desktop) */}
      <div className="hidden lg:flex w-[380px] xl:w-[420px] border-l border-[#EFE4D6] shadow-lg no-print">
        {CartContent}
      </div>

      {/* MOBILE STICKY BOTTOM CART BAR */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30 no-print">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-[#3D2314] to-[#2A180D] text-white font-extrabold rounded-2xl shadow-2xl flex items-center justify-between border border-[#D97706]/40 touch-press"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#D97706] flex items-center justify-center font-bold text-white text-xs">
                {totalCartCount}
              </div>
              <span className="text-xs">View Current Order</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-[#D97706]">₱{subtotal.toFixed(2)}</span>
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* MOBILE CART DRAWER MODAL */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#FFFDF9] rounded-t-3xl max-h-[85vh] h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {CartContent}
          </div>
        </div>
      )}

      {/* MODALS */}
      {customizingProduct && (
        <ProductCustomizerModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {isReceiptOpen && (
        <ReceiptModal
          order={lastCompletedOrder}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}

      {isHoldModalOpen && (
        <HoldOrdersModal onClose={() => setIsHoldModalOpen(false)} />
      )}

      {isSplitModalOpen && (
        <SplitOrderModal onClose={() => setIsSplitModalOpen(false)} />
      )}
    </div>
  );
};
