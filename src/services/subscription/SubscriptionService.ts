
import { supabase } from "@/integrations/supabase/client";
import { addMonths, addWeeks, addYears } from "date-fns";

export interface Subscription {
  subscription_id: string;
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly' | 'quarterly' | 'weekly';
  next_payment: string;
  is_active: boolean;
  category_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateSubscriptionData = Omit<Subscription, 'subscription_id' | 'user_id' | 'created_at' | 'updated_at'>;

class SubscriptionService {
  async getSubscriptions(): Promise<Subscription[]> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to fetch subscriptions');
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        categories (name)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('next_payment', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return (data || []).map(sub => ({
      ...sub,
      billing_cycle: sub.billing_cycle as 'monthly' | 'yearly' | 'quarterly' | 'weekly'
    }));
  }
  
  async getUpcomingSubscriptions(limit: number = 5): Promise<Subscription[]> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to fetch subscriptions');
    }
    
    const today = new Date().toISOString().split('T')[0];
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const oneMonthLaterStr = oneMonthLater.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        categories (name)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('next_payment', today)
      .lte('next_payment', oneMonthLaterStr)
      .order('next_payment', { ascending: true })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return (data || []).map(sub => ({
      ...sub,
      billing_cycle: sub.billing_cycle as 'monthly' | 'yearly' | 'quarterly' | 'weekly'
    }));
  }
  
  async createSubscription(subscription: CreateSubscriptionData): Promise<Subscription> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to create a subscription');
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        ...subscription,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      ...data,
      billing_cycle: data.billing_cycle as 'monthly' | 'yearly' | 'quarterly' | 'weekly'
    };
  }
  
  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('subscription_id', subscriptionId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      ...data,
      billing_cycle: data.billing_cycle as 'monthly' | 'yearly' | 'quarterly' | 'weekly'
    };
  }
  
  async deleteSubscription(subscriptionId: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('subscription_id', subscriptionId);
    
    if (error) {
      throw error;
    }
  }
  
  async processPayment(subscriptionId: string): Promise<void> {
    // Get the subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .single();
    
    if (fetchError || !subscription) {
      throw fetchError || new Error('Subscription not found');
    }
    
    // Calculate next payment date based on billing cycle
    const currentPaymentDate = new Date(subscription.next_payment);
    let nextPaymentDate: Date;
    
    switch (subscription.billing_cycle) {
      case 'weekly':
        nextPaymentDate = addWeeks(currentPaymentDate, 1);
        break;
      case 'monthly':
        nextPaymentDate = addMonths(currentPaymentDate, 1);
        break;
      case 'quarterly':
        nextPaymentDate = addMonths(currentPaymentDate, 3);
        break;
      case 'yearly':
        nextPaymentDate = addYears(currentPaymentDate, 1);
        break;
      default:
        nextPaymentDate = addMonths(currentPaymentDate, 1); // Default to monthly
    }
    
    // Update the subscription with the new next_payment date
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        next_payment: nextPaymentDate.toISOString(),
      })
      .eq('subscription_id', subscriptionId);
    
    if (updateError) {
      throw updateError;
    }
    
    // Create a transaction for this payment
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: subscription.user_id,
        amount: -Math.abs(subscription.amount),
        description: `${subscription.name} subscription payment`,
        merchant: subscription.name,
        category_id: subscription.category_id,
        transaction_date: currentPaymentDate.toISOString().split('T')[0],
        status: 'cleared',
        currency: 'USD',
      } as any);
    
    if (transactionError) {
      throw transactionError;
    }
  }
}

export const subscriptionService = new SubscriptionService();
