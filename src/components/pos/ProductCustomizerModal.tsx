import React, { useState } from 'react';
import type { Product, ProductVariant, AddOn, CartItemCustomization } from '../../types/pos';
import { useStore } from '../../context/StoreContext';
import { X, Plus, Minus } from 'lucide-react';

interface ProductCustomizerModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  product,
  onClose,
}) => {
  const { addOns, addToCart } = useStore();

  if (!product) return null;

  const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(defaultVariant);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Calculate live price
  let currentUnitPrice = product.base_price;
  if (selectedVariant) {
    currentUnitPrice += selectedVariant.price_adjustment;
  }
  selectedAddOns.forEach((addon) => {
    currentUnitPrice += addon.price;
  });

  const totalPrice = currentUnitPrice * quantity;

  const handleAddOnToggle = (addon: AddOn) => {
    if (selectedAddOns.some((a) => a.id === addon.id)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleConfirmAddToCart = () => {
    const customization: CartItemCustomization = {
      variant: selectedVariant,
      selected_add_ons: selectedAddOns.length > 0 ? selectedAddOns : undefined,
      special_instructions: specialInstructions.trim() || undefined,
    };

    addToCart(product, customization, quantity);
    onClose();
  };

  const isBeverage = product.category_id === 'cat-1' || product.category_id === 'cat-2' || product.category_id === 'cat-3';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full shadow-2xl border border-[#EFE4D6] overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#3D2314] to-[#2A180D] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D97706]/20 border border-[#8C5338] flex items-center justify-center text-2xl shadow overflow-hidden relative shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">{product.name}</h3>
              <p className="text-xs text-[#C4A58E]">Base Price: ₱{product.base_price.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#4A2E19] hover:bg-[#6F3E28] text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Options Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2C1A0E]">
          {/* Size / Variant Options */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#6F3E28] uppercase tracking-wider mb-2">
                1. Select Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-2xl border text-center transition-all touch-press ${
                        isSelected
                          ? 'border-[#D97706] bg-[#D97706]/10 text-[#B45309] font-bold shadow-sm'
                          : 'border-[#E5E0D8] bg-white text-[#2C1A0E] hover:border-[#C4A58E]'
                      }`}
                    >
                      <div className="text-sm font-semibold">{v.name}</div>
                      <div className="text-xs text-[#8C5338]">
                        {v.price_adjustment > 0 ? `+₱${v.price_adjustment}` : 'Standard'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons List (Only for food items, omitted for Beverages as requested) */}
          {!isBeverage && addOns.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#6F3E28] uppercase tracking-wider mb-2">
                Flavor / Extra Add-ons
              </label>
              <div className="grid grid-cols-2 gap-2">
                {addOns.map((addon) => {
                  const isSelected = selectedAddOns.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => handleAddOnToggle(addon)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'border-[#D97706] bg-[#D97706]/10 text-[#B45309] font-bold'
                          : 'border-[#E5E0D8] bg-white text-[#2C1A0E] hover:border-[#C4A58E]'
                      }`}
                    >
                      <span>{addon.name}</span>
                      <span className="text-[11px] font-bold text-[#8C5338]">+₱{addon.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Requests Notes */}
          <div>
            <label className="block text-xs font-bold text-[#6F3E28] uppercase tracking-wider mb-2">
              Special Instructions
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra hot, less sweet, separate lid..."
              className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-medium focus:ring-2 focus:ring-[#D97706] outline-none"
            />
          </div>
        </div>

        {/* Footer: Quantity & Add to Cart Action */}
        <div className="p-5 bg-[#FAF5EF] border-t border-[#EFE4D6] flex items-center justify-between gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-2xl border border-[#D0C7B9]">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-xl bg-[#FAF5EF] text-[#3D2314] font-bold flex items-center justify-center hover:bg-[#EFE4D6]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-extrabold text-lg text-[#2C1A0E]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-xl bg-[#3D2314] text-white font-bold flex items-center justify-center hover:bg-[#4A2E19]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleConfirmAddToCart}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all touch-press flex items-center justify-between text-sm"
          >
            <span>Add to Cart</span>
            <span className="font-extrabold text-base">₱{totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
