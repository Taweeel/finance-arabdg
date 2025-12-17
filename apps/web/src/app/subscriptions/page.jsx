import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, RefreshCw } from "lucide-react";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      if (data.subscriptions) {
        setSubscriptions(data.subscriptions);
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <DashboardLayout activeItem="subscriptions">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
            <p className="text-gray-500 dark:text-gray-400">Track recurring expenses</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} />
            Add Subscription
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3 font-medium">Service Name</th>
                  <th className="px-6 py-3 font-medium">Provider</th>
                  <th className="px-6 py-3 font-medium">Cost</th>
                  <th className="px-6 py-3 font-medium">Billing Cycle</th>
                  <th className="px-6 py-3 font-medium">Next Billing</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No subscriptions found.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {sub.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {sub.provider || "-"}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(sub.amount, sub.currency)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 capitalize">
                        <div className="flex items-center gap-2">
                          <RefreshCw size={14} className="text-gray-400" />
                          {sub.billing_cycle}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${sub.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
