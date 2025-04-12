import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, Check, Plus, Target, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  priority: "low" | "medium" | "high";
}

const mockGoals: Goal[] = [
  {
    id: "g1",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 5500,
    deadline: new Date(2025, 3, 15),
    category: "savings",
    priority: "high",
  },
  {
    id: "g2",
    name: "New Car",
    targetAmount: 25000,
    currentAmount: 8000,
    deadline: new Date(2025, 8, 1),
    category: "purchase",
    priority: "medium",
  },
  {
    id: "g3",
    name: "Vacation",
    targetAmount: 3000,
    currentAmount: 2800,
    deadline: new Date(2024, 11, 10),
    category: "travel",
    priority: "low",
  },
  {
    id: "g4", 
    name: "Down Payment",
    targetAmount: 50000,
    currentAmount: 12000,
    deadline: new Date(2026, 6, 30),
    category: "housing",
    priority: "high",
  }
];

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.coerce.number().positive("Amount must be positive"),
  currentAmount: z.coerce.number().nonnegative("Amount cannot be negative"),
  deadline: z.date().refine(date => date > new Date(), {
    message: "Deadline must be in the future",
  }),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["low", "medium", "high"]),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      category: "savings",
      priority: "medium",
    },
  });

  const onSubmit = (values: GoalFormValues) => {
    if (editingGoal) {
      const updatedGoals = goals.map(goal => 
        goal.id === editingGoal.id ? { ...goal, ...values } : goal
      );
      setGoals(updatedGoals);
      toast({
        title: "Goal updated",
        description: `${values.name} has been updated successfully`,
      });
    } else {
      const newGoal: Goal = {
        id: `g${goals.length + 1}`,
        name: values.name, 
        targetAmount: values.targetAmount,
        currentAmount: values.currentAmount,
        deadline: values.deadline,
        category: values.category,
        priority: values.priority
      };
      setGoals([...goals, newGoal]);
      toast({
        title: "Goal created",
        description: `${values.name} has been added to your financial goals`,
      });
    }

    setIsAddOpen(false);
    setEditingGoal(null);
    form.reset();
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    form.reset({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      category: goal.category,
      priority: goal.priority,
    });
    setIsAddOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    setGoals(updatedGoals);
    toast({
      title: "Goal deleted",
      description: "The financial goal has been deleted",
    });
  };

  const calculateMonthlyContribution = (goal: Goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const today = new Date();
    const monthsLeft = 
      (goal.deadline.getFullYear() - today.getFullYear()) * 12 + 
      (goal.deadline.getMonth() - today.getMonth());
    
    return monthsLeft > 0 ? remaining / monthsLeft : remaining;
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <PageTemplate 
      title="Financial Goals" 
      subtitle="Set and track your financial goals"
    >
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Goals</CardTitle>
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
              <SheetTrigger asChild>
                <Button className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                  <Plus className="mr-2 h-4 w-4" /> Add New Goal
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</SheetTitle>
                  <SheetDescription>
                    {editingGoal ? "Update your financial goal details" : "Set up a new financial goal with target and deadline"}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goal Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Emergency Fund" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="targetAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Amount ($)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currentAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Amount ($)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} />
                            </FormControl>
                            <FormDescription>
                              How much you've already saved towards this goal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Target Deadline</FormLabel>
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
                                  disabled={(date) =>
                                    date < new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="savings">Savings</SelectItem>
                                <SelectItem value="purchase">Major Purchase</SelectItem>
                                <SelectItem value="housing">Housing</SelectItem>
                                <SelectItem value="travel">Travel</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                                <SelectItem value="retirement">Retirement</SelectItem>
                                <SelectItem value="debt">Debt Repayment</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                          {editingGoal ? "Update Goal" : "Create Goal"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </SheetContent>
            </Sheet>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
                  <Target size={48} className="text-spendwise-orange" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Goals Yet</h2>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Start setting financial goals to track your progress and stay motivated
                </p>
                <Button 
                  className="bg-spendwise-orange hover:bg-spendwise-orange/90"
                  onClick={() => setIsAddOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {goals.map((goal) => {
                  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                  const monthlyContribution = calculateMonthlyContribution(goal);
                  
                  return (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                        <div className="flex-1 min-w-[200px]">
                          <h3 className="text-lg font-medium">{goal.name}</h3>
                          <div className="text-sm text-gray-500">
                            Due by {format(goal.deadline, "PPP")}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditGoal(goal)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="flex flex-wrap justify-between text-sm mb-3">
                        <span className="font-medium">
                          ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                        </span>
                        <span className={cn(
                          "font-medium",
                          progress === 100 ? "text-green-600" : ""
                        )}>
                          {progress}% {progress === 100 && <Check className="inline h-4 w-4" />}
                        </span>
                      </div>
                      
                      <div className="mt-4 text-sm">
                        <div className="flex flex-wrap justify-between gap-2">
                          <div>
                            <span className="text-gray-500">Category: </span>
                            <span className="capitalize">{goal.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Priority: </span>
                            <span className={cn(
                              "capitalize", 
                              goal.priority === "high" ? "text-red-500" : 
                              goal.priority === "medium" ? "text-amber-500" : 
                              "text-blue-500"
                            )}>
                              {goal.priority}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-gray-500">Suggested monthly contribution: </span>
                          <span className="font-semibold">${monthlyContribution.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
