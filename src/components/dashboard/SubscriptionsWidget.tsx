
import { mockSubscriptions } from "@/lib/mockData";
import { CalendarClock } from "lucide-react";

export default function SubscriptionsWidget() {
  return (
    <div className="budget-card animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Upcoming Subscriptions</h2>

      <div className="space-y-3">
        {mockSubscriptions.map((subscription) => {
          const nextPaymentDate = new Date(subscription.nextPayment);
          const formattedDate = nextPaymentDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          // Calculate days remaining
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const paymentDay = new Date(subscription.nextPayment);
          paymentDay.setHours(0, 0, 0, 0);
          
          const daysRemaining = Math.ceil((paymentDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let statusColor = "text-gray-500";
          if (daysRemaining <= 3) {
            statusColor = "text-red-500";
          } else if (daysRemaining <= 7) {
            statusColor = "text-amber-500";
          }
          
          return (
            <div key={subscription.id} className="flex justify-between items-center p-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 mr-3">
                  <CalendarClock size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{subscription.name}</p>
                  <p className="text-xs text-gray-500">{subscription.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${subscription.amount.toFixed(2)}</p>
                <p className={`text-xs ${statusColor}`}>
                  Due {formattedDate} ({daysRemaining} days)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
