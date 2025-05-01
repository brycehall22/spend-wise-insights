import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from "@/services/savingsGoalService";
import { getCategories } from "@/services/categoryService";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addMonths, differenceInDays, differenceInMonths } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { 
  AlertCircle, 
  CalendarIcon, 
  CheckCircle2, 
  Edit, 
  Info, 
  LineChart, 
  Plus, 
  Target, 
  Trash2, 
  Trophy, 
  TrendingUp 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Textarea } from "@/components/ui/textarea";

// Goal types for better organization
const GOAL_TYPES = [
  { id: "emergency", name: "Emergency Fund", color: "bg-red-100 text-red-800", icon: <AlertCircle size={14} /> },
  { id: "retirement", name: "Retirement", color: "bg-blue-100 text-blue-800", icon: <LineChart size={14} /> },
  { id: "purchase", name: "Major Purchase", color: "bg-amber-100 text-amber-800", icon: <Target size={14} /> },
  { id: "travel", name: "Travel", color: "bg-green-100 text-green-800", icon: <Trophy size={14} /> },
  { id: "education", name: "Education", color: "bg-purple-100 text-purple-800", icon: <Info size={14} /> },
  { id: "debt", name: "Debt Payoff", color: "bg-slate-100 text-slate-800", icon: <TrendingUp size={14} /> },
  { id: "other", name: "Other", color: "bg-gray-100 text-gray-800", icon: <Target size={14} /> }
];

