import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Minus, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function PettyCashPage() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/petty-cash");
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
        setBalance(data.balance);
      }
    } catch (err) {
      console.error("Failed to fetch petty cash:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <DashboardLayout activeItem="petty-cash">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Petty Cash</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage daily operational expenses</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Minus size={20} />
              Withdraw
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus size={20} />
              Deposit
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 border-l-4 border-blue-500">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Current Balance
          </h2>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(balance)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {tx.description || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 font-medium
                          ${tx.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {tx.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold
                        ${tx.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.type === 'withdrawal' && "-"}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                        {tx.recorded_by_name || "-"}
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
