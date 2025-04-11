
import PageTemplate from "./PageTemplate";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function Goals() {
  return (
    <PageTemplate 
      title="Financial Goals" 
      subtitle="Set and track your financial goals"
    >
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
            <Target size={48} className="text-spendwise-orange" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Goal Setting & Tracking</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            This page will help you set financial goals and track your progress towards achieving them.
          </p>
        </div>
      </Card>
    </PageTemplate>
  );
}
