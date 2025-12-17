"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar, Users, DollarSign, Check } from "lucide-react";

export default function PayrollDetailPage({ params }) {
  const [payrollRun, setPayrollRun] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadPayrollRun();
    }
  }, [params.id]);

  const loadPayrollRun = async () => {
    try {
      const res = await fetch(`/api/payroll/${params.id}`);
      const data = await res.json();
      setPayrollRun(data.payrollRun);
      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to load payroll run:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/payroll/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadPayrollRun();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const markItemPaid = async (itemId) => {
    try {
      const res = await fetch(`/api/payroll/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: itemId,
          payment_status: "paid",
          payment_date: new Date().toISOString().split("T")[0],
        }),
      });

      if (res.ok) {
        loadPayrollRun();
      }
    } catch (err) {
      console.error("Failed to mark as paid:", err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMonthName = (month) => {
    return new Date(2000, month - 1).toLocaleString("en-US", { month: "long" });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <DashboardLayout activeItem="payroll">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-600 dark:text-gray-400">
            Loading payroll run...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!payrollRun) {
    return (
      <DashboardLayout activeItem="payroll">
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">
              Payroll run not found
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalGross = items.reduce(
    (sum, item) => sum + parseFloat(item.gross_salary || 0),
    0,
  );
  const totalNet = items.reduce(
    (sum, item) => sum + parseFloat(item.net_salary || 0),
    0,
  );
  const paidCount = items.filter(
    (item) => item.payment_status === "paid",
  ).length;

  return (
    <DashboardLayout activeItem="payroll">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Payroll - {getMonthName(payrollRun.month)} {payrollRun.year}
            </h1>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(payrollRun.status)}`}
            >
              {payrollRun.status}
            </span>
          </div>
          <a
            href="/payroll"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to Payroll
          </a>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-blue-500" size={24} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Run Date
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatDate(payrollRun.run_date)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Created by {payrollRun.created_by_name || "System"}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-purple-500" size={24} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Employees
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {items.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {paidCount} paid, {items.length - paidCount} pending
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-green-500" size={24} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Net
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalNet)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gross: {formatCurrency(totalGross)}
            </div>
          </div>
        </div>

        {/* Actions */}
        {payrollRun.status === "draft" && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => updateStatus("approved")}
              disabled={updatingStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Approve Payroll
            </button>
          </div>
        )}

        {payrollRun.status === "approved" && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => updateStatus("paid")}
              disabled={updatingStatus}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Mark All as Paid
            </button>
          </div>
        )}

        {/* Employee Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Employee Payroll Items
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Gross Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Allowances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.employee_name}
                      </div>
                      {item.department && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.department}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {item.position || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                      {formatCurrency(item.gross_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 dark:text-green-400">
                      {formatCurrency(item.allowances)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 dark:text-red-400">
                      {formatCurrency(item.deductions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.net_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.payment_status)}`}
                      >
                        {item.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {item.payment_status === "pending" &&
                        payrollRun.status !== "draft" && (
                          <button
                            onClick={() => markItemPaid(item.id)}
                            className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                          >
                            <Check size={16} />
                            Mark Paid
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
