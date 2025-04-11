
import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  ArrowDownRight, 
  ArrowUpRight,
  Calendar, 
  Check, 
  ChevronDown, 
  Edit2, 
  Flag, 
  MoreHorizontal, 
  Tag, 
  Trash
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type TransactionType = {
  transaction_id: string;
  account_id: string;
  account_name: string;
  category_id: string | null;
  category_name: string | null;
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
  onDelete: (transaction_id: string) => void;
  onCategoryChange: (transaction_id: string, category_id: string) => void;
  onFlag: (transaction_id: string, flagged: boolean) => void;
  selectedTransactions: string[];
  onSelect: (transaction_id: string, selected: boolean) => void;
  showCheckboxes: boolean;
  showAccount?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  onEdit, 
  onDelete, 
  onCategoryChange,
  onFlag,
  selectedTransactions,
  onSelect,
  showCheckboxes,
  showAccount = true
}) => {

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTransactionTypeStyle = (amount: number) => {
    return amount < 0 
      ? "text-red-600 bg-red-50" 
      : "text-green-600 bg-green-50";
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead className="w-[40px]">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-spendwise-orange focus:ring-spendwise-orange" 
                />
              </TableHead>
            )}
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            {showAccount && <TableHead>Account</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showCheckboxes ? 7 : 6} className="text-center py-10 text-gray-500">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow 
                key={transaction.transaction_id}
                className="hover:bg-gray-50 transition-colors group"
              >
                {showCheckboxes && (
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={selectedTransactions.includes(transaction.transaction_id)} 
                      onChange={(e) => onSelect(transaction.transaction_id, e.target.checked)}
                      className="rounded border-gray-300 text-spendwise-orange focus:ring-spendwise-orange" 
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {format(new Date(transaction.transaction_date), 'MMM dd')}
                </TableCell>
                <TableCell>
                  <div className="flex items-start flex-col">
                    <div className="font-medium flex items-center">
                      {transaction.merchant}
                      {transaction.is_flagged && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Flag size={14} className="ml-1 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Flagged for review</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-[250px]">
                      {transaction.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.category_name ? (
                    <Badge variant="outline" className="font-normal">
                      {transaction.category_name}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-normal">
                      Uncategorized
                    </Badge>
                  )}
                </TableCell>
                {showAccount && (
                  <TableCell className="text-gray-600">
                    {transaction.account_name}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Badge className={getTransactionTypeStyle(transaction.amount)}>
                      {transaction.amount < 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                    </Badge>
                    <span className={transaction.amount < 0 ? "text-red-600" : "text-green-600"}>
                      {formatAmount(Math.abs(transaction.amount), transaction.currency)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuItem onClick={() => onEdit(transaction)} className="cursor-pointer">
                        <Edit2 size={14} className="mr-2" /> Edit Transaction
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onFlag(transaction.transaction_id, !transaction.is_flagged)}
                        className="cursor-pointer"
                      >
                        <Flag size={14} className="mr-2" /> {transaction.is_flagged ? 'Remove Flag' : 'Flag Transaction'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(transaction.transaction_id)}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash size={14} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
