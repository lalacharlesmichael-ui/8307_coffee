import React from 'react';
import type { Order } from '../../types/pos';
import { useStore } from '../../context/StoreContext';
import { Printer, X, CheckCircle } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = useStore();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-[340px] w-full shadow-2xl border border-[#EFE4D6] overflow-hidden flex flex-col my-6 max-h-[92vh]">
        {/* Top Controls Bar */}
        <div className="p-3.5 bg-[#2A180D] text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs">Receipt Ready</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-[#3D2314] hover:bg-[#4A2E19] text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Receipt Paper View */}
        <div className="p-5 overflow-y-auto flex-1 bg-white font-mono" id="thermal-receipt">
          {/* Header */}
          <div className="text-center space-y-1 mb-3">
            <img
              src={settings.logo_url || '/8307.jpg'}
              alt="8307 Coffee Logo"
              className="w-12 h-12 mx-auto rounded-full object-cover mb-2 border border-gray-300 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/8307.jpg';
              }}
            />
            <div className="text-xl font-black text-[#2C1A0E] tracking-tight">
              {settings.shop_name}
            </div>
            <p className="text-[10px] text-gray-600 font-medium">{settings.tagline}</p>
            <p className="text-[10px] text-gray-500 whitespace-pre-line">{settings.receipt_header}</p>
            <p className="text-[10px] text-gray-500">{settings.address}</p>
            <p className="text-[10px] text-gray-500">TEL: {settings.phone}</p>
          </div>

          <div className="border-b border-dashed border-gray-400 my-2.5"></div>

          {/* Meta Info */}
          <div className="text-xs space-y-1 text-gray-800">
            <div className="flex justify-between">
              <span className="font-bold">ORDER NO:</span>
              <span className="font-bold text-sm text-black">{order.order_number}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Date:</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Type:</span>
              <span className="font-bold uppercase">{order.order_type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Customer:</span>
              <span>{order.customer_name || 'Walk-in Guest'}</span>
            </div>
            {order.table_number && (
              <div className="flex justify-between text-[11px]">
                <span>Table:</span>
                <span className="font-bold">{order.table_number}</span>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-gray-400 my-2.5"></div>

          {/* Items */}
          <div className="space-y-2 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-black">
                  <span>
                    {item.quantity}x {item.product_name}
                  </span>
                  <span>₱{item.total_price.toFixed(2)}</span>
                </div>
                {item.variant_name && (
                  <p className="text-[10px] text-gray-600 pl-3">• Size: {item.variant_name}</p>
                )}
                {item.customizations?.sugar_level && (
                  <p className="text-[10px] text-gray-500 pl-3">
                    • Sugar: {item.customizations.sugar_level}, Ice: {item.customizations.ice_level || 'Regular'}
                  </p>
                )}
                {item.customizations?.milk_option && (
                  <p className="text-[10px] text-gray-500 pl-3">
                    • Milk: {item.customizations.milk_option}
                  </p>
                )}
                {item.customizations?.selected_add_ons?.map((a, aIdx) => (
                  <p key={aIdx} className="text-[10px] text-gray-500 pl-3">
                    + {a.name} (₱{a.price})
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="border-b border-dashed border-gray-400 my-2.5"></div>

          {/* Totals */}
          <div className="text-xs space-y-1 text-gray-800">
            <div className="flex justify-between text-[11px]">
              <span>Subtotal:</span>
              <span>₱{order.subtotal.toFixed(2)}</span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-red-600 font-bold text-[11px]">
                <span>Discount ({order.discount_type || 'Promo'}):</span>
                <span>-₱{order.discount_amount.toFixed(2)}</span>
              </div>
            )}

            {settings.tax_rate > 0 && (
              <div className="flex justify-between text-gray-600 text-[11px]">
                <span>VAT ({settings.tax_rate}%):</span>
                <span>₱{order.tax_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-sm text-black pt-1 border-t border-gray-300">
              <span>TOTAL DUE:</span>
              <span>₱{order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-gray-400 my-2.5"></div>

          {/* Payment breakdown */}
          {order.payment && (
            <div className="text-xs space-y-1 text-gray-700">
              <div className="flex justify-between text-[11px]">
                <span>Payment Method:</span>
                <span className="font-bold uppercase">{order.payment.payment_method}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Amount Paid:</span>
                <span>₱{order.payment.amount_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-black text-xs">
                <span>Change:</span>
                <span>₱{order.payment.change_given.toFixed(2)}</span>
              </div>
              {order.payment.reference_number && (
                <div className="flex justify-between text-[10px]">
                  <span>Ref #:</span>
                  <span>{order.payment.reference_number}</span>
                </div>
              )}
            </div>
          )}

          <div className="border-b border-dashed border-gray-400 my-3"></div>

          {/* Footer message */}
          <div className="text-center text-[10px] text-gray-600 font-medium whitespace-pre-line">
            {settings.receipt_footer}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3.5 bg-[#FAF5EF] border-t border-[#EFE4D6] flex items-center gap-2.5 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold rounded-xl shadow transition-all text-xs flex items-center justify-center gap-2 touch-press"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 bg-[#3D2314] hover:bg-[#2A180D] text-white font-bold rounded-xl transition-colors text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
