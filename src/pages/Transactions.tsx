import React, { useState, useEffect } from 'react';
import PageTemplate from './PageTemplate';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DownloadCloud,
  Filter,
  Plus,
  RefreshCcw,
  Trash2,
  Flag,
  Tags
} from 'lucide-react';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import AddTransactionDialog from '@/components/transactions/AddTransactionDialog';
import BatchActionsBar from '@/components/transactions/BatchActionsBar';
import { TransactionFilter } from '@/types/database.types';
import { 
  getTransactions, 
  deleteTransaction, 
  batchDeleteTransactions, 
  flagTransaction, 
  exportTransactions, 
  batchUpdateCategory
} from '@/services/transactionService';
import { getCategories } from '@/services/categoryService';
import { getAccounts } from '@/services/accountService';
import EmptyState from '@/components/EmptyState';
import { format } from 'date-fns';

export default function Transactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<TransactionFilter>({});
  const [sortBy, setSortBy] = useState('transaction_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Query categories for filters
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  // Query accounts for filters
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccounts(),
  });

  // Query transactions with pagination, filtering and sorting
  const {
    data: transactionsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['transactions', page, pageSize, filters, sortBy, sortOrder],
    queryFn: () => getTransactions(page, pageSize, filters, sortBy, sortOrder),
  });

  // Reset selection when page changes
  useEffect(() => {
    setSelectedItems([]);
  }, [page]);

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Transaction deleted",
        description: "The transaction has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete transaction: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Batch delete mutation
  const batchDeleteMutation = useMutation({
    mutationFn: batchDeleteTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setSelectedItems([]);
      toast({
        title: "Transactions deleted",
        description: `${selectedItems.length} transactions have been deleted successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete transactions: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Flag transaction mutation
  const flagMutation = useMutation({
    mutationFn: ({ id, isFlagged }: { id: string, isFlagged: boolean }) => 
      flagTransaction(id, isFlagged),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: "Transaction updated",
        description: "The transaction flag has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update transaction flag: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Batch update category mutation
  const batchUpdateCategoryMutation = useMutation({
    mutationFn: ({ transactionIds, categoryId }: { transactionIds: string[], categoryId: string | null }) => 
      batchUpdateCategory(transactionIds, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setSelectedItems([]);
      toast({
        title: "Transactions updated",
        description: `${selectedItems.length} transactions have been categorized.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update transaction categories: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (format: 'csv' | 'json') => exportTransactions(format, filters),
    onSuccess: (data, format) => {
      // Create download link
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export complete",
        description: `Transactions exported as ${format.toUpperCase()} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: `Failed to export transactions: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle adding a new transaction
  const handleAddTransaction = () => {
    setIsAddDialogOpen(true);
  };

  // Handle transaction added
  const handleTransactionAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    setIsAddDialogOpen(false);
    toast({
      title: "Transaction added",
      description: "New transaction has been added successfully.",
    });
  };

  // Handle transaction deletion
  const handleDeleteTransaction = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Handle batch delete
  const handleBatchDelete = () => {
    if (selectedItems.length === 0) return;
    
    batchDeleteMutation.mutate(selectedItems);
  };

  // Handle flag change
  const handleFlagChange = (id: string, isFlagged: boolean) => {
    flagMutation.mutate({ id, isFlagged });
  };

  // Handle batch category update
  const handleBatchCategorize = (categoryId: string | null) => {
    if (selectedItems.length === 0) return;
    
    batchUpdateCategoryMutation.mutate({ 
      transactionIds: selectedItems, 
      categoryId 
    });
  };

  // Handle export
  const handleExport = (format: 'csv' | 'json') => {
    exportMutation.mutate(format);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: TransactionFilter) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  // Handle sort change
  const handleSortChange = (column: string, order: 'asc' | 'desc') => {
    setSortBy(column);
    setSortOrder(order);
  };

  // Format transactions for the table
  const formatTransactionsForTable = () => {
    if (!transactionsData || !transactionsData.transactions) return [];
    
    return transactionsData.transactions.map((transaction) => ({
      id: transaction.transaction_id,
      date: format(new Date(transaction.transaction_date), 'MMM dd, yyyy'),
      description: transaction.description,
      category: transaction.category_name || 'Uncategorized',
      account: transaction.account_name || 'Unknown',
      amount: new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: transaction.currency 
      }).format(transaction.amount),
      status: transaction.status,
      isFlagged: transaction.is_flagged || false,
      rawData: transaction
    }));
  };

  return (
    <PageTemplate 
      title="Transactions" 
      subtitle="Manage your financial transactions"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          
          <Button variant="outline" onClick={() => exportMutation.mutate('csv')}>
            <DownloadCloud className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          <Button onClick={handleAddTransaction}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      }
    >
      {/* Filters panel */}
      {isFilterOpen && (
        <Card className="mb-6 p-4">
          <TransactionFilters 
            onApplyFilters={handleFilterChange} 
            initialFilters={filters}
            categories={(categories || []) as Category[]} // Fixed type casting here
            accounts={accounts || []}
          />
        </Card>
      )}
      
      {/* Batch actions bar */}
      {selectedItems.length > 0 && (
        <BatchActionsBar
          selectedCount={selectedItems.length}
          onDelete={handleBatchDelete}
          onCategorize={handleBatchCategorize}
          categories={categories || []}
        />
      )}
      
      {/* Loading and error states */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      ) : isError ? (
        <div className="p-6 text-red-600 bg-red-50 rounded-md border border-red-200">
          <p className="text-lg font-medium">Error loading transactions</p>
          <p>{(error as Error).message}</p>
        </div>
      ) : transactionsData && transactionsData.transactions.length > 0 ? (
        <div>
          <DataTable
            data={formatTransactionsForTable()}
            onSortChange={handleSortChange}
            selectedItems={selectedItems}
            onSelectedItemsChange={setSelectedItems}
            onFlagChange={handleFlagChange}
            onDeleteItem={handleDeleteTransaction}
            pagination={{
              currentPage: page,
              totalPages: transactionsData.pagination.totalPages,
              onPageChange: setPage,
              pageSize,
              onPageSizeChange: setPageSize,
              totalItems: transactionsData.pagination.totalCount
            }}
          />
          <p className="text-sm text-gray-500 mt-2">
            Showing {transactionsData.transactions.length} of {transactionsData.pagination.totalCount} transactions
          </p>
        </div>
      ) : (
        <EmptyState
          title="No transactions found"
          description={
            Object.keys(filters).length > 0 
              ? "No transactions match your filters. Try adjusting your filter criteria."
              : "You haven't added any transactions yet. Add your first transaction to track your spending."
          }
          icon={filters && Object.keys(filters).length > 0 ? <Filter className="h-10 w-10" /> : <Plus className="h-10 w-10" />}
          actionLabel="Add Transaction"
          onAction={handleAddTransaction}
        />
      )}
      
      {/* Add transaction dialog */}
      <AddTransactionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </PageTemplate>
  );
}
