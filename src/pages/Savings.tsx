
import PageTemplate from "./PageTemplate";
import { Card } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";

export default function Savings() {
  return (
    <PageTemplate 
      title="Savings" 
      subtitle="Manage and optimize your savings accounts"
    >
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
            <PiggyBank size={48} className="text-spendwise-orange" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Savings Management</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            This page will help you track your savings accounts and optimize your saving strategy.
          </p>
        </div>
      </Card>
    </PageTemplate>
  );
}
