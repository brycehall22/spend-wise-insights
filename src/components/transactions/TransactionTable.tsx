
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Flag,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { format } from 'date-fns';
import EmptyState from "@/components/EmptyState";

export type TransactionType = {
  transaction_id: string;
  account_id: string;
  account_name?: string;
  category_id: string | null;
  category_name?: string | null;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string;
  merchant: string;
  status: 'cleared' | 'pending';
  is_flagged?: boolean;
};

interface TransactionTableProps {
  transactions: TransactionType[];
  onEdit: (transaction: TransactionType) => void;
  onDelete: (id: string) => void;
  onCategoryChange: (id: string) => void;
  onFlag: (id: string, flagged: boolean) => void;
  selectedTransactions?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  showCheckboxes?: boolean;
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  onCategoryChange,
  onFlag,
  selectedTransactions = [],
  onSelect,
  showCheckboxes = false,
}: TransactionTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete);
      setTransactionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Check if there's no data
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions found"
        description="There are no transactions matching your criteria. Try adjusting your filters or add a new transaction."
        icon={<span className="text-3xl">💳</span>}
      />
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckboxes && onSelect && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      transactions.length > 0 &&
                      selectedTransactions.length === transactions.length
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        transactions.forEach(t => onSelect(t.transaction_id, true));
                      } else {
                        transactions.forEach(t => onSelect(t.transaction_id, false));
                      }
                    }}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.transaction_id}>
                {showCheckboxes && onSelect && (
                  <TableCell>
                    <Checkbox
                      checked={selectedTransactions.includes(transaction.transaction_id)}
                      onCheckedChange={(checked) => {
                        onSelect(transaction.transaction_id, !!checked);
                      }}
                      aria-label={`Select transaction ${transaction.description}`}
                    />
                  </TableCell>
                )}
                <TableCell>
                  {format(new Date(transaction.transaction_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500">{transaction.merchant}</div>
                  </div>
                </TableCell>
                <TableCell>{transaction.category_name || 'Uncategorized'}</TableCell>
                <TableCell>{transaction.account_name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    {transaction.amount > 0 ? (
                      <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.currency}
                      {Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        transaction.status === 'cleared'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                  >
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onFlag(transaction.transaction_id, !transaction.is_flagged)}
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        {transaction.is_flagged ? 'Remove flag' : 'Flag transaction'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(transaction.transaction_id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