export default function Goals() {
  const [activeTab, setActiveTab] = useState("all");
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [sortBy, setSortBy] = useState("date"); // "date", "progress", "amount"
  const [goalDetailsOpen, setGoalDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    start_date: new Date().toISOString().split('T')[0],
    target_date: addMonths(new Date(), 6).toISOString().split('T')[0],
    category_id: "",
    goal_type: "other",
    notes: "",
    monthly_contribution: "",
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

  // Add contribution to goal mutation
  const addContributionMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => {
      // Find the current goal to get its current amount
      const goal = goals?.find(g => g.goal_id === id);
      if (!goal) throw new Error("Goal not found");
      
      // Calculate new amount
      const newAmount = goal.current_amount + amount;
      
      // Check if goal is now completed
      const isCompleted = newAmount >= goal.target_amount;
      
      // Update the goal
      return updateSavingsGoal(id, { 
        current_amount: newAmount,
        is_completed: isCompleted
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      setContributionModalOpen(false);
      setContributionAmount("");
      setSelectedGoal(null);
      toast({
        title: "Contribution added",
        description: "Your contribution has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding contribution",
        description: error.message || "An error occurred while adding the contribution",
        variant: "destructive",
      });
    }
  });
  
  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      goal_type: "other",
      notes: "",
      monthly_contribution: "",
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
      goal_type: goal.goal_type || "other",
      notes: goal.notes || "",
      monthly_contribution: goal.monthly_contribution ? String(goal.monthly_contribution) : "",
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
      goal_type: formData.goal_type,
      notes: formData.notes,
      monthly_contribution: formData.monthly_contribution ? parseFloat(formData.monthly_contribution) : undefined,
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

  // Handle add contribution
  const handleAddContribution = () => {
    if (selectedGoal && contributionAmount) {
      addContributionMutation.mutate({
        id: selectedGoal.goal_id,
        amount: parseFloat(contributionAmount)
      });
    }
  };

  // Function to calculate days remaining and estimate completion
  const calculateGoalStats = (goal: any) => {
    const today = new Date();
    const targetDate = new Date(goal.target_date);
    const startDate = new Date(goal.start_date);
    
    // Calculate days remaining
    const daysRemaining = differenceInDays(targetDate, today);
    
    // Calculate total days of goal
    const totalDays = differenceInDays(targetDate, startDate);
    
    // Calculate daily contribution needed to reach goal
    const amountRemaining = goal.target_amount - goal.current_amount;
    const dailyContributionNeeded = amountRemaining > 0 && daysRemaining > 0 ? amountRemaining / daysRemaining : 0;
    
    // Calculate monthly contribution needed
    const monthsRemaining = differenceInMonths(targetDate, today) + (targetDate.getDate() >= today.getDate() ? 0 : 1);
    const monthlyContributionNeeded = amountRemaining > 0 && monthsRemaining > 0 ? amountRemaining / monthsRemaining : 0;
    
    // Calculate if on track (based on time passed vs. progress made)
    const daysPassed = differenceInDays(today, startDate);
    const expectedProgress = totalDays > 0 ? daysPassed / totalDays : 0;
    const actualProgress = goal.target_amount > 0 ? goal.current_amount / goal.target_amount : 0;
    const isOnTrack = actualProgress >= expectedProgress;
    
    return {
      daysRemaining,
      dailyContributionNeeded,
      monthlyContributionNeeded,
      isOnTrack,
      totalDays,
      daysPassed,
      expectedProgress,
      actualProgress,
      amountRemaining
    };
  };
  
  // Function to view goal details
  const viewGoalDetails = (goal: any) => {
    setSelectedGoal(goal);
    setGoalDetailsOpen(true);
  };

  // Sort goals based on selected criteria
  const sortGoals = (goalsToSort: any[]) => {
    if (!goalsToSort) return [];

    switch (sortBy) {
      case "date":
        return [...goalsToSort].sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime());
      case "progress":
        return [...goalsToSort].sort((a, b) => {
          const aProgress = a.target_amount > 0 ? a.current_amount / a.target_amount : 0;
          const bProgress = b.target_amount > 0 ? b.current_amount / b.target_amount : 0;
          return bProgress - aProgress;
        });
      case "amount":
        return [...goalsToSort].sort((a, b) => b.target_amount - a.target_amount);
      default:
        return goalsToSort;
    }
  };
  
  // Filter goals based on active tab
  const filteredGoals = goals ? sortGoals(goals.filter(goal => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return !goal.is_completed;
    if (activeTab === "completed") return goal.is_completed;
    // Filter by goal type if it's one of the defined types
    return goal.goal_type === activeTab;
  })) : [];
  
  // Check if there's any mutation in progress
  const isSubmitting = createGoalMutation.isPending || 
                       updateGoalMutation.isPending || 
                       deleteGoalMutation.isPending ||
                       addContributionMutation.isPending;

  // Generate projected progress data for the selected goal
  const generateProjectedData = (goal: any) => {
    if (!goal) return [];
    
    const startDate = new Date(goal.start_date);
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    
    // Calculate monthly contribution (either from goal or estimated)
    const monthlyContribution = goal.monthly_contribution || 
                               (goal.target_amount - goal.current_amount) / 
                               Math.max(1, differenceInMonths(targetDate, today));
    
    const months = differenceInMonths(targetDate, startDate) + 1;
    const data = [];
    
    // Current progress point
    data.push({
      month: format(today, 'MMM'),
      amount: goal.current_amount,
      projected: null
    });
    
    // Future projections
    let projectedAmount = goal.current_amount;
    for (let i = 1; i <= Math.min(12, months); i++) {
      const projectionDate = addMonths(today, i);
      if (projectionDate > targetDate) break;
      
      projectedAmount += monthlyContribution;
      data.push({
        month: format(projectionDate, 'MMM'),
        amount: null,
        projected: Math.min(projectedAmount, goal.target_amount)
      });
    }
    
    return data;
  };

  // Calculate goal distribution by type for the All tab
  const calculateTypeDistribution = () => {
    if (!goals) return [];
    
    const types: Record<string, { count: number, amount: number, name: string }> = {};
    
    // Initialize with predefined types
    GOAL_TYPES.forEach(type => {
      types[type.id] = { count: 0, amount: 0, name: type.name };
    });
    
    // Count goals by type
    goals.forEach(goal => {
      const type = goal.goal_type || 'other';
      if (!types[type]) {
        types[type] = { count: 0, amount: 0, name: 'Other' };
      }
      types[type].count++;
      types[type].amount += goal.target_amount;
    });
    
    return Object.keys(types)
      .filter(key => types[key].count > 0)
      .map(key => ({
        type: key,
        name: types[key].name,
        count: types[key].count,
        amount: types[key].amount
      }));
  };

  // Get summary stats for the top of the page
  const getSummaryStats = () => {
    if (!goals) return { total: 0, completed: 0, active: 0, totalSaved: 0, totalTarget: 0 };
    
    const total = goals.length;
    const completed = goals.filter(g => g.is_completed).length;
    const active = total - completed;
    const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
    
    return { total, completed, active, totalSaved, totalTarget };
  };

  const stats = getSummaryStats();
  const typeDistribution = calculateTypeDistribution();

  return (
    <PageTemplate 
      title="Savings Goals" 
      subtitle="Track and manage your financial goals"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-100">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <div className="p-2 rounded-full bg-amber-100">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Saved</p>
              <p className="text-2xl font-bold">${stats.totalSaved.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">of ${stats.totalTarget.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-full bg-spendwise-orange/20">
              <Trophy className="w-6 h-6 text-spendwise-orange" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="active">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="retirement">Retirement</TabsTrigger>
            <TabsTrigger value="purchase">Purchases</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Due Date</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => {
            setEditingGoal(null);
            resetForm();
            setGoalModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>
      
      {/* All Goals Tab Content - Show Type Distribution */}
      {activeTab === "all" && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Distribution</CardTitle>
              <CardDescription>
                Your goals by type and total amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeDistribution.map(type => {
                  const goalType = GOAL_TYPES.find(t => t.id === type.type) || GOAL_TYPES[GOAL_TYPES.length - 1];
                  
                  return (
                    <div key={type.type} className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${goalType.color.split(' ')[0]}`}>
                        {goalType.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{type.name}</p>
                          <Badge variant="outline">{type.count}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">${type.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
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
            const stats = calculateGoalStats(goal);
            
            // Find goal type info
            const goalType = GOAL_TYPES.find(t => t.id === goal.goal_type) || GOAL_TYPES[GOAL_TYPES.length - 1];
            
            return (
              <Card 
                key={goal.goal_id} 
                className={cn(
                  "relative overflow-hidden",
                  goal.is_completed ? "border-green-200 bg-green-50" : ""
                )}
                onClick={() => viewGoalDetails(goal)}
              >
                {stats.isOnTrack && !goal.is_completed ? (
                  <div className="absolute top-0 right-0">
                    <div className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-bl-lg">
                      On Track
                    </div>
                  </div>
                ) : !goal.is_completed ? (
                  <div className="absolute top-0 right-0">
                    <div className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-bl-lg">
                      Needs Attention
                    </div>
                  </div>
                ) : null}
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <div className={cn("p-1 rounded-full mr-1", goalType.color.split(' ')[0])}>
                        {goalType.icon}
                      </div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                    </div>
                    {goal.is_completed && (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {goal.category_name ? `Category: ${goal.category_name}` : goalType.name}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>${goal.current_amount.toLocaleString()} saved</span>
                        <span className="font-medium">${goal.target_amount.toLocaleString()} goal</span>
                      </div>
                      <Progress 
                        value={percentComplete} 
                        className="h-2"
                        indicatorClassName={cn(
                          goal.is_completed ? "bg-green-600" : 
                          stats.isOnTrack ? "bg-blue-600" : "bg-amber-600"
                        )}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Started: {formattedStartDate}</span>
                        <span>Target: {formattedTargetDate}</span>
                      </div>
                    </div>
                    
                    {!goal.is_completed && (
                      <div className="text-xs text-muted-foreground">
                        <div className="flex justify-between mb-1">
                          <span>Time remaining:</span>
                          <span className="font-medium">{stats.daysRemaining} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Needed monthly:</span>
                          <span className="font-medium">${stats.monthlyContributionNeeded.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2">
                  <div className="flex gap-2 w-full">
                    {!goal.is_completed && (
                      <Button 
                        variant="outline" 
                        className="flex-1 bg-spendwise-orange/10 hover:bg-spendwise-orange/20 border-spendwise-orange/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGoal(goal);
                          setContributionModalOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2 text-spendwise-orange" />
                        Add Funds
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGoal(goal);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteGoalId(goal.goal_id);
                      }}
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
        <Card className="text-center py-10">
          <CardContent>
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No goals found</h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === "all" ? "You haven't created any goals yet." :
               activeTab === "active" ? "You have no active goals." :
               activeTab === "completed" ? "You haven't completed any goals yet." :
               `You have no ${activeTab} goals.`}
            </p>
            <Button onClick={() => {
              setEditingGoal(null);
              resetForm();
              setGoalModalOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create a Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Goal Creation/Edit Modal */}
      <Dialog open={goalModalOpen} onOpenChange={(open) => {
        setGoalModalOpen(open);
        if (!open) {
          setEditingGoal(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
            <DialogDescription>
              {editingGoal ? "Update your savings goal details." : "Set up a new savings goal to track your progress."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="target_amount" className="text-right">Target Amount</Label>
                <Input
                  id="target_amount"
                  name="target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current_amount" className="text-right">Current Amount</Label>
                <Input
                  id="current_amount"
                  name="current_amount"
                  type="number"
                  value={formData.current_amount}
                  onChange={handleChange}
                  className="col-span-3"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_date" className="text-right">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(new Date(formData.start_date), "PPP") : "Pick a date"}
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
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="target_date" className="text-right">Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !formData.target_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.target_date ? format(new Date(formData.target_date), "PPP") : "Pick a date"}
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
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category_id" className="text-right">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleSelectChange("category_id", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCategories ? (
                      <SelectItem value="loading">Loading...</SelectItem>
                    ) : categories?.map((category: any) => (
                      <SelectItem key={category.category_id} value={category.category_id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="goal_type" className="text-right">Goal Type</Label>
                <Select
                  value={formData.goal_type}
                  onValueChange={(value) => handleSelectChange("goal_type", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="monthly_contribution" className="text-right">Monthly Contribution</Label>
                <Input
                  id="monthly_contribution"
                  name="monthly_contribution"
                  type="number"
                  value={formData.monthly_contribution}
                  onChange={handleChange}
                  className="col-span-3"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setGoalModalOpen(false);
                  setEditingGoal(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteGoalId} onOpenChange={(open) => !open && setDeleteGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGoal}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contribution Modal */}
      <Dialog open={contributionModalOpen} onOpenChange={setContributionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Add funds to your savings goal: {selectedGoal?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contributionAmount" className="text-right">Amount</Label>
              <Input
                id="contributionAmount"
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                className="col-span-3"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setContributionModalOpen(false);
                setContributionAmount("");
                setSelectedGoal(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddContribution}
              disabled={isSubmitting || !contributionAmount}
            >
              {isSubmitting ? "Adding..." : "Add Contribution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Details Modal */}
      <Dialog open={goalDetailsOpen} onOpenChange={setGoalDetailsOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedGoal?.name}</DialogTitle>
            <DialogDescription>
              Detailed view of your savings goal progress and projections
            </DialogDescription>
          </DialogHeader>
          
          {selectedGoal && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Saved</span>
                        <span className="font-medium">${selectedGoal.current_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target</span>
                        <span className="font-medium">${selectedGoal.target_amount.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={selectedGoal.progress_percentage} 
                        className="h-2"
                        indicatorClassName={selectedGoal.is_completed ? "bg-green-600" : "bg-blue-600"}
                      />
                      <div className="text-sm text-muted-foreground">
                        {selectedGoal.progress_percentage.toFixed(1)}% complete
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Started</span>
                        <span>{format(new Date(selectedGoal.start_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Date</span>
                        <span>{format(new Date(selectedGoal.target_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Days Remaining</span>
                        <span>{calculateGoalStats(selectedGoal).daysRemaining}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Projected Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={generateProjectedData(selectedGoal)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          name="Current"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="projected" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          strokeDasharray="5 5" 
                          name="Projected"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type</span>
                      <span>
                        {GOAL_TYPES.find(t => t.id === selectedGoal.goal_type)?.name || 'Other'}
                      </span>
                    </div>
                    {selectedGoal.category_name && (
                      <div className="flex justify-between">
                        <span>Category</span>
                        <span>{selectedGoal.category_name}</span>
                      </div>
                    )}
                    {selectedGoal.monthly_contribution && (
                      <div className="flex justify-between">
                        <span>Monthly Contribution</span>
                        <span>${selectedGoal.monthly_contribution.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedGoal.notes && (
                      <div className="mt-4">
                        <p className="font-medium">Notes</p>
                        <p className="text-muted-foreground">{selectedGoal.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGoalDetailsOpen(false)}
            >
              Close
            </Button>
            {!selectedGoal?.is_completed && (
              <Button
                onClick={() => {
                  setContributionModalOpen(true);
                  setGoalDetailsOpen(false);
                }}
                className="bg-spendwise-orange/10 hover:bg-spendwise-orange/20 border-spendwise-orange/20"
              >
                <Plus className="h-4 w-4 mr-2 text-spendwise-orange" />
                Add Contribution
              </Button>
            )}
            <Button
              onClick={() => {
                handleEditGoal(selectedGoal);
                setGoalDetailsOpen(false);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
