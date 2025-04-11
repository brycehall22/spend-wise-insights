
import PageTemplate from "./PageTemplate";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

export default function Calendar() {
  return (
    <PageTemplate 
      title="Financial Calendar" 
      subtitle="View and manage upcoming bills and financial events"
    >
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
            <CalendarIcon size={48} className="text-spendwise-orange" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Financial Calendar</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            This page will display your upcoming bills, payments, and financial events in a calendar view.
          </p>
        </div>
      </Card>
    </PageTemplate>
  );
}
