import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Split } from 'lucide-react';

interface SplitOrderModalProps {
  onClose: () => void;
}

export const SplitOrderModal: React.FC<SplitOrderModalProps> = ({ onClose }) => {
  const { cart } = useStore();
  const [splitCount, setSplitCount] = useState<number>(2);

  const totalAmount = cart.reduce((sum, item) => sum + item.total_price, 0);
  const perBillAmount = totalAmount / splitCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full shadow-2xl border border-[#EFE4D6] overflow-hidden flex flex-col my-6">
        {/* Header */}
        <div className="p-5 bg-[#2A180D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Split className="w-5 h-5 text-[#D97706]" />
            <h3 className="font-extrabold text-base">Split Bill Calculator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#3D2314] hover:bg-[#4A2E19] text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-[#2C1A0E]">
          <div className="bg-[#FAF5EF] p-4 rounded-2xl border border-[#EFE4D6] flex justify-between items-center">
            <span className="text-xs font-bold text-[#6F3E28]">Original Total:</span>
            <span className="text-xl font-black text-[#D97706]">₱{totalAmount.toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6F3E28] uppercase tracking-wider mb-2">
              Number of Ways to Split
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSplitCount(num)}
                  className={`py-3 rounded-xl font-bold text-sm border transition-all ${
                    splitCount === num
                      ? 'bg-[#3D2314] text-white border-[#3D2314] shadow-md'
                      : 'bg-white border-[#E5E0D8] text-[#2C1A0E] hover:bg-[#FAF5EF]'
                  }`}
                >
                  {num} People
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#6F3E28] uppercase tracking-wider">
              Split Breakdown:
            </label>
            {Array.from({ length: splitCount }).map((_, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-[#E5E0D8] flex justify-between items-center text-xs"
              >
                <span className="font-bold text-[#6F3E28]">Person {idx + 1} Receipt:</span>
                <span className="font-extrabold text-sm text-emerald-700">
                  ₱{perBillAmount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF5EF] border-t border-[#EFE4D6]">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#D97706] text-white font-bold rounded-xl hover:bg-[#B45309] transition-all text-sm shadow"
          >
            Apply Equal Split
          </button>
        </div>
      </div>
    </div>
  );
};
