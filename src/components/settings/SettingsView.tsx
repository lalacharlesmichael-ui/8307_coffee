import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Store,
  CreditCard,
  FileText,
  ShieldCheck,
  Download,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    activityLogs,
    resetToSampleData,
    logActivity,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'receipt' | 'logs'>('profile');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form State
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2C1A0E]">System Settings & Audit Logs</h2>
          <p className="text-xs text-[#8C5338]">
            Configure store metadata, tax rates, payment accounts, thermal receipts, and view audit trail.
          </p>
        </div>

        {successMsg && (
          <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EFE4D6] pb-3">
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
              Financial Taxes & Service Charges
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">VAT Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">
                  Service Charge Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={serviceChargeRate}
                  onChange={(e) => setServiceChargeRate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-extrabold rounded-2xl shadow hover:shadow-lg transition-all text-sm touch-press"
          >
            Save Profile Settings
          </button>
        </form>
      )}

      {/* TAB 2: PAYMENT METHODS */}
      {activeTab === 'payments' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#2C1A0E] uppercase tracking-wider">
              Digital Payment Gateway Accounts
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">
                  GCash Merchant Mobile Number
                </label>
                <input
                  type="text"
                  value={gcashNumber}
                  onChange={(e) => setGcashNumber(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Maya Merchant Number</label>
                <input
                  type="text"
                  value={mayaNumber}
                  onChange={(e) => setMayaNumber(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D0C7B9] bg-white text-xs font-mono font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 bg-[#D97706] text-white font-bold rounded-2xl shadow text-sm"
          >
            Save Payment Gateway Settings
          </button>
        </form>
      )}

      {/* TAB 3: RECEIPT LAYOUT */}
      {activeTab === 'receipt' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#2C1A0E] uppercase tracking-wider">
              Thermal Receipt Messaging
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
            className="px-6 py-3.5 bg-[#D97706] text-white font-bold rounded-2xl shadow text-sm"
          >
            Save Receipt Messages
          </button>
        </form>
      )}

      {/* TAB 4: AUDIT LOGS & BACKUP */}
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
    </div>
  );
};
