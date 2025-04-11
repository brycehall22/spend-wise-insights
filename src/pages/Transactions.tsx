
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Account, Category } from "@/types/database.types";

interface CategoryWithoutParent {
  category_id: string;
  name: string;
  parent_category_id: string | null;
}

interface AccountSimple {
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

  // Mock transactions data for development
  const [mockTransactions] = useState<TransactionType[]>([
    {
      transaction_id: "1",
      account_id: "1",
      account_name: "Chase Checking",
      category_id: "101",
      category_name: "Groceries",
      amount: -45.67,
      currency: "USD",
      transaction_date: "2025-04-10",
      description: "Weekly grocery shopping",
      merchant: "Trader Joe's",
      status: "cleared",
      is_flagged: false
    },
    {
      transaction_id: "2",
      account_id: "1",
      account_name: "Chase Checking",
      category_id: "102",
      category_name: "Restaurants",
      amount: -28.50,
      currency: "USD",
      transaction_date: "2025-04-09",
      description: "Dinner with friends",
      merchant: "Olive Garden",
      status: "cleared",
      is_flagged: false
    },
    {
      transaction_id: "3",
      account_id: "2",
      account_name: "Bank of America Savings",
      category_id: "103",
      category_name: "Salary",
      amount: 1500.00,
      currency: "USD",
      transaction_date: "2025-04-05",
      description: "Bi-weekly paycheck",
      merchant: "Acme Corp",
      status: "cleared",
      is_flagged: false
    }
  ]);

  // Mock categories and accounts data for development
  const [mockCategories] = useState<CategoryWithoutParent[]>([
    { category_id: "101", name: "Groceries", parent_category_id: null },
    { category_id: "102", name: "Restaurants", parent_category_id: null },
    { category_id: "103", name: "Salary", parent_category_id: null },
    { category_id: "104", name: "Entertainment", parent_category_id: null },
    { category_id: "105", name: "Transportation", parent_category_id: null },
  ]);

  const [mockAccounts] = useState<AccountSimple[]>([
    { account_id: "1", account_name: "Chase Checking" },
    { account_id: "2", account_name: "Bank of America Savings" },
    { account_id: "3", account_name: "Amex Credit Card" },
  ]);

  // Fetch transactions data - temporarily using mock data
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions', filters, sortField, sortDirection, currentPage, pageSize],
    queryFn: async () => {
      // For development, return mock data instead of hitting the API
      // In production, this would query the Supabase backend
      console.log("Would fetch transactions with filters:", filters);
      return mockTransactions;
    },
    enabled: true
  });

  // Fetch categories and accounts - temporarily using mock data
  const { data: categories = mockCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // For development, return mock data
      return mockCategories;
    },
    enabled: true
  });

  const { data: accounts = mockAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      // For development, return mock data
      return mockAccounts;
    },
    enabled: true
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
      // In production, this would update the Supabase backend
      console.log("Saving transaction:", formData);
      
      toast({
        title: formData.transaction_id ? "Transaction updated" : "Transaction added",
        description: `Your transaction has been ${formData.transaction_id ? "updated" : "added"} successfully.`
      });
      
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
      // In production, this would delete from Supabase
      console.log("Deleting transaction:", transactionId);
      
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
      // In production, this would batch delete from Supabase
      console.log("Batch deleting transactions:", selectedTransactions);
      
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
      // In production, this would update categories in Supabase
      console.log("Batch categorizing transactions:", selectedTransactions, "to category:", categoryId);
      
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
