import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Order, OrderStatus } from '../../types/pos';
import { ReceiptModal } from '../pos/ReceiptModal';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Printer,
  Search,
  Utensils,
  Flame,
  Check,
  XCircle,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, cancelOrRefundOrder } = useStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'served' | 'cancelled'>(
    'active'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Cancel/Refund Modal state
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [isRefund, setIsRefund] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');

  // Timer update ticker
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getWaitingTimeStr = (createdAt: string) => {
    const elapsedMs = Math.max(0, now - new Date(createdAt).getTime());
    const elapsedMins = Math.floor(elapsedMs / 60000);
    const elapsedSecs = Math.floor((elapsedMs % 60000) / 1000);

    if (elapsedMins < 1) {
      return `${elapsedSecs}s ago`;
    }
    return `${elapsedMins}m ${elapsedSecs}s ago`;
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.table_number && o.table_number.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'active') {
      return o.status === 'pending' || o.status === 'preparing' || o.status === 'ready';
    }
    if (activeFilter === 'served') {
      return o.status === 'served';
    }
    if (activeFilter === 'cancelled') {
      return o.status === 'cancelled' || o.status === 'refunded';
    }
    return true;
  });

  const handleConfirmCancelRefund = () => {
    if (!cancellingOrder || !cancelReason.trim()) return;
    cancelOrRefundOrder(cancellingOrder.id, isRefund, cancelReason.trim());
    setCancellingOrder(null);
    setCancelReason('');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center gap-1 border border-amber-300">
            <Clock className="w-3.5 h-3.5" /> PENDING
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm animate-pulse">
            <Flame className="w-3.5 h-3.5" /> PREPARING
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" /> READY FOR PICKUP
          </span>
        );
      case 'served':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> SERVED / COMPLETED
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-extrabold text-xs flex items-center gap-1 border border-red-300">
            <XCircle className="w-3.5 h-3.5" /> CANCELLED
          </span>
        );
      case 'refunded':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 font-extrabold text-xs flex items-center gap-1 border border-purple-300">
            <RotateCcw className="w-3.5 h-3.5" /> REFUNDED
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2C1A0E]">Kitchen & Order Status</h2>
          <p className="text-xs text-[#8C5338]">
            Monitor active preparations, track waiting times, advance order statuses, and reprint receipts.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order # or customer..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-medium focus:ring-2 focus:ring-[#D97706] outline-none"
          />
          <Search className="w-4 h-4 text-[#8C5338] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EFE4D6] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeFilter === 'active'
              ? 'bg-[#3D2314] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <Flame className="w-4 h-4 text-[#D97706]" />
          <span>Active Orders ({orders.filter((o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('served')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeFilter === 'served'
              ? 'bg-[#166534] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed / Served ({orders.filter((o) => o.status === 'served').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('cancelled')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeFilter === 'cancelled'
              ? 'bg-red-900 text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Cancelled & Refunded ({orders.filter((o) => o.status === 'cancelled' || o.status === 'refunded').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all ${
            activeFilter === 'all'
              ? 'bg-[#D97706] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          All History ({orders.length})
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="py-20 text-center text-[#8C5338] bg-white rounded-3xl border border-[#EFE4D6] shadow-sm space-y-2">
          <Utensils className="w-12 h-12 mx-auto text-[#D0C7B9]" />
          <p className="font-bold text-base">No orders found in this queue</p>
          <p className="text-xs text-[#A88B77]">New orders placed at the POS will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-[#FFFDF9] rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all ${
                order.status === 'preparing'
                  ? 'border-[#D97706] ring-2 ring-[#D97706]/20'
                  : order.status === 'ready'
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-[#EFE4D6]'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-[#2C1A0E] tracking-tight">
                      {order.order_number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                        order.order_type === 'dine_in'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-orange-50 text-orange-900 border-orange-300'
                      }`}
                    >
                      {order.order_type.replace('_', ' ')}
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Sub Customer & Timer */}
                <div className="flex items-center justify-between text-xs text-[#8C5338] font-semibold mb-3">
                  <span>
                    👤 {order.customer_name || 'Guest'} {order.table_number ? `• ${order.table_number}` : ''}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[11px] bg-[#FAF5EF] px-2 py-0.5 rounded-md border border-[#EFE4D6]">
                    <Clock className="w-3 h-3 text-[#D97706]" />
                    <span>{getWaitingTimeStr(order.created_at)}</span>
                  </div>
                </div>

                {/* Itemized summary */}
                <div className="bg-[#FAF5EF] p-3 rounded-xl border border-[#EFE4D6] space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between font-extrabold text-[#2C1A0E]">
                        <span>
                          {item.quantity}x {item.product_name}
                        </span>
                        <span>₱{item.total_price.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-[#6F3E28] pl-3 space-y-0.5">
                        {item.variant_name && <div>• Size: {item.variant_name}</div>}
                        {item.customizations?.sugar_level && (
                          <div>
                            • Sugar: {item.customizations.sugar_level}, Ice:{' '}
                            {item.customizations.ice_level || 'Regular'}
                          </div>
                        )}
                        {item.customizations?.milk_option && (
                          <div>• Milk: {item.customizations.milk_option}</div>
                        )}
                        {item.customizations?.selected_add_ons?.map((a, aIdx) => (
                          <div key={aIdx}>+ {a.name}</div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {order.special_notes && (
                    <p className="text-[11px] text-amber-900 font-bold bg-amber-100 p-2 rounded-lg italic mt-2">
                      Notes: "{order.special_notes}"
                    </p>
                  )}
                </div>

                {order.refund_reason && (
                  <div className="p-2.5 rounded-xl bg-red-100 border border-red-200 text-xs text-red-900 font-medium mb-3">
                    <strong>Reason:</strong> {order.refund_reason}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[#EFE4D6] flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#8C5338] font-bold">Total Paid:</span>
                  <span className="text-base font-black text-[#D97706]">
                    ₱{order.total_amount.toFixed(2)}
                  </span>
                </div>

                {/* Status Pipeline Step Actions */}
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl shadow text-xs flex items-center justify-center gap-1.5 touch-press"
                    >
                      <Flame className="w-4 h-4" />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow text-xs flex items-center justify-center gap-1.5 touch-press"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'served')}
                      className="flex-1 py-2.5 bg-[#166534] hover:bg-[#15803D] text-white font-extrabold rounded-xl shadow text-xs flex items-center justify-center gap-1.5 touch-press"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Served / Done</span>
                    </button>
                  )}

                  {/* Receipt Reprint */}
                  <button
                    onClick={() => setSelectedOrderForReceipt(order)}
                    className="p-2.5 bg-white border border-[#D0C7B9] text-[#3D2314] hover:bg-[#FAF5EF] rounded-xl text-xs font-bold"
                    title="Reprint Thermal Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {/* Cancel / Refund */}
                  {order.status !== 'cancelled' && order.status !== 'refunded' && (
                    <button
                      onClick={() => {
                        setCancellingOrder(order);
                        setIsRefund(order.status === 'served');
                      }}
                      className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold"
                      title="Cancel or Refund Order"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal for Reprint */}
      {selectedOrderForReceipt && (
        <ReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}

      {/* Cancel / Refund Prompt Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full p-6 border border-[#EFE4D6] shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-[#2C1A0E]">
              {isRefund ? 'Process Order Refund' : 'Cancel Active Order'}
            </h3>
            <p className="text-xs text-[#8C5338]">
              Target: <span className="font-bold text-black">{cancellingOrder.order_number}</span> (Total: ₱{cancellingOrder.total_amount.toFixed(2)})
            </p>

            <div>
              <label className="block text-xs font-bold text-[#6F3E28] uppercase tracking-wider mb-1">
                Reason for {isRefund ? 'Refund' : 'Cancellation'} (Required for Audit Log)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer changed mind, wrong item prepared, spill..."
                rows={3}
                className="w-full p-3 rounded-xl border border-[#D0C7B9] bg-white text-xs font-medium focus:ring-2 focus:ring-red-500 outline-none"
                autoFocus
              ></textarea>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-3 bg-white border border-[#D0C7B9] text-[#3D2314] font-bold rounded-xl text-xs hover:bg-[#FAF5EF]"
              >
                Back
              </button>

              <button
                onClick={handleConfirmCancelRefund}
                disabled={!cancelReason.trim()}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow"
              >
                Confirm {isRefund ? 'Refund' : 'Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
