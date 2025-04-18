
import { supabase } from "@/integrations/supabase/client";
import { BaseService } from "@/services/BaseService";

export interface Subscription {
  subscription_id: string;
  user_id: string;
  name: string;
  amount: number;
  next_payment: string;
  category_id: string | null;
  billing_cycle: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class SubscriptionService extends BaseService {
  // Get upcoming subscriptions
  async getUpcomingSubscriptions(): Promise<Subscription[]> {
    return this.withAuth(async (userId) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          categories (name)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('next_payment', new Date().toISOString())
        .order('next_payment', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    });
  }

  // Create a new subscription
  async createSubscription(subscription: Omit<Subscription, 'subscription_id' | 'user_id' | 'created_at' | 'updated_at' | 'category_id'> & { category_id?: string | null }): Promise<Subscription> {
    return this.withAuth(async (userId) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ ...subscription, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  // Create subscription from transaction
  async createFromTransaction(transactionId: string): Promise<Subscription | null> {
    return this.withAuth(async (userId) => {
      // Get the transaction details
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (name)
        `)
        .eq('transaction_id', transactionId)
        .single();

      if (transactionError) throw transactionError;
      if (!transaction) return null;

      // Check if the category is "Subscriptions"
      const isSubscription = transaction.categories?.name === 'Subscriptions';
      if (!isSubscription) return null;

      // Create a new subscription
      const nextPaymentDate = new Date(transaction.transaction_date);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1); // Default to monthly

      const subscription = {
        name: transaction.description || transaction.merchant,
        amount: Math.abs(transaction.amount),
        next_payment: nextPaymentDate.toISOString(),
        category_id: transaction.category_id,
        billing_cycle: 'monthly',
        is_active: true
      };

      return this.createSubscription(subscription);
    });
  }
}

export const subscriptionService = new SubscriptionService();
