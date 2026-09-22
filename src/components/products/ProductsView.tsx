import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Product } from '../../types/pos';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FolderPlus,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    toggleProductAvailability,
    archiveProduct,
    addCategory,
    deleteCategory,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductModal, setIsNewProductModal] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);

  // Form State
  const [prodName, setProdName] = useState<string>('');
  const [prodCategoryId, setProdCategoryId] = useState<string>(categories[0]?.id || 'cat-1');
  const [prodPrice, setProdPrice] = useState<string>('120');
  const [prodDesc, setProdDesc] = useState<string>('');
  const [prodImage, setProdImage] = useState<string>('');
  const [prodEmoji, setProdEmoji] = useState<string>('☕');

  // Category Form State
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatSlug, setNewCatSlug] = useState<string>('');

  const filteredProducts = products.filter((p) => {
    if (p.is_archived) return false;
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openNewProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategoryId(categories[0]?.id || 'cat-1');
    setProdPrice('120');
    setProdDesc('');
    setProdImage(
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80'
    );
    setProdEmoji('☕');
    setIsNewProductModal(true);
  };

  const openEditProductForm = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategoryId(prod.category_id);
    setProdPrice(prod.base_price.toString());
    setProdDesc(prod.description);
    setProdImage(prod.image_url || '');
    setProdEmoji(prod.emoji_icon || '☕');
    setIsNewProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const basePriceNum = parseFloat(prodPrice) || 0;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: prodName,
        category_id: prodCategoryId,
        base_price: basePriceNum,
        description: prodDesc,
        image_url: prodImage,
        emoji_icon: prodEmoji,
      });
    } else {
      addProduct({
        name: prodName,
        category_id: prodCategoryId,
        base_price: basePriceNum,
        description: prodDesc,
        image_url: prodImage,
        emoji_icon: prodEmoji,
        is_available: true,
        variants: [
          { id: `var-${Date.now()}-1`, name: 'Small (8oz)', price_adjustment: 0, is_default: true },
          { id: `var-${Date.now()}-2`, name: 'Medium (12oz)', price_adjustment: 15 },
          { id: `var-${Date.now()}-3`, name: 'Large (16oz)', price_adjustment: 30 },
        ],
      });
    }

    setIsNewProductModal(false);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      slug: newCatSlug.trim() || newCatName.toLowerCase().replace(/\s+/g, '-'),
      icon: 'Coffee',
      display_order: categories.length + 1,
    });
    setNewCatName('');
    setNewCatSlug('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2C1A0E]">Product & Menu Management</h2>
          <p className="text-xs text-[#8C5338]">
            Configure drinks, snacks, meals, prices, size variants, and category tags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2.5 bg-white border border-[#D0C7B9] text-[#3D2314] font-bold rounded-xl text-xs hover:bg-[#FAF5EF] flex items-center gap-1.5 shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-[#D97706]" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={openNewProductForm}
            className="px-4 py-2.5 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-extrabold rounded-xl shadow hover:shadow-lg transition-all text-xs flex items-center gap-1.5 touch-press"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#3D2314] text-white'
                : 'bg-white border border-[#EFE4D6] text-[#6F3E28] hover:bg-[#FAF5EF]'
            }`}
          >
            All Categories ({products.filter((p) => !p.is_archived).length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-[#D97706] text-white'
                  : 'bg-white border border-[#EFE4D6] text-[#6F3E28] hover:bg-[#FAF5EF]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-medium focus:ring-2 focus:ring-[#D97706] outline-none"
          />
          <Search className="w-4 h-4 text-[#8C5338] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Product List Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((prod) => {
          const categoryObj = categories.find((c) => c.id === prod.category_id);
          return (
            <div
              key={prod.id}
              className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] shadow-sm overflow-hidden flex flex-col justify-between hover:border-[#D97706] transition-all"
            >
              <div>
                <div className="relative h-32 w-full bg-[#2A180D] flex items-center justify-center overflow-hidden border-b border-[#3D2314]">
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
                  <span className="text-4xl drop-shadow absolute pointer-events-none">
                    {prod.emoji_icon || '☕'}
                  </span>
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={() => toggleProductAvailability(prod.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow backdrop-blur-md ${
                        prod.is_available
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-red-600/90 text-white'
                      }`}
                    >
                      {prod.is_available ? 'IN STOCK' : 'SOLD OUT'}
                    </button>
                  </div>
                  {categoryObj && (
                    <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 text-white font-semibold text-[10px]">
                      {categoryObj.name}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-sm text-[#2C1A0E]">{prod.name}</h4>
                    <span className="font-black text-sm text-[#D97706]">
                      ₱{prod.base_price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-[#8C5338] line-clamp-2">{prod.description}</p>

                  {prod.variants && prod.variants.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1">
                      {prod.variants.map((v) => (
                        <span
                          key={v.id}
                          className="px-2 py-0.5 rounded-md bg-[#FAF5EF] border border-[#EFE4D6] text-[10px] text-[#6F3E28] font-medium"
                        >
                          {v.name} (+₱{v.price_adjustment})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-[#FAF5EF] border-t border-[#EFE4D6] flex justify-between items-center">
                <button
                  onClick={() => openEditProductForm(prod)}
                  className="px-3 py-1.5 bg-white border border-[#D0C7B9] text-[#3D2314] font-bold rounded-xl text-xs hover:bg-[#EFE4D6] flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => archiveProduct(prod.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  title="Archive Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isNewProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full p-6 border border-[#EFE4D6] shadow-2xl space-y-5">
            <h3 className="text-xl font-extrabold text-[#2C1A0E]">
              {editingProduct ? 'Edit Product Item' : 'Add New Product Item'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Product Name</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                  placeholder="e.g. Hazelnut Mocha"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-semibold focus:ring-2 focus:ring-[#D97706] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#6F3E28] mb-1">Category</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-semibold outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6F3E28] mb-1">Base Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Description</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  rows={2}
                  placeholder="Short description of taste notes and ingredients..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">
                  Image Link Address URL (Saved in Firestore)
                </label>
                <input
                  type="text"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/... or any web link"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Fallback Icon Badge</label>
                <div className="flex gap-2 flex-wrap">
                  {['☕', '🧋', '🧊', '🥤', '🍵', '🍫', '🥐', '🧇', '🍝', '🍳'].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setProdEmoji(icon)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg ${
                        prodEmoji === icon
                          ? 'bg-[#D97706] text-white border-[#D97706] shadow'
                          : 'bg-white border-[#D0C7B9] hover:bg-[#FAF5EF]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewProductModal(false)}
                  className="flex-1 py-3 bg-white border border-[#D0C7B9] text-[#3D2314] font-bold rounded-xl text-xs hover:bg-[#FAF5EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#D97706] text-white font-bold rounded-xl text-xs hover:bg-[#B45309] shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full p-6 border border-[#EFE4D6] shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-[#2C1A0E]">Product Category Manager</h3>

            <form onSubmit={handleCreateCategory} className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-medium outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#3D2314] text-white font-bold rounded-xl text-xs hover:bg-[#4A2E19]"
              >
                Add
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-white border border-[#E5E0D8] rounded-xl flex justify-between items-center text-xs font-bold"
                >
                  <span>{c.name}</span>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="w-full py-2.5 bg-[#FAF5EF] text-[#3D2314] font-bold rounded-xl text-xs border border-[#D0C7B9]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
