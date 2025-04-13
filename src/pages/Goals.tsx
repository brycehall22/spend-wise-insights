import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from "@/services/savingsGoalService";
import { getCategories } from "@/services/categoryService";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addMonths } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { CalendarIcon, Check, CheckCircle2, Circle, Edit, Plus, Target, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Goals() {
  const [activeTab, setActiveTab] = useState("all");
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    start_date: new Date().toISOString().split('T')[0],
    target_date: addMonths(new Date(), 6).toISOString().split('T')[0],
    category_id: "",
  });
  
  const queryClient = useQueryClient();
  
  // Fetch all savings goals
  const { data: goals, isLoading: loadingGoals } = useQuery({
    queryKey: ['savingsGoals'],
    queryFn: getSavingsGoals
  });
  
  // Fetch categories for the form
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories()
  });
  
  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (goalData: any) => createSavingsGoal(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      setGoalModalOpen(false);
      resetForm();
      toast({
        title: "Goal created",
        description: "Your savings goal has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating goal",
        description: error.message || "An error occurred while creating the goal",
        variant: "destructive",
      });
    }
  });
  
  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSavingsGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      setGoalModalOpen(false);
      setEditingGoal(null);
      resetForm();
      toast({
        title: "Goal updated",
        description: "Your savings goal has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating goal",
        description: error.message || "An error occurred while updating the goal",
        variant: "destructive",
      });
    }
  });
  
  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: (goalId: string) => deleteSavingsGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      setDeleteGoalId(null);
      toast({
        title: "Goal deleted",
        description: "Your savings goal has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting goal",
        description: error.message || "An error occurred while deleting the goal",
        variant: "destructive",
      });
    }
  });
  
  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData({
        ...formData,
        [name]: date.toISOString().split('T')[0]
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      target_amount: "",
      current_amount: "",
      start_date: new Date().toISOString().split('T')[0],
      target_date: addMonths(new Date(), 6).toISOString().split('T')[0],
      category_id: "",
    });
  };
  
  // Open edit modal
  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    
    setFormData({
      name: goal.name,
      target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount),
      start_date: goal.start_date,
      target_date: goal.target_date,
      category_id: goal.category_id || "",
    });
    
    setGoalModalOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
      name: formData.name,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount || "0"),
      start_date: formData.start_date,
      target_date: formData.target_date,
      category_id: formData.category_id || null,
    };
    
    if (editingGoal) {
      updateGoalMutation.mutate({
        id: editingGoal.goal_id,
        data: goalData
      });
    } else {
      createGoalMutation.mutate(goalData);
    }
  };
  
  // Handle delete goal
  const handleDeleteGoal = () => {
    if (deleteGoalId) {
      deleteGoalMutation.mutate(deleteGoalId);
    }
  };
  
  // Filter goals based on active tab
  const filteredGoals = goals ? goals.filter(goal => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return !goal.is_completed;
    if (activeTab === "completed") return goal.is_completed;
    return true;
  }) : [];
  
  // Check if there's any mutation in progress
  const isSubmitting = createGoalMutation.isPending || updateGoalMutation.isPending || deleteGoalMutation.isPending;

  return (
    <PageTemplate 
      title="Savings Goals" 
      subtitle="Track and manage your financial goals"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="active">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={() => {
          setEditingGoal(null);
          resetForm();
          setGoalModalOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>
      
      {/* Goals List */}
      {loadingGoals ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map(goal => {
            const percentComplete = goal.progress_percentage || 0;
            const formattedStartDate = format(new Date(goal.start_date), 'MMM d, yyyy');
            const formattedTargetDate = format(new Date(goal.target_date), 'MMM d, yyyy');
            
            return (
              <Card key={goal.goal_id} className={cn(
                goal.is_completed ? "border-green-200 bg-green-50" : ""
              )}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-spendwise-orange" />
                      <span className="truncate">{goal.name}</span>
                    </CardTitle>
                    {goal.is_completed && (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Completed
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    {goal.category_name ? `Category: ${goal.category_name}` : 'No category'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>${goal.current_amount.toLocaleString()} saved</span>
                        <span className="font-medium">${goal.target_amount.toLocaleString()} goal</span>
                      </div>
                      <Progress value={percentComplete} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Started: {formattedStartDate}</span>
                        <span>Target: {formattedTargetDate}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2">
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditGoal(goal)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => setDeleteGoalId(goal.goal_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No savings goals found</h3>
          <p className="text-muted-foreground mb-4">
            Start creating savings goals to track your financial progress
          </p>
          <Button onClick={() => {
            setEditingGoal(null);
            resetForm();
            setGoalModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        </div>
      )}
      
      {/* Create/Edit Goal Modal */}
      <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit" : "Create"} Savings Goal</DialogTitle>
            <DialogDescription>
              {editingGoal 
                ? "Update the details of your savings goal" 
                : "Set up a new savings goal to track your progress"
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., New Car, Emergency Fund"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_amount">Target Amount ($)</Label>
                <Input 
                  id="target_amount"
                  name="target_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={handleChange}
                  placeholder="5000.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="current_amount">Current Amount ($)</Label>
                <Input 
                  id="current_amount"
                  name="current_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Category (Optional)</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleSelectChange("category_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories && categories.map(category => (
                    <SelectItem key={category.category_id} value={category.category_id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(new Date(formData.start_date), 'PP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date ? new Date(formData.start_date) : undefined}
                      onSelect={(date) => handleDateChange("start_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.target_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.target_date ? format(new Date(formData.target_date), 'PP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.target_date ? new Date(formData.target_date) : undefined}
                      onSelect={(date) => handleDateChange("target_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setGoalModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <span className="animate-spin mr-2">●</span>}
                {editingGoal ? "Update" : "Create"} Goal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Goal Confirmation */}
      <AlertDialog open={!!deleteGoalId} onOpenChange={(open) => !open && setDeleteGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Savings Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this savings goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGoal}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting && <span className="animate-spin mr-2">●</span>}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
}
