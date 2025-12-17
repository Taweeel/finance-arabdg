import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeItem="dashboard">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const summary = stats?.summary || {};
  const expenses = stats?.expenses || {};
  const monthlyIncome = stats?.monthlyIncome || [];
  const incomeByClient = stats?.incomeByClient || [];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Expense breakdown for pie chart
  const expenseData = [
    { name: "Payroll", value: expenses.payroll || 0, color: "#3b82f6" },
    {
      name: "Subscriptions",
      value: expenses.subscriptions || 0,
      color: "#10b981",
    },
    { name: "Petty Cash", value: expenses.pettyCash || 0, color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  return (
    <DashboardLayout activeItem="dashboard">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your business finances
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Income */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Income / الدخل
              </span>
              <DollarSign className="text-green-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(summary.totalIncome)}
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
              <TrendingUp size={16} className="mr-1" />
              Revenue from payments
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Expenses / المصروفات
              </span>
              <TrendingDown className="text-red-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(summary.totalExpenses)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              All operating costs
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Net Profit
              </span>
              <DollarSign className="text-blue-500" size={24} />
            </div>
            <div
              className={`text-3xl font-bold ${summary.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {formatCurrency(summary.netProfit)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Income - Expenses
            </div>
          </div>

          {/* Outstanding */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Outstanding
              </span>
              <AlertCircle className="text-yellow-500" size={24} />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(summary.totalOutstanding)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {summary.outstandingInvoices} invoices unpaid
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-500" size={20} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Clients
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.activeClients || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-orange-500" size={20} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Invoices
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.outstandingInvoices || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Overdue Invoices
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.overdueInvoices || 0}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Income Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Income Trend
            </h3>
            {monthlyIncome.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyIncome}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No income data yet
              </div>
            )}
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Expense Breakdown / المصروفات
            </h3>
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No expense data yet
              </div>
            )}
          </div>
        </div>

        {/* Top Clients by Income */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Clients by Income
          </h3>
          {incomeByClient.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeByClient}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="client_name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="total_income" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No client income data yet
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
