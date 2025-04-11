
import { mockTransactions } from "@/lib/mockData";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function RecentTransactions() {
  // Get the 5 most recent transactions
  const recentTransactions = [...mockTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="budget-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-spendwise-oxford">Recent Transactions</h2>
        <a href="/transactions" className="text-sm text-spendwise-orange hover:underline">View All</a>
      </div>

      <div className="divide-y">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${
                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'income' ? (
                  <ArrowUpRight size={16} className="text-green-600" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-xs text-gray-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={`font-semibold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
