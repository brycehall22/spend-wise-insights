import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { AddAccountDialog } from "@/components/accounts/AddAccountDialog";
import { AddCategoryDialog } from "@/components/categories/AddCategoryDialog";
import { createTransaction } from "@/services/transaction/transactionCore"; // Import directly from core

interface Account {
  account_id: string;
  account_name: string;
}

interface Category {
  category_id: string;
  name: string;
  is_income: boolean;
}

export interface AddTransactionDialogProps {
  // Allow usage of either isOpen or open for backwards compatibility
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onTransactionAdded: (data: any) => void;
  onAddTransaction?: (data: any) => void;
  accounts?: Account[];
  categories?: Category[];
  initialDate?: Date;
}

const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.date(),
  account_id: z.string().min(1, "Account is required"),
  category_id: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function AddTransactionDialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  onTransactionAdded,
  onAddTransaction,
  accounts = [],
  categories = [],
  initialDate,
}: AddTransactionDialogProps) {
  // For backwards compatibility, handle both prop styles
  const dialogOpen = isOpen ?? open ?? false;
  const handleClose = onClose ?? (() => onOpenChange?.(false));
  const handleTransactionAdded = onTransactionAdded ?? onAddTransaction ?? (() => {});

  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      date: initialDate || new Date(),
      account_id: accounts[0]?.account_id || "",
      category_id: "",
      notes: "",
    },
  });
  
  // Update date when initialDate prop changes
  useEffect(() => {
    if (initialDate) {
      form.setValue("date", initialDate);
    }
  }, [initialDate, form]);

  // Update account selection when accounts change
  useEffect(() => {
    if (accounts.length > 0 && !form.getValues("account_id")) {
      form.setValue("account_id", accounts[0].account_id);
    }
  }, [accounts, form]);

  const handleSubmit = async (values: TransactionFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { amount, description, date, account_id, category_id, notes } = values;

      // Adjust amount based on transaction type
      // For income: positive amount
      // For expense: negative amount
      const adjustedAmount = transactionType === "expense" 
        ? -Math.abs(amount)  // Make it negative for expense
        : Math.abs(amount);  // Make it positive for income

      console.log("Creating transaction with amount:", adjustedAmount, "Type:", transactionType);

      // Create the transaction
      const newTransaction = await createTransaction({
        account_id,
        category_id: category_id || null,
        amount: adjustedAmount,
        description,
        merchant: description, // Default to description for merchant if not provided
        transaction_date: date.toISOString().split('T')[0],
        currency: "USD", // Default currency
        status: "cleared",
      });

      // Notify parent about the new transaction
      handleTransactionAdded({
        ...newTransaction,
        type: transactionType,
      });

      // Reset form and close dialog
      form.reset();
      handleClose();
    } catch (error) {
      console.error("Error creating transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) => (transactionType === "income" && category.is_income) || 
                  (transactionType === "expense" && !category.is_income)
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange ?? (() => handleClose())}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            type="button"
            variant={transactionType === "expense" ? "default" : "outline"}
            className={transactionType === "expense" ? "bg-red-500 hover:bg-red-600" : ""}
            onClick={() => {
              setTransactionType("expense");
              
              // Update category if needed
              const currentCategoryId = form.getValues("category_id");
              if (currentCategoryId) {
                const currentCategory = categories.find(c => c.category_id === currentCategoryId);
                if (currentCategory?.is_income) {
                  form.setValue("category_id", ""); // Clear category if it's an income category
                }
              }
            }}
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={transactionType === "income" ? "default" : "outline"}
            className={transactionType === "income" ? "bg-green-500 hover:bg-green-600" : ""}
            onClick={() => {
              setTransactionType("income");
              
              // Update category if needed
              const currentCategoryId = form.getValues("category_id");
              if (currentCategoryId) {
                const currentCategory = categories.find(c => c.category_id === currentCategoryId);
                if (!currentCategory?.is_income) {
                  form.setValue("category_id", ""); // Clear category if it's an expense category
                }
              }
            }}
          >
            Income
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" step="0.01" {...field} />
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
                    <Input placeholder="E.g. Grocery shopping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="account_id"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Account</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddAccountOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Account
                      </Button>
                    </div>
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
            </div>
            
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Category</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddCategoryOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Category
                      </Button>
                    </div>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.length === 0 ? (
                          <SelectItem value="" disabled>
                            No {transactionType} categories available
                          </SelectItem>
                        ) : (
                          filteredCategories.map((category) => (
                            <SelectItem key={category.category_id} value={category.category_id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-spendwise-orange hover:bg-spendwise-orange/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <AddAccountDialog
          isOpen={isAddAccountOpen}
          onClose={() => setIsAddAccountOpen(false)}
        />

        <AddCategoryDialog
          isOpen={isAddCategoryOpen}
          onClose={() => setIsAddCategoryOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export default AddTransactionDialog;
