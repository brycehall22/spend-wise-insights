import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/categoryService";
import { budgetService } from "@/services/budgetService";

type CreateBudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
};

export default function CreateBudgetDialog({
  open,
  onOpenChange,
  onSave,
}: CreateBudgetDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [budgetType, setBudgetType] = useState<string>("monthly");
  const [budgetName, setBudgetName] = useState<string>("");
  const [budgetTemplate, setBudgetTemplate] = useState<string>("new");
  const [amount, setAmount] = useState<string>("0");
  const [categoryId, setCategoryId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories for the dropdown
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(false), // Only expense categories
  });

  const resetForm = () => {
    setDate(new Date());
    setBudgetType("monthly");
    setBudgetName("");
    setBudgetTemplate("new");
    setAmount("0");
    setCategoryId("");
    setNotes("");
    setError(null);
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!date) {
        throw new Error("Please select a month");
      }

      if (!categoryId) {
        throw new Error("Please select a category");
      }

      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Please enter a valid amount greater than zero");
      }

      // Format the date as first day of month in YYYY-MM-DD format
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const formattedMonth = format(firstDayOfMonth, "yyyy-MM-dd");

      // Create the budget
      await budgetService.createBudget({
        category_id: categoryId,
        amount: amountValue,
        month: formattedMonth,
        notes: notes.trim() || null,
      });

      // Call the onSave callback to notify parent component
      onSave();
      
      // Close the dialog
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error creating budget:", err);
      setError(err.message || "Failed to create budget. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>
              Create a budget plan for a specific period to help track your spending and savings goals.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="col-span-1">
                Category
              </Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.category_id} value={category.category_id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No categories found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="col-span-1">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period" className="col-span-1">
                Type
              </Label>
              <Select
                value={budgetType}
                onValueChange={setBudgetType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select budget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="custom">Custom Period</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="col-span-1">
                Month
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMMM yyyy") : "Select a month"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="col-span-1 pt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                className="col-span-3"
                placeholder="Add any notes about this budget"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Budget"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
