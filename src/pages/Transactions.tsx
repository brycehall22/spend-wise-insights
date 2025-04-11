
import PageTemplate from "./PageTemplate";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function Transactions() {
  return (
    <PageTemplate 
      title="Transactions" 
      subtitle="Track and manage all of your financial transactions"
    >
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
            <Wallet size={48} className="text-spendwise-orange" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Transaction Management</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            This page will allow you to view, filter, and manage all your financial transactions.
          </p>
        </div>
      </Card>
    </PageTemplate>
  );
}
