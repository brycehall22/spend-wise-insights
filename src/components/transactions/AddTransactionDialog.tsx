
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Define form schema
const transactionSchema = z.object({
  account_id: z.string().min(1, { message: "Account is required" }),
  category_id: z.string().min(1, { message: "Category is required" }),
  amount: z.coerce.number().nonnegative("Amount cannot be negative"),
  transaction_date: z.date({
    required_error: "Transaction date is required",
  }),
  description: z.string().min(1, { message: "Description is required" }),
  merchant: z.string().min(1, { message: "Merchant is required" }),
  status: z.enum(["cleared", "pending"]),
  currency: z.string().default("USD"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction?: (transaction: TransactionFormValues) => void;
  accounts: { account_id: string; account_name: string }[];
  categories: { category_id: string; name: string; is_income: boolean }[];
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  onAddTransaction,
  accounts,
  categories,
}: AddTransactionDialogProps) {
  // Flag to track if the transaction is income
  const [isIncome, setIsIncome] = useState(false);
  
  // Setup form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      account_id: "",
      category_id: "",
      amount: 0,
      transaction_date: new Date(),
      description: "",
      merchant: "",
      status: "cleared",
      currency: "USD",
    },
  });
  
  // Filter categories based on income/expense selection
  const filteredCategories = categories.filter(
    (category) => category.is_income === isIncome
  );

  // Reset category when switching between income/expense
  const handleTransactionTypeChange = (value: boolean) => {
    setIsIncome(value);
    form.setValue("category_id", "");
  };

  // Handle form submission
  const onSubmit = (values: TransactionFormValues) => {
    // If it's income, make the amount positive
    if (isIncome) {
      values.amount = Math.abs(values.amount);
    } else {
      // If it's an expense, make the amount negative
      values.amount = -Math.abs(values.amount);
    }
    
    // Call parent handler
    if (onAddTransaction) {
      onAddTransaction(values);
    }
    
    // Show success toast
    toast({
      title: "Transaction added",
      description: "Your transaction has been successfully added",
    });
    
    // Reset form and close dialog
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your transaction below
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Transaction Type Selector */}
            <div className="flex rounded-md overflow-hidden w-full mb-2">
              <Button
                type="button"
                variant={isIncome ? "ghost" : "default"}
                className={cn(
                  "flex-1 rounded-none",
                  !isIncome ? "bg-spendwise-orange hover:bg-spendwise-orange/90" : ""
                )}
                onClick={() => handleTransactionTypeChange(false)}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={!isIncome ? "ghost" : "default"}
                className={cn(
                  "flex-1 rounded-none",
                  isIncome ? "bg-green-600 hover:bg-green-700" : ""
                )}
                onClick={() => handleTransactionTypeChange(true)}
              >
                Income
              </Button>
            </div>
            
            {/* Amount and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00" 
                          className="pl-7"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Merchant and Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="merchant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter merchant name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Account and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
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
              
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.category_id} value={category.category_id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cleared">Cleared</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose "Pending" for transactions that haven't been processed yet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className={cn(
                  isIncome ? "bg-green-600 hover:bg-green-700" : "bg-spendwise-orange hover:bg-spendwise-orange/90"
                )}
              >
                Add Transaction
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
