import React, { useState } from 'react';
import PageTemplate from './PageTemplate';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscription/SubscriptionService';
import { AddSubscriptionDialog } from '@/components/subscriptions/AddSubscriptionDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarClock, Edit, Plus, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Subscriptions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);

  // Fetch all subscriptions
  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionService.getSubscriptions(),
  });

  // Calculate recurring expenses
  const totalMonthly = subscriptions?.reduce((total, sub) => {
    if (sub.billing_cycle === 'monthly') {
      return total + sub.amount;
    } else if (sub.billing_cycle === 'yearly') {
      return total + (sub.amount / 12);
    } else if (sub.billing_cycle === 'quarterly') {
      return total + (sub.amount / 3);
    } else if (sub.billing_cycle === 'weekly') {
      return total + (sub.amount * 4.33); // Average weeks in a month
    }
    return total;
  }, 0) || 0;

  const handleSubscriptionAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    setIsAddDialogOpen(false);
  };

  const handleDeleteSubscription = async () => {
    if (!subscriptionToDelete) return;
    
    try {
      await subscriptionService.deleteSubscription(subscriptionToDelete);
      toast({
        title: "Subscription deleted",
        description: "The subscription has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingSubscriptions'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubscriptionToDelete(null);
    }
  };

  // Format the billing cycle for display
  const formatBillingCycle = (cycle: string, amount: number) => {
    switch (cycle) {
      case 'weekly':
        return `$${amount.toFixed(2)} / week`;
      case 'monthly':
        return `$${amount.toFixed(2)} / month`;
      case 'quarterly':
        return `$${amount.toFixed(2)} / quarter`;
      case 'yearly':
        return `$${amount.toFixed(2)} / year`;
      default:
        return `$${amount.toFixed(2)}`;
    }
  };

  return (
    <PageTemplate
      title="Subscriptions"
      subtitle="Manage your recurring payments and subscriptions"
      actions={
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      }
    >
      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">${totalMonthly.toFixed(2)}</div>
            )}
            <p className="text-sm text-muted-foreground">Recurring monthly cost</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">{subscriptions?.length || 0}</div>
            )}
            <p className="text-sm text-muted-foreground">Total active subscriptions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                {subscriptions && subscriptions.length > 0 
                  ? formatDistanceToNow(new Date(
                      subscriptions.reduce((closest, sub) => {
                        return new Date(sub.next_payment) < new Date(closest.next_payment) 
                          ? sub 
                          : closest;
                      }, subscriptions[0]).next_payment
                    ), { addSuffix: true })
                  : 'No subscriptions'
                }
              </div>
            )}
            <p className="text-sm text-muted-foreground">Time until next payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
              <p>There was an error loading your subscriptions.</p>
            </div>
          ) : subscriptions && subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.map((subscription) => {
                const nextPaymentDate = new Date(subscription.next_payment);
                
                return (
                  <div key={subscription.subscription_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-full mr-3">
                        <CalendarClock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{subscription.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatBillingCycle(subscription.billing_cycle, subscription.amount)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-medium">
                        Next payment: {nextPaymentDate.toLocaleDateString()}
                      </p>
                      <div className="flex mt-2">
                        <Button variant="outline" size="sm" className="mr-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setSubscriptionToDelete(subscription.subscription_id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <CalendarClock className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-1">No subscriptions found</h3>
              <p className="text-gray-500 mb-4">You haven't added any subscriptions yet.</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Subscription Dialog */}
      <AddSubscriptionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleSubscriptionAdded}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!subscriptionToDelete} onOpenChange={(open) => !open && setSubscriptionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subscription? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSubscription}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}