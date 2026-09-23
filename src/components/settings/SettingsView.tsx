import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Discount } from '../../types/pos';
import {
  Store,
  CreditCard,
  FileText,
  ShieldCheck,
  Download,
  RotateCcw,
  CheckCircle2,
  Tag,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    activityLogs,
    resetToSampleData,
    logActivity,
    discounts,
    addDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountActive,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'discounts' | 'receipt' | 'logs'>('profile');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form State - Shop Settings
  const [shopName, setShopName] = useState<string>(settings.shop_name);
  const [tagline, setTagline] = useState<string>(settings.tagline);
  const [address, setAddress] = useState<string>(settings.address);
  const [phone, setPhone] = useState<string>(settings.phone);
  const [email, setEmail] = useState<string>(settings.email);
  const [taxRate, setTaxRate] = useState<string>(settings.tax_rate.toString());
  const [serviceChargeRate, setServiceChargeRate] = useState<string>(
    settings.service_charge_rate.toString()
  );
  const [gcashNumber, setGcashNumber] = useState<string>(settings.gcash_number);
  const [mayaNumber, setMayaNumber] = useState<string>(settings.maya_number);
  const [receiptHeader, setReceiptHeader] = useState<string>(settings.receipt_header);
  const [receiptFooter, setReceiptFooter] = useState<string>(settings.receipt_footer);

  // Discount Modal Form State
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [discName, setDiscName] = useState<string>('');
  const [discCode, setDiscCode] = useState<string>('');
  const [discType, setDiscType] = useState<'percentage' | 'fixed' | 'senior_pwd'>('percentage');
  const [discValue, setDiscValue] = useState<string>('');
  const [discIsActive, setDiscIsActive] = useState<boolean>(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shop_name: shopName,
      tagline,
      address,
      phone,
      email,
      tax_rate: parseFloat(taxRate) || 0,
      service_charge_rate: parseFloat(serviceChargeRate) || 0,
      gcash_number: gcashNumber,
      maya_number: mayaNumber,
      receipt_header: receiptHeader,
      receipt_footer: receiptFooter,
    });
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      backup_timestamp: new Date().toISOString(),
      settings,
      discounts,
      activityLogs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `8307_Coffee_POS_Backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    logActivity('Backup Exported', 'Admin downloaded system database JSON backup.');
  };

  // Discount Modal Helpers
  const openAddDiscountModal = () => {
    setEditingDiscount(null);
    setDiscName('');
    setDiscCode('');
    setDiscType('percentage');
    setDiscValue('');
    setDiscIsActive(true);
    setShowDiscountModal(true);
  };

  const openEditDiscountModal = (d: Discount) => {
    setEditingDiscount(d);
    setDiscName(d.name);
    setDiscCode(d.code || '');
    setDiscType(d.discount_type);
    setDiscValue(d.value.toString());
    setDiscIsActive(d.is_active);
    setShowDiscountModal(true);
  };

  const handleSaveDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(discValue) || 0;
    if (!discName.trim()) return;

    if (editingDiscount) {
      updateDiscount(editingDiscount.id, {
        name: discName.trim(),
        code: discCode.trim() || undefined,
        discount_type: discType,
        value: valNum,
        is_active: discIsActive,
      });
      setSuccessMsg(`Updated discount "${discName.trim()}"`);
    } else {
      addDiscount({
        name: discName.trim(),
        code: discCode.trim() || undefined,
        discount_type: discType,
        value: valNum,
        is_active: discIsActive,
      });
      setSuccessMsg(`Added discount "${discName.trim()}"`);
    }
    setShowDiscountModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteDiscount = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the discount "${name}"?`)) {
      deleteDiscount(id);
      setSuccessMsg(`Deleted discount "${name}"`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2C1A0E]">System Settings & Audit Logs</h2>
          <p className="text-xs text-[#8C5338]">
            Configure store metadata, tax rates, payment accounts, discounts & promos, thermal receipts, and view audit trail.
          </p>
        </div>

        {successMsg && (
          <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-300 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#EFE4D6] pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'profile'
              ? 'bg-[#3D2314] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <Store className="w-4 h-4 text-[#D97706]" />
          <span>Shop Profile & Taxes</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'payments'
              ? 'bg-[#3D2314] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <CreditCard className="w-4 h-4 text-[#D97706]" />
          <span>Payment Methods</span>
        </button>

        <button
          onClick={() => setActiveTab('discounts')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'discounts'
              ? 'bg-[#3D2314] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <Tag className="w-4 h-4 text-[#D97706]" />
          <span>Discounts & Promos ({discounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('receipt')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'receipt'
              ? 'bg-[#3D2314] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#D97706]" />
          <span>Receipt Layout</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'logs'
              ? 'bg-[#3D2314] text-white shadow-md'
              : 'bg-white text-[#6F3E28] hover:bg-[#FAF5EF] border border-[#EFE4D6]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#D97706]" />
          <span>Activity Log ({activityLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: PROFILE & TAXES */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#2C1A0E] uppercase tracking-wider">
              Store Profile Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Shop Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-semibold outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-[#6F3E28] mb-1">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Support Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#2C1A0E] uppercase tracking-wider">
              Tax Rates & Service Charge
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
                <p className="text-[10px] text-[#A88B77] mt-1">
                  Enter 0 for VAT-exempt prices or e.g. 12 for 12% tax.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Service Charge (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={serviceChargeRate}
                  onChange={(e) => setServiceChargeRate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
                <p className="text-[10px] text-[#A88B77] mt-1">
                  Enter 0 if no service charge is added to bills.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-2xl shadow text-sm transition-all"
          >
            Save Store Settings
          </button>
        </form>
      )}

      {/* TAB 2: PAYMENT METHODS */}
      {activeTab === 'payments' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#2C1A0E] uppercase tracking-wider">
              E-Wallet Merchant Numbers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">GCash Account Number</label>
                <input
                  type="text"
                  value={gcashNumber}
                  onChange={(e) => setGcashNumber(e.target.value)}
                  placeholder="09XXXXXXXXX"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Maya Account Number</label>
                <input
                  type="text"
                  value={mayaNumber}
                  onChange={(e) => setMayaNumber(e.target.value)}
                  placeholder="09XXXXXXXXX"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-2xl shadow text-sm transition-all"
          >
            Save Payment Settings
          </button>
        </form>
      )}

      {/* TAB 3: DISCOUNTS & PROMOS MANAGEMENT */}
      {activeTab === 'discounts' && (
        <div className="space-y-6">
          {/* Top Bar */}
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-[#2C1A0E]">Customize Discounts & Promos</h3>
              <p className="text-xs text-[#8C5338]">
                Add, edit, or remove discounts available for cashier selection during checkout. Changes sync live across all terminals.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddDiscountModal}
              className="px-4 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-all touch-press"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Discount</span>
            </button>
          </div>

          {/* Discounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discounts.map((disc) => (
              <div
                key={disc.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 bg-[#FFFDF9] ${
                  disc.is_active
                    ? 'border-[#EFE4D6] shadow-sm'
                    : 'border-gray-200 opacity-60 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#2C1A0E]">{disc.name}</h4>
                      {disc.code && (
                        <span className="px-2 py-0.5 rounded-md bg-[#D97706]/15 text-[#B45309] font-black text-[10px] uppercase">
                          {disc.code}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-[#8C5338]">
                      {disc.discount_type === 'percentage' || disc.discount_type === 'senior_pwd'
                        ? `${disc.value}% Percentage Discount`
                        : `₱${disc.value.toFixed(2)} Fixed Off`}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDiscountActive(disc.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all ${
                      disc.is_active
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-gray-200 text-gray-700 border-gray-300'
                    }`}
                  >
                    {disc.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>

                <div className="pt-2 border-t border-[#EFE4D6] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#A88B77] italic">
                    Type: {disc.discount_type === 'senior_pwd' ? 'Senior / PWD' : disc.discount_type}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditDiscountModal(disc)}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold flex items-center gap-1 transition-all"
                      title="Edit Discount"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDiscount(disc.id, disc.name)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold flex items-center gap-1 transition-all"
                      title="Delete Discount"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RECEIPT LAYOUT */}
      {activeTab === 'receipt' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#2C1A0E] uppercase tracking-wider">
              Thermal Receipt Custom Text
            </h3>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Receipt Header Greeting</label>
                <textarea
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Receipt Footer Note</label>
                <textarea
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                ></textarea>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-2xl shadow text-sm transition-all"
          >
            Save Receipt Messages
          </button>
        </form>
      )}

      {/* TAB 5: AUDIT LOGS & BACKUP */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Backup & Data Reset Bar */}
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-sm text-[#2C1A0E]">Data Backup & Reset Tools</h4>
              <p className="text-xs text-[#8C5338]">
                Export JSON database snapshots or reset to initial sample coffee shop state.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-4 py-2.5 bg-[#3D2314] text-white font-bold rounded-xl text-xs hover:bg-[#4A2E19] flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4 text-[#D97706]" />
                <span>Export System JSON Backup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data to default sample state?')) {
                    resetToSampleData();
                  }
                }}
                className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl text-xs hover:bg-red-100 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Sample Data</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#2A180D] text-white uppercase tracking-wider font-bold">
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Details</th>
                    <th className="p-3.5">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE4D6]">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF5EF]">
                      <td className="p-3.5 text-gray-500 font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold text-[#2C1A0E]">{log.action}</td>
                      <td className="p-3.5 text-[#6F3E28]">{log.details}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                          {log.performed_by}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT DISCOUNT MODAL */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#EFE4D6] max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#EFE4D6] pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-black text-lg text-[#2C1A0E]">
                  {editingDiscount ? 'Edit Discount / Promo' : 'Add New Discount'}
                </h3>
              </div>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="p-1.5 rounded-full hover:bg-[#EFE4D6] text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Discount Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Employee Discount 30%"
                  value={discName}
                  onChange={(e) => setDiscName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C7B9] bg-white font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Promo Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. EMP30"
                  value={discCode}
                  onChange={(e) => setDiscCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C7B9] bg-white font-mono uppercase outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#6F3E28] mb-1">Discount Type</label>
                  <select
                    value={discType}
                    onChange={(e) => setDiscType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C7B9] bg-white font-semibold outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₱)</option>
                    <option value="senior_pwd">Senior / PWD (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6F3E28] mb-1">
                    Value ({discType === 'fixed' ? '₱ Amount' : '% Percent'}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder={discType === 'fixed' ? '50' : '20'}
                    value={discValue}
                    onChange={(e) => setDiscValue(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0C7B9] bg-white font-extrabold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="discIsActive"
                  checked={discIsActive}
                  onChange={(e) => setDiscIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#D97706] rounded"
                />
                <label htmlFor="discIsActive" className="font-bold text-[#2C1A0E] cursor-pointer">
                  Active (Show during checkout)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE4D6]">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D0C7B9] text-gray-700 font-bold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold shadow"
                >
                  {editingDiscount ? 'Save Changes' : 'Create Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
