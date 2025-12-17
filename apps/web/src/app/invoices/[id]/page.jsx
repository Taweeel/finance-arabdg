"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function InvoiceDetailPage({ params }) {
  const [invoice, setInvoice] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadInvoice();
    }
  }, [params.id]);

  const loadInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`);
      const data = await res.json();
      setInvoice(data.invoice);
      setInstallments(data.installments || []);
      setPayments(data.payments || []);
    } catch (err) {
      console.error("Failed to load invoice:", err);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      issued: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      partially_paid:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <DashboardLayout activeItem="invoices">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-600 dark:text-gray-400">
            Loading invoice...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout activeItem="invoices">
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">Invoice not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const paidAmount = parseFloat(invoice.paid_amount || 0);
  const totalAmount = parseFloat(invoice.total_amount || 0);
  const remaining = totalAmount - paidAmount;
  const percentPaid = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <DashboardLayout activeItem="invoices">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Invoice {invoice.invoice_number}
            </h1>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}
            >
              {invoice.status.replace("_", " ")}
            </span>
          </div>
          <a
            href="/invoices"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to Invoices
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Client Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Client Name
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {invoice.client_name}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Invoice Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Issue Date
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(invoice.issue_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due Date
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(invoice.due_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Summary
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
                <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(paidAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining
                </p>
                <p className="text-xl font-semibold text-orange-600 dark:text-orange-400">
                  {formatCurrency(remaining)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {installments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Installments
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {installments.map((inst) => (
                    <tr key={inst.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        #{inst.installment_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {formatDate(inst.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {formatCurrency(inst.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inst.status)}`}
                        >
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
