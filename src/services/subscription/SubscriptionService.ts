
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

  async createSubscription(subscription: Omit<Subscription, 'subscription_id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
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
}

export const subscriptionService = new SubscriptionService();
