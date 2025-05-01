import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { updateTransaction } from "@/services/transaction/transactionCore";
import { useQueryClient } from "@tanstack/react-query";

// Define types for the transaction
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

// Define types for form values
export type TransactionFormValues = {
  transaction_id?: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  transaction_date: Date;
  description: string;
  merchant: string;
  status: "cleared" | "pending";
  notes?: string;
};

// Define props for dialog
interface TransactionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (values: TransactionFormValues) => void;
  accounts: { account_id: string; account_name: string }[];
  categories: { category_id: string; name: string; is_income?: boolean }[];
  transaction?: TransactionType;
  isEdit?: boolean;
}

// Schema for form validation
const transactionSchema = z.object({
  transaction_id: z.string().optional(),
  account_id: z.string({
    required_error: "Please select an account",
  }),
  category_id: z.string().nullable(),
  amount: z.number({
    required_error: "Please enter an amount",
    invalid_type_error: "Amount must be a number",
  }),
  transaction_date: z.date({
    required_error: "Please select a date",
  }),
  description: z.string().min(1, "Description is required"),
  merchant: z.string().min(1, "Merchant is required"),
  status: z.enum(["cleared", "pending"]),
  notes: z.string().optional(),
});

export default function TransactionFormDialog({
  isOpen,
  onClose,
  onSave,
  accounts,
  categories,
  transaction,
  isEdit = false,
}: TransactionFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Initialize form with transaction data if editing
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          transaction_id: transaction.transaction_id,
          account_id: transaction.account_id,
          category_id: transaction.category_id,
          amount: transaction.amount,
          transaction_date: new Date(transaction.transaction_date),
          description: transaction.description,
          merchant: transaction.merchant,
          status: transaction.status,
        }
      : {
          account_id: "",
          category_id: null,
          amount: 0,
          transaction_date: new Date(),
          description: "",
          merchant: "",
          status: "cleared",
        },
  });

  // Split categories into income and expense
  const incomeCategories = categories.filter((cat) => cat.is_income === true || cat.name.includes("Income") || cat.name === "Salary");
  const expenseCategories = categories.filter((cat) => !incomeCategories.find(ic => ic.category_id === cat.category_id));

  // Handle form submission
  const handleSubmit = async (values: TransactionFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEdit && transaction) {
        // Update the transaction in the database
        await updateTransaction({
          transaction_id: transaction.transaction_id,
          account_id: values.account_id,
          category_id: values.category_id,
          amount: values.amount,
          description: values.description,
          merchant: values.merchant,
          transaction_date: values.transaction_date.toISOString().split('T')[0],
          status: values.status,
        });
        
        // Invalidate related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
        
        // Call the onSave callback if provided
        if (onSave) {
          onSave(values);
        }
        
        // Close the dialog
        onClose();
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle detecting if it's income or expense
  const isIncome = form.watch("amount") > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            {/* Amount field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <Input 
                        placeholder="0.00" 
                        className="pl-7"
                        type="number"
                        step="0.01" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Grocery shopping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Merchant field */}
            <FormField
              control={form.control}
              name="merchant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant</FormLabel>
                  <FormControl>
                    <Input placeholder="Supermarket" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date field */}
            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account field */}
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.account_id} value={account.account_id}>
                          {account.account_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category field */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Uncategorized</SelectItem>
                      
                      {isIncome && incomeCategories.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-sm font-semibold">Income</div>
                          {incomeCategories.map((category) => (
                            <SelectItem key={category.category_id} value={category.category_id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </>
                      )}
                      
                      {!isIncome && expenseCategories.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-sm font-semibold">Expenses</div>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category.category_id} value={category.category_id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cleared">Cleared</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit button */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEdit ? "Update" : "Create"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}