
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import PageTemplate from "./PageTemplate";
import TransactionTable, { TransactionType } from "@/components/transactions/TransactionTable";
import TransactionFilters, { FilterState } from "@/components/transactions/TransactionFilters";
import TransactionFormDialog, { TransactionFormValues } from "@/components/transactions/TransactionFormDialog";
import BatchActionsBar from "@/components/transactions/BatchActionsBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowDownUp, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Plus,
  Wallet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Category {
  category_id: string;
  name: string;
  parent_category_id: string | null;
}

interface Account {
  account_id: string;
  account_name: string;
}

export default function Transactions() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionType | undefined>();
  const [filters, setFilters] = useState<FilterState | null>(null);
  const [sortField, setSortField] = useState<string>("transaction_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch transactions data
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions', filters, sortField, sortDirection, currentPage, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          transaction_id,
          account_id,
          accounts:account_id (account_name),
          category_id,
          categories:category_id (name),
          amount,
          currency,
          transaction_date,
          description,
          merchant,
          status
        `)
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      // Apply filters if they exist
      if (filters) {
        if (filters.search) {
          query = query.or(`description.ilike.%${filters.search}%,merchant.ilike.%${filters.search}%`);
        }
        
        if (filters.dateRange.from && filters.dateRange.to) {
          query = query.gte('transaction_date', filters.dateRange.from.toISOString().split('T')[0])
                       .lte('transaction_date', filters.dateRange.to.toISOString().split('T')[0]);
        }
        
        if (filters.accounts.length > 0) {
          query = query.in('account_id', filters.accounts);
        }
        
        if (filters.categories.length > 0) {
          query = query.in('category_id', filters.categories);
        }
        
        if (filters.amountRange.min !== undefined) {
          query = query.gte('amount', filters.amountRange.min);
        }
        
        if (filters.amountRange.max !== undefined) {
          query = query.lte('amount', filters.amountRange.max);
        }
        
        if (filters.transactionType === 'income') {
          query = query.gt('amount', 0);
        } else if (filters.transactionType === 'expense') {
          query = query.lt('amount', 0);
        }
        
        if (filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;

      return data.map(item => ({
        ...item,
        account_name: item.accounts?.account_name || 'Unknown Account',
        category_name: item.categories?.name || null,
        is_flagged: false // This would come from DB in real implementation
      }));
    },
    enabled: supabase !== undefined
  });

  // Fetch categories and accounts data for filters and forms
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('category_id, name, parent_category_id');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('account_id, account_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Get active filter count
  const getActiveFilterCount = (): number => {
    if (!filters) return 0;
    
    let count = 0;
    if (filters.search) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.accounts.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.amountRange.min !== undefined || filters.amountRange.max !== undefined) count++;
    if (filters.transactionType !== 'all') count++;
    if (filters.status !== 'all') count++;
    
    return count;
  };

  // Handle transaction form submission
  const handleSaveTransaction = async (formData: TransactionFormValues) => {
    try {
      if (formData.transaction_id) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update({
            account_id: formData.account_id,
            category_id: formData.category_id || null,
            amount: formData.amount,
            transaction_date: formData.transaction_date.toISOString().split('T')[0],
            description: formData.description || '',
            merchant: formData.merchant,
            status: formData.status,
          })
          .eq('transaction_id', formData.transaction_id);
          
        if (error) throw error;
        
        toast({
          title: "Transaction updated",
          description: "Your transaction has been updated successfully."
        });
      } else {
        // Create new transaction
        const { error } = await supabase
          .from('transactions')
          .insert({
            account_id: formData.account_id,
            category_id: formData.category_id || null,
            amount: formData.amount,
            currency: 'USD', // Default currency
            transaction_date: formData.transaction_date.toISOString().split('T')[0],
            description: formData.description || '',
            merchant: formData.merchant,
            status: formData.status,
          });
          
        if (error) throw error;
        
        toast({
          title: "Transaction added",
          description: "Your new transaction has been added successfully."
        });
      }
      
      // Refresh the transaction list
      refetchTransactions();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the transaction.",
        variant: "destructive"
      });
    }
  };

  // Handle transaction deletion
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('transaction_id', transactionId);
        
      if (error) throw error;
      
      toast({
        title: "Transaction deleted",
        description: "Your transaction has been deleted successfully."
      });
      
      // Refresh the transaction list
      refetchTransactions();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the transaction.",
        variant: "destructive"
      });
    }
  };

  // Handle batch operations
  const handleBatchDelete = async () => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('transaction_id', selectedTransactions);
        
      if (error) throw error;
      
      toast({
        title: "Transactions deleted",
        description: `${selectedTransactions.length} transactions have been deleted successfully.`
      });
      
      // Clear selection and refresh data
      setSelectedTransactions([]);
      refetchTransactions();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the transactions.",
        variant: "destructive"
      });
    }
  };

  const handleBatchCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ category_id: categoryId })
        .in('transaction_id', selectedTransactions);
        
      if (error) throw error;
      
      toast({
        title: "Transactions categorized",
        description: `${selectedTransactions.length} transactions have been categorized successfully.`
      });
      
      // Refresh data
      refetchTransactions();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while categorizing the transactions.",
        variant: "destructive"
      });
    }
  };

  // Placeholder for flag operation
  const handleBatchFlag = () => {
    toast({
      title: "Transactions flagged",
      description: `${selectedTransactions.length} transactions have been flagged for review.`
    });
    
    // In a real implementation, this would update the is_flagged field in the database
    refetchTransactions();
  };

  // Handle transaction selection
  const handleSelectTransaction = (transactionId: string, selected: boolean) => {
    if (selected) {
      setSelectedTransactions([...selectedTransactions, transactionId]);
    } else {
      setSelectedTransactions(selectedTransactions.filter(id => id !== transactionId));
    }
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Open transaction form for editing
  const handleEditTransaction = (transaction: TransactionType) => {
    setEditingTransaction(transaction);
    setFormDialogOpen(true);
  };

  // Open transaction form for adding new transaction
  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    setFormDialogOpen(true);
  };

  // Show loading state
  if (transactionsLoading) {
    return (
      <PageTemplate 
        title="Transactions" 
        subtitle="Track and manage all of your financial transactions"
      >
        <Card className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-[400px] bg-gray-200 rounded"></div>
          </div>
        </Card>
      </PageTemplate>
    );
  }

  // Show error state
  if (transactionsError) {
    return (
      <PageTemplate 
        title="Transactions" 
        subtitle="Track and manage all of your financial transactions"
      >
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <Wallet size={48} className="text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error Loading Transactions</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              There was an error loading your transactions. Please try again later.
            </p>
            <Button onClick={() => refetchTransactions()}>Retry</Button>
          </div>
        </Card>
      </PageTemplate>
    );
  }

  const transactions = transactionsData || [];
  const totalPages = Math.ceil(transactions.length / pageSize); // In a real app, we'd get the total count from the API

  return (
    <PageTemplate 
      title="Transactions" 
      subtitle="Track and manage all of your financial transactions"
    >
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">All Transactions</h2>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-1">
                    <Download size={16} />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-1">
                    <ArrowDownUp size={16} />
                    Sort by
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleSortChange('transaction_date')}>
                    Date {sortField === 'transaction_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('amount')}>
                    Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('merchant')}>
                    Merchant {sortField === 'merchant' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button className="bg-spendwise-orange hover:bg-spendwise-orange/90 flex gap-1" onClick={handleAddTransaction}>
                <Plus size={16} />
                Add Transaction
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <TransactionFilters 
              onFilterChange={handleFilterChange} 
              categories={categories}
              accounts={accounts}
              activeFilters={getActiveFilterCount()}
            />
          </div>
          
          {selectedTransactions.length > 0 && (
            <div className="mb-4">
              <BatchActionsBar 
                selectedCount={selectedTransactions.length}
                onBatchDelete={handleBatchDelete}
                onBatchCategory={handleBatchCategory}
                onBatchFlag={handleBatchFlag}
                onClearSelection={() => setSelectedTransactions([])}
                categories={categories}
              />
            </div>
          )}
          
          <TransactionTable 
            transactions={transactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onCategoryChange={handleBatchCategory}
            onFlag={(id, flagged) => {
              // This would be implemented in a real app
              console.log(`Flagging transaction ${id}: ${flagged}`);
            }}
            selectedTransactions={selectedTransactions}
            onSelect={handleSelectTransaction}
            showCheckboxes={true}
          />
          
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {transactions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, transactions.length)} of {transactions.length} transactions
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </Card>
      
      <TransactionFormDialog
        isOpen={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSave={handleSaveTransaction}
        accounts={accounts}
        categories={categories}
        transaction={editingTransaction}
        isEdit={!!editingTransaction}
      />
    </PageTemplate>
  );
}
