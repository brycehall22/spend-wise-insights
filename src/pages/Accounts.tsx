
import React, { useState } from 'react';
import PageTemplate from './PageTemplate';
import { Building, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccounts, deleteAccount } from '@/services/accountService';
import { AddAccountDialog } from '@/components/accounts/AddAccountDialog';
import { EditAccountDialog } from '@/components/accounts/EditAccountDialog';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

export default function Accounts() {
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccounts(),
  });

  const handleAddAccount = () => {
    setIsAddAccountDialogOpen(true);
  };

  const handleCloseAddAccountDialog = () => {
    setIsAddAccountDialogOpen(false);
  };

  const handleEditAccount = (accountId: string) => {
    setAccountToEdit(accountId);
  };

  const handleCloseEditDialog = () => {
    setAccountToEdit(null);
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      toast({
        title: "Account deleted",
        description: "The account has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setAccountToDelete(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (accountId: string) => {
    setAccountToDelete(accountId);
  };

  const cancelDelete = () => {
    setAccountToDelete(null);
  };

  return (
    <PageTemplate
      title="Accounts"
      subtitle="Manage your financial accounts"
      actions={
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
              <CardFooter className="flex justify-end pt-2 pb-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditAccount(account.account_id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => confirmDelete(account.account_id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
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

      {/* Add Account Dialog */}
      <AddAccountDialog 
        isOpen={isAddAccountDialogOpen} 
        onClose={handleCloseAddAccountDialog} 
      />

      {/* Edit Account Dialog */}
      <EditAccountDialog
        isOpen={!!accountToEdit}
        onClose={handleCloseEditDialog}
        accountId={accountToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!accountToDelete} onOpenChange={cancelDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
              Any transactions associated with this account will remain in the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => accountToDelete && handleDeleteAccount(accountToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
