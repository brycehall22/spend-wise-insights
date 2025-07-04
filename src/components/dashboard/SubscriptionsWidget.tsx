import { useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { subscriptionService } from "@/services/subscription/SubscriptionService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddSubscriptionDialog } from "@/components/subscriptions/AddSubscriptionDialog";

export default function SubscriptionsWidget() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch upcoming subscriptions
  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ['upcomingSubscriptions'],
    queryFn: () => subscriptionService.getUpcomingSubscriptions(),
  });

  // Handle subscription added
  const handleSubscriptionAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['upcomingSubscriptions'] });
    setIsAddDialogOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="budget-card animate-fade-in">
        <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Upcoming Subscriptions</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex justify-between items-center p-3 border-b border-gray-100">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="budget-card animate-fade-in">
        <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Upcoming Subscriptions</h2>
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p>Unable to load subscriptions</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="budget-card animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-spendwise-oxford">Upcoming Subscriptions</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 rounded-lg">
          <CalendarClock size={32} className="text-gray-400 mb-2" />
          <p className="text-gray-500">No upcoming subscriptions</p>
          <p className="text-sm text-gray-400 mt-1">Add subscriptions to track your recurring payments</p>
        </div>
        
        <AddSubscriptionDialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)}
          onSave={handleSubscriptionAdded}
        />
      </div>
    );
  }

  return (
    <div className="budget-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-spendwise-oxford">Upcoming Subscriptions</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      
      <div className="space-y-3">
        {subscriptions.map((subscription) => {
          const nextPaymentDate = new Date(subscription.next_payment);
          const formattedDate = nextPaymentDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          // Calculate days remaining
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const paymentDay = new Date(nextPaymentDate);
          paymentDay.setHours(0, 0, 0, 0);
          
          const daysRemaining = Math.ceil((paymentDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let statusColor = "text-gray-500";
          if (daysRemaining <= 3) {
            statusColor = "text-red-500";
          } else if (daysRemaining <= 7) {
            statusColor = "text-amber-500";
          }
          
          return (
            <div key={subscription.subscription_id} className="flex justify-between items-center p-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 mr-3">
                  <CalendarClock size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{subscription.name}</p>
                  <p className="text-xs text-gray-500">{subscription.billing_cycle}</p>
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
      
      <AddSubscriptionDialog 
        isOpen={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
        onSave={handleSubscriptionAdded}
      />
    </div>
  );
}