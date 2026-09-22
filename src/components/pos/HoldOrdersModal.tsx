import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Play, Trash2, Clock, ShoppingBag } from 'lucide-react';

interface HoldOrdersModalProps {
  onClose: () => void;
}

export const HoldOrdersModal: React.FC<HoldOrdersModalProps> = ({ onClose }) => {
  const { heldOrders, resumeOrder, deleteHeldOrder } = useStore();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full shadow-2xl border border-[#EFE4D6] overflow-hidden flex flex-col my-6 max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-[#2A180D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#D97706]" />
            <h3 className="font-extrabold text-base">Held Unfinished Orders ({heldOrders.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#3D2314] hover:bg-[#4A2E19] text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {heldOrders.length === 0 ? (
            <div className="py-12 text-center text-[#8C5338] space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#D0C7B9]" />
              <p className="font-bold text-sm">No orders currently on hold</p>
              <p className="text-xs text-[#A88B77]">
                Hold orders from the active cart when a customer is still deciding.
              </p>
            </div>
          ) : (
            heldOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white border border-[#EFE4D6] shadow-sm flex items-center justify-between gap-4 hover:border-[#D97706] transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#2C1A0E]">{order.order_number}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF5EF] text-[10px] font-bold text-[#8C5338] border border-[#EFE4D6]">
                      {order.order_type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#6F3E28] mt-0.5">
                    {order.customer_name || 'Guest'} {order.table_number ? `• ${order.table_number}` : ''}
                  </p>
                  <p className="text-[11px] text-[#A88B77] mt-1">
                    {order.items.length} item(s) • Total: ₱{order.total_amount.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteHeldOrder(order.id)}
                    className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Discard Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      resumeOrder(order.id);
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-[#D97706] text-white font-bold rounded-xl shadow hover:bg-[#B45309] transition-all text-xs flex items-center gap-1.5 touch-press"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
