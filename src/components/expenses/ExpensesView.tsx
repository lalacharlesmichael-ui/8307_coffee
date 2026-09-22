import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Expense } from '../../types/pos';
import { Plus, Trash2, Search } from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<Expense['category']>('Utilities');
  const [amountStr, setAmountStr] = useState<string>('1500');
  const [expenseDate, setExpenseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');

  const filteredExpenses = expenses.filter((e) => {
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      title,
      category,
      amount: parseFloat(amountStr) || 0,
      expense_date: expenseDate,
      notes,
    });
    setIsAddModalOpen(false);
    setTitle('');
  };

  const categoriesList: Expense['category'][] = [
    'Rent',
    'Utilities',
    'Supplies',
    'Salaries',
    'Maintenance',
    'Marketing',
    'Misc',
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2C1A0E]">Business Expense Tracker</h2>
          <p className="text-xs text-[#8C5338]">
            Log store operational expenses, utilities, payroll, and maintenance for profit calculations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-extrabold rounded-xl shadow hover:shadow-lg transition-all text-xs flex items-center gap-1.5 touch-press"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* KPI Card */}
      <div className="bg-[#3D2314] text-white p-6 rounded-3xl shadow-md border border-[#4A2E19] flex justify-between items-center">
        <div>
          <p className="text-xs text-[#C4A58E] font-bold uppercase tracking-wider">
            Total Operational Expenses Logged
          </p>
          <h3 className="text-3xl font-black text-[#D97706] mt-1">
            ₱{totalExpenseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-[#D97706]/20 text-[#D97706] flex items-center justify-center font-bold text-2xl">
          💳
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#3D2314] text-white'
                : 'bg-white border border-[#EFE4D6] text-[#6F3E28] hover:bg-[#FAF5EF]'
            }`}
          >
            All Categories
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#D97706] text-white'
                  : 'bg-white border border-[#EFE4D6] text-[#6F3E28] hover:bg-[#FAF5EF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-medium focus:ring-2 focus:ring-[#D97706] outline-none"
          />
          <Search className="w-4 h-4 text-[#8C5338] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#EFE4D6] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#2A180D] text-white uppercase tracking-wider font-bold">
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Title / Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE4D6]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No business expenses logged for this filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FAF5EF]">
                    <td className="p-3.5 text-gray-500 font-mono">{exp.expense_date}</td>
                    <td className="p-3.5 font-bold text-[#2C1A0E]">{exp.title}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-extrabold text-[10px] uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-extrabold text-[#D97706] text-sm">
                      ₱{exp.amount.toFixed(2)}
                    </td>
                    <td className="p-3.5 text-[#8C5338]">{exp.notes || '-'}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full p-6 border border-[#EFE4D6] shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-[#2C1A0E]">Record Business Expense</h3>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Expense Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Electric Bill August / Ice Delivery"
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6F3E28] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-semibold outline-none"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6F3E28] mb-1">Amount (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Expense Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D0C7B9] bg-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6F3E28] mb-1">Notes / Invoice Ref</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Receipt #99234"
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
