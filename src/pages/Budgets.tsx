
import PageTemplate from "./PageTemplate";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function Budgets() {
  return (
    <PageTemplate 
      title="Budget Management" 
      subtitle="Create and manage your monthly budgets"
    >
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
            <BarChart3 size={48} className="text-spendwise-orange" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Budget Planning</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            This page will allow you to create and manage budgets for different spending categories.
          </p>
        </div>
      </Card>
    </PageTemplate>
  );
}
