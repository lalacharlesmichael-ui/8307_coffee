import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { InventoryItem, Product } from '../../types/pos';
import {
  Package,
  Plus,
  Truck,
  Trash2,
  AlertTriangle,
  History,
  BookOpen,
  Search,
  CheckCircle2,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    recipes,
    products,
    inventoryMovements,
    addInventoryItem,
    updateInventoryStock,
    saveRecipe,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'stock' | 'recipes' | 'history'>('stock');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Stock In / Waste Modal state
  const [stockItem, setStockItem] = useState<InventoryItem | null>(null);
  const [movementMode, setMovementMode] = useState<'stock_in' | 'waste' | 'expired'>('stock_in');
  const [changeQtyStr, setChangeQtyStr] = useState<string>('100');
  const [reasonStr, setReasonStr] = useState<string>('');

  // Recipe Modal state
  const [recipeProduct, setRecipeProduct] = useState<Product | null>(null);
  const [recipeLines, setRecipeLines] = useState<
    { inventory_item_id: string; quantity_required: number }[]
  >([]);

  // Add Item Modal state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>('');
  const [itemCategory, setItemCategory] = useState<InventoryItem['category']>('Ingredients');
  const [itemUnit, setItemUnit] = useState<InventoryItem['unit']>('g');
  const [itemStockStr, setItemStockStr] = useState<string>('1000');
  const [itemMinAlertStr, setItemMinAlertStr] = useState<string>('200');
  const [itemCostStr, setItemCostStr] = useState<string>('0.50');
  const [itemSupplier, setItemSupplier] = useState<string>('');

  const filteredInventory = inventory.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.supplier_name && i.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openStockModal = (item: InventoryItem, mode: 'stock_in' | 'waste' | 'expired') => {
    setStockItem(item);
    setMovementMode(mode);
    setChangeQtyStr(mode === 'stock_in' ? '500' : '10');
    setReasonStr(mode === 'stock_in' ? 'New Delivery Arrival' : 'Spill / Expiration');
  };

  const handleConfirmStockMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItem) return;
    const qtyNum = parseFloat(changeQtyStr) || 0;
    const delta = movementMode === 'stock_in' ? qtyNum : -qtyNum;
    updateInventoryStock(stockItem.id, delta, movementMode, reasonStr);
    setStockItem(null);
  };

  const openRecipeEditor = (product: Product) => {
    setRecipeProduct(product);
    const existing = recipes
      .filter((r) => r.product_id === product.id)
      .map((r) => ({
        inventory_item_id: r.inventory_item_id,
        quantity_required: r.quantity_required,
      }));
    setRecipeLines(
      existing.length > 0
        ? existing
        : [{ inventory_item_id: inventory[0]?.id || '', quantity_required: 18 }]
    );
  };

  const handleSaveRecipe = () => {
    if (!recipeProduct) return;
    saveRecipe(recipeProduct.id, recipeLines);
    setRecipeProduct(null);
  };

  const handleAddInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    addInventoryItem({
      name: itemName,
      category: itemCategory,
      unit: itemUnit,
      current_stock: parseFloat(itemStockStr) || 0,
      min_stock_alert: parseFloat(itemMinAlertStr) || 10,
      cost_per_unit: parseFloat(itemCostStr) || 0,
      supplier_name: itemSupplier,
    });
    setIsAddItemModalOpen(false);
    setItemName('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2C1A0E]">Inventory & Recipe Control</h2>
          <p className="text-xs text-[#8C5338]">
            Monitor raw ingredients, record deliveries & waste, and configure automated sale recipe deductions.
          </p>
        </div>

        <button
          onClick={() => setIsAddItemModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-extrabold rounded-xl shadow hover:shadow-lg transition-all text-xs flex items-center gap-1.5 touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ingredient / Supply</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EFE4D6] pb-3">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'stock'
              ? 'bg-[#3D2314] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <Package className="w-4 h-4 text-[#D97706]" />
          <span>Stock Items ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'recipes'
              ? 'bg-[#3D2314] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#D97706]" />
          <span>Recipe Auto-Deduction</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-[#3D2314] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <History className="w-4 h-4 text-[#D97706]" />
          <span>Movement History ({inventoryMovements.length})</span>
        </button>
      </div>

      {/* TAB 1: STOCK ITEMS TABLE */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ingredient or supplier..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-medium focus:ring-2 focus:ring-[#D97706] outline-none"
            />
            <Search className="w-4 h-4 text-[#8C5338] absolute left-3 top-2.5" />
          </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#2A180D] text-white uppercase tracking-wider font-bold">
                    <th className="p-3.5">Ingredient Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Current Stock</th>
                    <th className="p-3.5">Cost / Unit</th>
                    <th className="p-3.5">Supplier</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE4D6]">
                  {filteredInventory.map((item) => {
                    const isLowStock = item.current_stock <= item.min_stock_alert;
                    return (
                      <tr key={item.id} className="hover:bg-[#FAF5EF]">
                        <td className="p-3.5 font-extrabold text-[#2C1A0E]">{item.name}</td>
                        <td className="p-3.5 text-[#6F3E28]">{item.category}</td>
                        <td className="p-3.5 font-mono font-bold text-sm">
                          {item.current_stock} {item.unit}
                        </td>
                        <td className="p-3.5 text-[#D97706] font-bold">
                          ₱{item.cost_per_unit.toFixed(2)} / {item.unit}
                        </td>
                        <td className="p-3.5 text-[#8C5338]">{item.supplier_name || 'N/A'}</td>
                        <td className="p-3.5">
                          {isLowStock ? (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-extrabold text-[10px] flex items-center gap-1 w-max border border-red-300">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> LOW STOCK
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> OK
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => openStockModal(item, 'stock_in')}
                            className="px-2.5 py-1.5 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 text-[11px] inline-flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" /> Stock In
                          </button>
                          <button
                            onClick={() => openStockModal(item, 'waste')}
                            className="px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 font-bold rounded-lg hover:bg-red-100 text-[11px] inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Record Waste
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECIPE AUTO-DEDUCTION MAPPING */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((prod) => {
            const mappedRecipes = recipes.filter((r) => r.product_id === prod.id);
            return (
              <div
                key={prod.id}
                className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-extrabold text-sm text-[#2C1A0E]">{prod.name}</h4>
                    <span className="text-xs font-bold text-[#D97706]">
                      {mappedRecipes.length} Ingredient(s)
                    </span>
                  </div>

                  <div className="bg-[#FAF5EF] p-3 rounded-xl border border-[#EFE4D6] space-y-1.5 text-xs">
                    {mappedRecipes.length === 0 ? (
                      <p className="text-gray-400 italic">No recipe ingredients configured.</p>
                    ) : (
                      mappedRecipes.map((r) => {
                        const invItem = inventory.find((i) => i.id === r.inventory_item_id);
                        return (
                          <div key={r.id} className="flex justify-between text-[#6F3E28] font-medium">
                            <span>• {invItem?.name || 'Item'}</span>
                            <span className="font-bold text-[#2C1A0E]">
                              {r.quantity_required} {invItem?.unit}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <button
                  onClick={() => openRecipeEditor(prod)}
                  className="mt-4 w-full py-2 bg-[#3D2314] text-white font-bold rounded-xl hover:bg-[#4A2E19] text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Edit Product Recipe</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: MOVEMENT HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#2A180D] text-white uppercase tracking-wider font-bold">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Ingredient</th>
                  <th className="p-3.5">Movement Type</th>
                  <th className="p-3.5">Qty Change</th>
                  <th className="p-3.5">Stock Level</th>
                  <th className="p-3.5">Reason / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE4D6]">
                {inventoryMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No stock movement history recorded yet.
                    </td>
                  </tr>
                ) : (
                  inventoryMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-[#FAF5EF]">
                      <td className="p-3.5 text-gray-500 font-mono">
                        {new Date(mov.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold text-[#2C1A0E]">{mov.inventory_item_name}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                            mov.movement_type === 'stock_in'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mov.movement_type === 'sale_deduction'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {mov.movement_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold font-mono">
                        {mov.quantity_changed > 0 ? (
                          <span className="text-emerald-700">+{mov.quantity_changed}</span>
                        ) : (
                          <span className="text-red-600">{mov.quantity_changed}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-gray-600">
                        {mov.previous_stock} → <strong className="text-black">{mov.new_stock}</strong>
                      </td>
                      <td className="p-3.5 text-[#8C5338]">{mov.reason || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock In / Waste Modal */}
      {stockItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full p-6 border border-[#EFE4D6] shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-[#2C1A0E]">
              {movementMode === 'stock_in' ? 'Record Stock Delivery' : 'Record Waste / Damaged Items'}
            </h3>
            <p className="text-xs text-[#8C5338]">
              Target: <span className="font-bold text-black">{stockItem.name}</span> (Current Stock:{' '}
              {stockItem.current_stock} {stockItem.unit})
            </p>

            <form onSubmit={handleConfirmStockMovement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">
                  Quantity ({stockItem.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={changeQtyStr}
                  onChange={(e) => setChangeQtyStr(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-base font-extrabold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={reasonStr}
                  onChange={(e) => setReasonStr(e.target.value)}
                  placeholder="e.g. Supplier invoice #, spilled during prep..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockItem(null)}
                  className="flex-1 py-3 bg-white border border-[#D0C7B9] text-[#3D2314] font-bold rounded-xl text-xs hover:bg-[#FAF5EF]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`flex-1 py-3 font-bold rounded-xl text-xs text-white shadow ${
                    movementMode === 'stock_in' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Save Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipe Editor Modal */}
      {recipeProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full p-6 border border-[#EFE4D6] shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-[#2C1A0E]">
              Configure Recipe for {recipeProduct.name}
            </h3>
            <p className="text-xs text-[#8C5338]">
              Ingredients listed below will be automatically deducted from inventory whenever this item is ordered.
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {recipeLines.map((line, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={line.inventory_item_id}
                    onChange={(e) => {
                      const newLines = [...recipeLines];
                      newLines[idx].inventory_item_id = e.target.value;
                      setRecipeLines(newLines);
                    }}
                    className="flex-1 p-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-semibold outline-none"
                  >
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({inv.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="0.1"
                    value={line.quantity_required}
                    onChange={(e) => {
                      const newLines = [...recipeLines];
                      newLines[idx].quantity_required = parseFloat(e.target.value) || 0;
                      setRecipeLines(newLines);
                    }}
                    className="w-24 p-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-bold outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setRecipeLines(recipeLines.filter((_, i) => i !== idx))}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setRecipeLines([
                    ...recipeLines,
                    { inventory_item_id: inventory[0]?.id || '', quantity_required: 1 },
                  ])
                }
                className="py-2 px-3 bg-[#FAF5EF] border border-[#D0C7B9] text-[#3D2314] font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Add Ingredient Line</span>
              </button>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#EFE4D6]">
              <button
                type="button"
                onClick={() => setRecipeProduct(null)}
                className="flex-1 py-3 bg-white border border-[#D0C7B9] text-[#3D2314] font-bold rounded-xl text-xs hover:bg-[#FAF5EF]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRecipe}
                className="flex-1 py-3 bg-[#D97706] text-white font-bold rounded-xl text-xs hover:bg-[#B45309] shadow"
              >
                Save Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Ingredient Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full p-6 border border-[#EFE4D6] shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-[#2C1A0E]">Add New Ingredient / Supply</h3>

            <form onSubmit={handleAddInventoryItem} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  placeholder="e.g. Arabica Roast Beans"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6F3E28] mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                  >
                    <option value="Coffee Beans">Coffee Beans</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Syrups">Syrups</option>
                    <option value="Ingredients">Ingredients</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Supplies">Supplies</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6F3E28] mb-1">Unit</label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                  >
                    <option value="g">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="packs">Packs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6F3E28] mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={itemStockStr}
                    onChange={(e) => setItemStockStr(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6F3E28] mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    value={itemMinAlertStr}
                    onChange={(e) => setItemMinAlertStr(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Cost Per Unit (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemCostStr}
                  onChange={(e) => setItemCostStr(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={itemSupplier}
                  onChange={(e) => setItemSupplier(e.target.value)}
                  placeholder="e.g. Cordillera Roastery"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-[#D0C7B9] text-[#3D2314] font-bold rounded-xl text-xs hover:bg-[#FAF5EF]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#D97706] text-white font-bold rounded-xl text-xs hover:bg-[#B45309] shadow"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
