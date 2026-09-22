import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Award,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { orders, expenses, products, categories } = useStore();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');

  // Filter completed non-cancelled/refunded orders
  const validOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded');

  // Filter by period
  const filterOrdersByPeriod = () => {
    const now = new Date();
    return validOrders.filter((o) => {
      const oDate = new Date(o.created_at);
      if (period === 'today') {
        return oDate.toDateString() === now.toDateString();
      }
      if (period === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
        return oDate >= oneWeekAgo;
      }
      if (period === 'month') {
        return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
      }
      if (period === 'year') {
        return oDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const periodOrders = filterOrdersByPeriod();

  // Financial Metrics
  const grossSales = periodOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalDiscounts = periodOrders.reduce((sum, o) => sum + o.discount_amount, 0);
  const netSales = periodOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalOrdersCount = periodOrders.length;
  const averageOrderValue = totalOrdersCount > 0 ? netSales / totalOrdersCount : 0;

  // Total Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // COGS estimate (~30% of gross sales standard for coffee roasteries)
  const estimatedCogs = grossSales * 0.3;
  const grossProfit = netSales - estimatedCogs;
  const netProfit = grossProfit - totalExpenses;

  // Chart 1: Sales by Payment Method
  const paymentBreakdown = [
    {
      name: 'Cash',
      value: periodOrders
        .filter((o) => o.payment?.payment_method === 'cash')
        .reduce((sum, o) => sum + o.total_amount, 0),
      color: '#D97706',
    },
    {
      name: 'GCash',
      value: periodOrders
        .filter((o) => o.payment?.payment_method === 'gcash')
        .reduce((sum, o) => sum + o.total_amount, 0),
      color: '#2563EB',
    },
    {
      name: 'Card / E-Wallet',
      value: periodOrders
        .filter((o) => o.payment?.payment_method === 'card' || o.payment?.payment_method === 'ewallet')
        .reduce((sum, o) => sum + o.total_amount, 0),
      color: '#059669',
    },
  ];

  // Chart 2: Product Performance Ranking
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  periodOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSalesMap[item.product_name]) {
        productSalesMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
      }
      productSalesMap[item.product_name].qty += item.quantity;
      productSalesMap[item.product_name].revenue += item.total_price;
    });
  });

  const rankedProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);
  const bestSellers = rankedProducts.slice(0, 5);
  const leastSellers = [...rankedProducts].reverse().slice(0, 5);

  // Chart 3: Category Revenue Breakdown
  const categoryChartData = categories.map((cat) => {
    const catProductNames = new Set(
      products.filter((p) => p.category_id === cat.id).map((p) => p.name)
    );
    let rev = 0;
    periodOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (catProductNames.has(item.product_name)) {
          rev += item.total_price;
        }
      });
    });
    return { name: cat.name, Sales: rev };
  });

  // Export CSV Report
  const handleExportCSV = () => {
    const csvRows = [
      ['8307 COFFEE POS - FINANCIAL SALES REPORT'],
      ['Report Period', period.toUpperCase()],
      ['Generated At', new Date().toLocaleString()],
      [''],
      ['METRIC', 'AMOUNT (PHP)'],
      ['Gross Sales', grossSales.toFixed(2)],
      ['Total Discounts', totalDiscounts.toFixed(2)],
      ['Net Sales', netSales.toFixed(2)],
      ['Total Orders', totalOrdersCount],
      ['Average Order Value (AOV)', averageOrderValue.toFixed(2)],
      ['Est. Cost of Goods Sold (COGS)', estimatedCogs.toFixed(2)],
      ['Total Expenses', totalExpenses.toFixed(2)],
      ['Estimated Gross Profit', grossProfit.toFixed(2)],
      ['Estimated Net Profit', netProfit.toFixed(2)],
      [''],
      ['PRODUCT SALES BREAKDOWN'],
      ['Product Name', 'Units Sold', 'Total Revenue'],
      ...rankedProducts.map((p) => [p.name, p.qty, p.revenue.toFixed(2)]),
    ];

    const csvContent = csvRows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `8307_Coffee_SalesReport_${period}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#2C1A0E]">Sales Reports & Analytics</h2>
          <p className="text-xs text-[#8C5338]">
            Comprehensive financial performance, payment method breakdown, best sellers, and gross profit insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D0C7B9]">
            {(['today', 'week', 'month', 'year', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  period === p
                    ? 'bg-[#3D2314] text-white shadow-sm'
                    : 'text-[#8C5338] hover:text-[#2C1A0E]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white font-extrabold rounded-xl shadow transition-all text-xs flex items-center gap-1.5 touch-press"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Sales */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE4D6] shadow-sm">
          <p className="text-xs font-extrabold text-[#8C5338] uppercase tracking-wider">
            Total Net Sales
          </p>
          <h3 className="text-2xl font-black text-[#D97706] mt-1">
            ₱{netSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-[#A88B77] mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Gross Sales: ₱{grossSales.toFixed(2)}
          </p>
        </div>

        {/* Order Count */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE4D6] shadow-sm">
          <p className="text-xs font-extrabold text-[#8C5338] uppercase tracking-wider">
            Total Orders
          </p>
          <h3 className="text-2xl font-black text-[#2C1A0E] mt-1">{totalOrdersCount}</h3>
          <p className="text-[11px] text-[#A88B77] mt-1 font-semibold">
            Avg Order Value (AOV): ₱{averageOrderValue.toFixed(2)}
          </p>
        </div>

        {/* Gross Profit */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE4D6] shadow-sm">
          <p className="text-xs font-extrabold text-[#8C5338] uppercase tracking-wider">
            Est. Gross Profit
          </p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">
            ₱{grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-[#A88B77] mt-1 font-semibold">
            Less ~30% COGS (₱{estimatedCogs.toFixed(2)})
          </p>
        </div>

        {/* Net Operating Profit */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE4D6] shadow-sm">
          <p className="text-xs font-extrabold text-[#8C5338] uppercase tracking-wider">
            Est. Net Profit
          </p>
          <h3
            className={`text-2xl font-black mt-1 ${
              netProfit >= 0 ? 'text-emerald-800' : 'text-red-600'
            }`}
          >
            ₱{netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-[#A88B77] mt-1 font-semibold">
            Expenses Logged: ₱{totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue by Category Bar Chart */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE4D6] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-[#2C1A0E]">Revenue by Menu Category</h4>
            <BarChart3 className="w-4 h-4 text-[#D97706]" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE4D6" />
                <XAxis dataKey="name" stroke="#8C5338" fontSize={11} />
                <YAxis stroke="#8C5338" fontSize={11} />
                <Tooltip
                  formatter={(value: any) => [`₱${Number(value).toFixed(2)}`, 'Sales']}
                  contentStyle={{ backgroundColor: '#FFFDF9', borderRadius: '12px' }}
                />
                <Bar dataKey="Sales" fill="#D97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Payment Method Breakdown Pie Chart */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE4D6] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-[#2C1A0E]">Sales by Payment Method</h4>
            <PieIcon className="w-4 h-4 text-[#D97706]" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`₱${Number(value).toFixed(2)}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 text-xs font-bold">
            {paymentBreakdown.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span>
                  {item.name}: ₱{item.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Rankings Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE4D6] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-[#2C1A0E] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D97706]" />
              Top 5 Best-Selling Menu Items
            </h4>
          </div>

          <div className="space-y-2">
            {bestSellers.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No sales recorded yet.</p>
            ) : (
              bestSellers.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#FAF5EF] rounded-xl border border-[#EFE4D6] flex justify-between items-center text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#D97706] text-white flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="text-[#2C1A0E]">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#D97706]">₱{item.revenue.toFixed(2)}</span>
                    <span className="text-[11px] text-gray-500 font-normal ml-2">
                      ({item.qty} sold)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Least Sellers */}
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE4D6] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-[#2C1A0E]">
              Least-Selling Menu Items (Needs Promotion)
            </h4>
          </div>

          <div className="space-y-2">
            {leastSellers.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No sales recorded yet.</p>
            ) : (
              leastSellers.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-[#E5E0D8] flex justify-between items-center text-xs font-bold"
                >
                  <span className="text-[#6F3E28]">{item.name}</span>
                  <div className="text-right">
                    <span className="text-gray-700">₱{item.revenue.toFixed(2)}</span>
                    <span className="text-[11px] text-gray-500 font-normal ml-2">
                      ({item.qty} sold)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
