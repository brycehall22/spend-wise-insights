
import PageTemplate from "./PageTemplate";
import { Card } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export default function Analytics() {
  return (
    <PageTemplate 
      title="Financial Analytics" 
      subtitle="Gain insights into your spending patterns and financial health"
    >
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
            <LineChart size={48} className="text-spendwise-orange" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Financial Analytics Dashboard</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            This page will provide in-depth analysis of your financial data with interactive charts and insights.
          </p>
        </div>
      </Card>
    </PageTemplate>
  );
}
