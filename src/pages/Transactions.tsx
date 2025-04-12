
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
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/categoryService";
import { getAccounts } from "@/services/accountService";
import { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  batchDeleteTransactions,
  batchUpdateCategory,
  TransactionFilter,
  exportTransactions
} from "@/services/transactionService";

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

  // Fetch categories data 
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch accounts data
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Convert filters to TransactionFilter type
  const convertFiltersToQueryParams = (): TransactionFilter | undefined => {
    if (!filters) return undefined;
    
    return {
      search: filters.search,
      dateRange: filters.dateRange,
      accounts: filters.accounts,
      categories: filters.categories,
      amountRange: filters.amountRange,
      transactionType: filters.transactionType,
      status: filters.status,
    };
  };

  // Fetch transactions data
  const { 
    data: transactions = [], 
    isLoading: transactionsLoading, 
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['transactions', filters, sortField, sortDirection, currentPage, pageSize],
    queryFn: async () => {
      const queryFilters = convertFiltersToQueryParams();
      return getTransactions(queryFilters);
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
        await updateTransaction({
          transaction_id: formData.transaction_id,
          account_id: formData.account_id,
          category_id: formData.category_id,
          amount: formData.amount,
          transaction_date: format(formData.transaction_date, 'yyyy-MM-dd'),
          description: formData.description,
          merchant: formData.merchant,
          status: formData.status,
        });
        
        toast({
          title: "Transaction updated",
          description: "Your transaction has been updated successfully."
        });
      } else {
        // Create new transaction
        await createTransaction({
          account_id: formData.account_id,
          category_id: formData.category_id,
          amount: formData.amount,
          transaction_date: format(formData.transaction_date, 'yyyy-MM-dd'),
          description: formData.description,
          merchant: formData.merchant,
          status: formData.status,
          user_id: '', // Will be set in the service
          currency: 'USD', // Default currency
        });
        
        toast({
          title: "Transaction added",
          description: "Your transaction has been added successfully."
        });
      }
      
      // Close the dialog and refresh the transaction list
      setFormDialogOpen(false);
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
      await deleteTransaction(transactionId);
      
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
      await batchDeleteTransactions(selectedTransactions);
      
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
      await batchUpdateCategory(selectedTransactions, categoryId);
      
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

  // Handle batch flag operation
  const handleBatchFlag = async () => {
    try {
      // In a real implementation, this would update the is_flagged field in the database
      toast({
        title: "Transactions flagged",
        description: `${selectedTransactions.length} transactions have been flagged for review.`
      });
      
      refetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while flagging the transactions.",
        variant: "destructive"
      });
    }
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

  // Export data
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const exportData = await exportTransactions(format, convertFiltersToQueryParams());
      
      // Create a downloadable file
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export completed",
        description: `Transactions have been exported as ${format.toUpperCase()}.`
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export transactions.",
        variant: "destructive"
      });
    }
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

  // Handle flagging a transaction
  const handleFlagTransaction = async (id: string, flagged: boolean) => {
    try {
      // Update the transaction with the new flag status
      await updateTransaction({
        transaction_id: id,
        is_flagged: flagged
      });
      
      toast({
        title: flagged ? "Transaction flagged" : "Flag removed",
        description: flagged 
          ? "Transaction has been flagged for review." 
          : "Flag has been removed from the transaction."
      });
      
      refetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the transaction.",
        variant: "destructive"
      });
    }
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
              {(transactionsError as Error).message || "There was an error loading your transactions. Please try again later."}
            </p>
            <Button onClick={() => refetchTransactions()}>Retry</Button>
          </div>
        </Card>
      </PageTemplate>
    );
  }

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
                  <DropdownMenuItem onClick={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>Export as JSON</DropdownMenuItem>
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
            onFlag={handleFlagTransaction}
            selectedTransactions={selectedTransactions}
            onSelect={handleSelectTransaction}
            showCheckboxes={true}
          />
          
          {transactions.length > 0 && (
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
          )}
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

function format(date: Date, format: string): string {
  return date.toISOString().split('T')[0]; // Simple format as YYYY-MM-DD
}
