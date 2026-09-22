import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Customer } from '../../types/pos';
import { Plus, Phone, Mail, Gift, Search, History } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, redeemLoyaltyPoints, orders } = useStore();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    });
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
  };

  const handleRedeemPointsPrompt = (cust: Customer) => {
    if (cust.loyalty_points < 10) {
      alert(`Customer ${cust.name} needs at least 10 loyalty points to redeem rewards.`);
      return;
    }
    const pointsToRedeem = 10;
    const ok = redeemLoyaltyPoints(cust.id, pointsToRedeem);
    if (ok) {
      alert(`Successfully redeemed 10 points for customer ${cust.name}! (₱10 Reward Applied)`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2C1A0E]">Customer & Loyalty System</h2>
          <p className="text-xs text-[#8C5338]">
            Manage customer contacts, view visit history, and award loyalty points (+1 point per ₱50 spent).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-extrabold rounded-xl shadow hover:shadow-lg transition-all text-xs flex items-center gap-1.5 touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer Profile</span>
        </button>
      </div>

      {/* Rules Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4 text-xs text-amber-950 font-medium">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center font-bold text-lg">
            🎁
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[#2C1A0E]">8307 Loyalty Rewards Program</h4>
            <p className="text-[#8C5338]">
              Earn 1 Loyalty Point for every ₱50 spent. Redeem 10 points for ₱10 off any order.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone, or email..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-medium focus:ring-2 focus:ring-[#D97706] outline-none"
        />
        <Search className="w-4 h-4 text-[#8C5338] absolute left-3 top-2.5" />
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          return (
            <div
              key={cust.id}
              className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#D97706] transition-all"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-base text-[#2C1A0E]">{cust.name}</h4>
                    <p className="text-xs text-[#8C5338] flex items-center gap-1 mt-0.5 font-medium">
                      <Phone className="w-3 h-3 text-[#D97706]" /> {cust.phone}
                    </p>
                    {cust.email && (
                      <p className="text-[11px] text-[#A88B77] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {cust.email}
                      </p>
                    )}
                  </div>

                  {/* Points Badge */}
                  <div className="px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-center shadow-xs">
                    <div className="text-[10px] uppercase font-bold text-amber-900">Points</div>
                    <div className="text-lg font-black text-[#D97706] leading-none">
                      {cust.loyalty_points}
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-[#FAF5EF] p-3 rounded-xl border border-[#EFE4D6] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#8C5338] font-semibold block">Total Spent:</span>
                    <span className="font-extrabold text-[#D97706]">₱{cust.total_spent.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C5338] font-semibold block">Visits/Orders:</span>
                    <span className="font-bold text-[#2C1A0E]">{cust.total_orders} Order(s)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFE4D6] flex gap-2">
                <button
                  onClick={() => setSelectedCustomerForHistory(cust)}
                  className="flex-1 py-2 bg-white border border-[#D0C7B9] text-[#3D2314] font-bold rounded-xl text-xs hover:bg-[#FAF5EF] flex items-center justify-center gap-1"
                >
                  <History className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Order History</span>
                </button>

                <button
                  onClick={() => handleRedeemPointsPrompt(cust)}
                  className="py-2 px-3 bg-[#D97706] text-white font-bold rounded-xl text-xs hover:bg-[#B45309] shadow flex items-center justify-center gap-1 touch-press"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Redeem</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full p-6 border border-[#EFE4D6] shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-[#2C1A0E]">Create Customer Profile</h3>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Customer Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Maria Santos"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="e.g. 09171234567"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. maria@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-[#D0C7B9] text-[#3D2314] font-bold rounded-xl text-xs hover:bg-[#FAF5EF]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#D97706] text-white font-bold rounded-xl text-xs hover:bg-[#B45309] shadow"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Order History Modal */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full p-6 border border-[#EFE4D6] shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <h3 className="text-lg font-extrabold text-[#2C1A0E]">
              Order History: {selectedCustomerForHistory.name}
            </h3>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {orders.filter(
                (o) =>
                  o.customer_id === selectedCustomerForHistory.id ||
                  (o.customer_name &&
                    o.customer_name.toLowerCase() === selectedCustomerForHistory.name.toLowerCase())
              ).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No past orders associated yet.</p>
              ) : (
                orders
                  .filter(
                    (o) =>
                      o.customer_id === selectedCustomerForHistory.id ||
                      (o.customer_name &&
                        o.customer_name.toLowerCase() === selectedCustomerForHistory.name.toLowerCase())
                  )
                  .map((o) => (
                    <div key={o.id} className="p-3 bg-[#FAF5EF] rounded-xl border border-[#EFE4D6] text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{o.order_number}</span>
                        <span className="text-[#D97706]">₱{o.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {new Date(o.created_at).toLocaleString()} • {o.items.length} item(s)
                      </div>
                    </div>
                  ))
              )}
            </div>

            <button
              onClick={() => setSelectedCustomerForHistory(null)}
              className="w-full py-2.5 bg-[#3D2314] text-white font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
