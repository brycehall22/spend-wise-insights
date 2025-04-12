
import React from 'react';
import PageTemplate from './PageTemplate';
import { Building, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getAccounts } from '@/services/accountService';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Accounts() {
  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  });

  const handleAddAccount = () => {
    // Will be implemented in the future
    console.log('Add account clicked');
  };

  return (
    <PageTemplate
      title="Accounts"
      description="Manage your financial accounts"
      action={
        <Button onClick={handleAddAccount}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <CardTitle className="h-6 w-1/2 bg-gray-200 rounded"></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-2/3 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 rounded-md bg-red-50 border border-red-200">
          Error loading accounts: {(error as Error).message}
        </div>
      ) : accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Card key={account.account_id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">{account.account_name}</CardTitle>
                <span className={`px-2 py-1 text-xs rounded ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {account.is_active ? 'Active' : 'Inactive'}
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: account.currency }).format(account.balance)}
                </div>
                <div className="text-sm text-gray-500">
                  {account.account_type}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No accounts found"
          description="You haven't added any accounts yet. Add your first account to start tracking your finances."
          icon={<Building className="h-10 w-10" />}
          actionLabel="Add Account"
          onAction={handleAddAccount}
        />
      )}
    </PageTemplate>
  );
}
