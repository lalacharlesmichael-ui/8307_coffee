import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { PaymentMethod, Order } from '../../types/pos';
import confetti from 'canvas-confetti';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const {
    cart,
    orderType,
    customerName,
    tableNumber,
    selectedDiscount,
    setSelectedDiscount,
    customDiscountValue,
    setCustomDiscountValue,
    selectedCustomer,
    setSelectedCustomer,
    discounts,
    customers,
    settings,
    processCheckout,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaidStr, setAmountPaidStr] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [seniorIdNumber, setSeniorIdNumber] = useState<string>('');

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);

  let discountAmount = 0;
  if (selectedDiscount) {
    if (selectedDiscount.discount_type === 'percentage' || selectedDiscount.discount_type === 'senior_pwd') {
      discountAmount = subtotal * (selectedDiscount.value / 100);
    } else if (selectedDiscount.discount_type === 'fixed') {
      discountAmount = selectedDiscount.value;
    }
  } else if (customDiscountValue > 0) {
    discountAmount = customDiscountValue;
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = (discountedSubtotal * settings.tax_rate) / 100;
  const serviceCharge = (discountedSubtotal * settings.service_charge_rate) / 100;
  const totalAmount = Math.round((discountedSubtotal + taxAmount + serviceCharge) * 100) / 100;

  const numAmountPaid = parseFloat(amountPaidStr) || 0;
  const changeGiven = paymentMethod === 'cash' ? Math.max(0, numAmountPaid - totalAmount) : 0;
  const isCashInsufficient = paymentMethod === 'cash' && numAmountPaid < totalAmount;

  // Keypad Helper
  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setAmountPaidStr('');
    } else if (val === 'DEL') {
      setAmountPaidStr((prev) => prev.slice(0, -1));
    } else if (val === '.') {
      if (!amountPaidStr.includes('.')) setAmountPaidStr((prev) => prev + '.');
    } else {
      setAmountPaidStr((prev) => prev + val);
    }
  };

  const setExactAmount = () => {
    setAmountPaidStr(totalAmount.toString());
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'cash' && isCashInsufficient) return;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D97706', '#B45309', '#2C1A0E', '#22C55E'],
      });
    } catch (e) {
      console.log('Confetti effect triggered');
    }

    const createdOrder = processCheckout(
      paymentMethod,
      paymentMethod === 'cash' ? numAmountPaid : totalAmount,
      referenceNumber || undefined
    );

    onSuccess(createdOrder);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#EFE4D6] overflow-hidden flex flex-col my-6 max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-[#2A180D] text-white flex items-center justify-between border-b border-[#3D2314]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D97706] flex items-center justify-center font-bold text-white text-lg">
              ₱
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Process Order Payment</h2>
              <p className="text-xs text-[#C4A58E]">
                {orderType.toUpperCase().replace('_', ' ')} • {customerName || 'Walk-in Guest'} {tableNumber ? `• ${tableNumber}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#3D2314] hover:bg-[#4A2E19] text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2C1A0E]">
          {/* Order Summary Box */}
          <div className="bg-[#FAF5EF] p-4 rounded-2xl border border-[#EFE4D6] space-y-2">
            <div className="flex justify-between text-xs text-[#6F3E28]">
              <span>Subtotal ({cart.length} items):</span>
              <span className="font-bold">₱{subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-red-600 font-semibold">
                <span>Discount ({selectedDiscount?.name || 'Custom'}):</span>
                <span>-₱{discountAmount.toFixed(2)}</span>
              </div>
            )}

            {settings.tax_rate > 0 && (
              <div className="flex justify-between text-xs text-[#6F3E28]">
                <span>VAT ({settings.tax_rate}%):</span>
                <span>₱{taxAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-[#D0C7B9] flex justify-between items-center">
              <span className="text-sm font-extrabold text-[#2C1A0E]">TOTAL DUE:</span>
              <span className="text-2xl font-black text-[#D97706]">₱{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Discount & Promo Codes */}
          <div>
            <label className="block text-xs font-bold text-[#6F3E28] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Apply Discount / Promo Code</span>
              {selectedDiscount && (
                <button
                  onClick={() => setSelectedDiscount(null)}
                  className="text-[11px] text-red-600 hover:underline"
                >
                  Clear Discount
                </button>
              )}
            </label>

            <div className="grid grid-cols-2 gap-2">
              {discounts.filter((d) => d.is_active !== false).map((disc) => {
                const isSelected = selectedDiscount?.id === disc.id;
                return (
                  <button
                    key={disc.id}
                    type="button"
                    onClick={() => {
                      setSelectedDiscount(isSelected ? null : disc);
                      setCustomDiscountValue(0);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all touch-press ${
                      isSelected
                        ? 'border-[#D97706] bg-[#D97706]/10 text-[#B45309] font-bold shadow-sm'
                        : 'border-[#E5E0D8] bg-white text-[#2C1A0E] hover:border-[#C4A58E]'
                    }`}
                  >
                    <div className="font-bold">{disc.name}</div>
                    <div className="text-[11px] text-[#8C5338]">
                      {disc.discount_type === 'percentage' || disc.discount_type === 'senior_pwd'
                        ? `${disc.value}% Off`
                        : `₱${disc.value} Off`}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedDiscount?.discount_type === 'senior_pwd' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={seniorIdNumber}
                  onChange={(e) => setSeniorIdNumber(e.target.value)}
                  placeholder="Enter Senior Citizen / PWD ID Number (Required)"
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-xs font-medium focus:ring-2 focus:ring-[#D97706] outline-none"
                />
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-[#6F3E28] uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all touch-press ${
                  paymentMethod === 'cash'
                    ? 'border-[#D97706] bg-[#D97706] text-white shadow-md font-bold'
                    : 'border-[#E5E0D8] bg-white text-[#2C1A0E] hover:bg-[#FAF5EF]'
                }`}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-xs">CASH</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('gcash')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all touch-press ${
                  paymentMethod === 'gcash'
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md font-bold'
                    : 'border-[#E5E0D8] bg-white text-[#2C1A0E] hover:bg-[#FAF5EF]'
                }`}
              >
                <QrCode className="w-6 h-6" />
                <span className="text-xs">GCASH</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all touch-press ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md font-bold'
                    : 'border-[#E5E0D8] bg-white text-[#2C1A0E] hover:bg-[#FAF5EF]'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-xs">CARD / E-WALLET</span>
              </button>
            </div>
          </div>

          {/* Payment Details according to Method */}
          {paymentMethod === 'cash' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6F3E28] uppercase tracking-wider mb-1">
                  Cash Tendered (₱)
                </label>
                <input
                  type="number"
                  value={amountPaidStr}
                  onChange={(e) => setAmountPaidStr(e.target.value)}
                  placeholder={`Min ₱${totalAmount.toFixed(2)}`}
                  className="w-full px-4 py-3 rounded-2xl border border-[#D0C7B9] bg-white text-2xl font-mono font-extrabold text-[#2C1A0E] focus:ring-2 focus:ring-[#D97706] outline-none"
                />
              </div>

              {/* Quick Cash Shortcuts */}
              <div className="grid grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={setExactAmount}
                  className="py-2.5 bg-[#FAF5EF] border border-[#D0C7B9] rounded-xl text-xs font-bold text-[#3D2314] hover:bg-[#EFE4D6]"
                >
                  Exact
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaidStr('100')}
                  className="py-2.5 bg-[#FAF5EF] border border-[#D0C7B9] rounded-xl text-xs font-bold text-[#3D2314] hover:bg-[#EFE4D6]"
                >
                  ₱100
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaidStr('200')}
                  className="py-2.5 bg-[#FAF5EF] border border-[#D0C7B9] rounded-xl text-xs font-bold text-[#3D2314] hover:bg-[#EFE4D6]"
                >
                  ₱200
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaidStr('500')}
                  className="py-2.5 bg-[#FAF5EF] border border-[#D0C7B9] rounded-xl text-xs font-bold text-[#3D2314] hover:bg-[#EFE4D6]"
                >
                  ₱500
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaidStr('1000')}
                  className="py-2.5 bg-[#FAF5EF] border border-[#D0C7B9] rounded-xl text-xs font-bold text-[#3D2314] hover:bg-[#EFE4D6]"
                >
                  ₱1000
                </button>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'C'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress(key)}
                    className="py-3 bg-white border border-[#E5E0D8] rounded-xl font-bold text-lg text-[#2C1A0E] hover:bg-[#FAF5EF] active:scale-95 transition-all"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Live Change Indicator */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-800 uppercase">Customer Change:</span>
                <span className="text-2xl font-black text-emerald-700">₱{changeGiven.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  📱
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900">
                    {paymentMethod === 'gcash' ? 'GCash Merchant QR' : 'E-Wallet / Card Terminal'}
                  </h4>
                  <p className="text-xs text-blue-700">Account: {settings.gcash_number}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1">
                  Payment Reference Number (Optional)
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. GC-982347102"
                  className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-xs font-mono outline-none"
                />
              </div>
            </div>
          )}

          {/* Customer Loyalty Association */}
          <div>
            <label className="block text-xs font-bold text-[#6F3E28] uppercase tracking-wider mb-2">
              Associate Customer for Loyalty Points (+1 pt per ₱50)
            </label>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const cust = customers.find((c) => c.id === e.target.value) || null;
                setSelectedCustomer(cust);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-medium outline-none"
            >
              <option value="">Walk-in Customer (No Loyalty Account)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) • {c.loyalty_points} Points
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#FAF5EF] border-t border-[#EFE4D6] flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3.5 bg-white border border-[#D0C7B9] text-[#3D2314] font-bold rounded-2xl hover:bg-[#EFE4D6] transition-colors text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmPayment}
            disabled={paymentMethod === 'cash' && isCashInsufficient}
            className={`flex-1 py-3.5 px-6 font-bold rounded-2xl shadow-lg transition-all touch-press flex items-center justify-center gap-2 text-base ${
              paymentMethod === 'cash' && isCashInsufficient
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-[#166534] to-[#15803D] text-white hover:shadow-xl'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {paymentMethod === 'cash' && isCashInsufficient
                ? `Insufficient Cash (Need ₱${(totalAmount - numAmountPaid).toFixed(2)})`
                : `Confirm Payment & Print Receipt`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
