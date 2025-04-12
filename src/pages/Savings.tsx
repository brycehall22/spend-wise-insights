
import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, Trash2, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, subMonths } from "date-fns";

// Define SavingsAccount interface properly with required fields
interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  accountType: string;
  institution: string;
}

// Mock data for savings accounts
const mockAccounts: SavingsAccount[] = [
  {
    id: "sav1",
    name: "Emergency Fund",
    balance: 15000,
    interestRate: 0.7,
    accountType: "savings",
    institution: "Chase Bank",
  },
  {
    id: "sav2",
    name: "Vacation Fund",
    balance: 3500,
    interestRate: 0.5,
    accountType: "savings",
    institution: "Wells Fargo",
  },
  {
    id: "sav3",
    name: "Retirement",
    balance: 85000,
    interestRate: 7.2,
    accountType: "investment",
    institution: "Vanguard",
  },
];

// Mock data for historical savings
const generateHistoricalData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(now, i);
    data.push({
      month: format(date, "MMM"),
      total: Math.round(95000 - i * 3500 + Math.random() * 2000),
      interest: Math.round(300 + Math.random() * 200),
      contributions: 2000 + Math.round(Math.random() * 500),
    });
  }
  
  return data;
};

const mockHistoricalData = generateHistoricalData();

// Form schema for account creation/editing
const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  balance: z.coerce.number().nonnegative("Balance cannot be negative"),
  interestRate: z.coerce.number().nonnegative("Interest rate cannot be negative"),
  accountType: z.string().min(1, "Account type is required"),
  institution: z.string().min(1, "Institution name is required"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export default function Savings() {
  const [accounts, setAccounts] = useState<SavingsAccount[]>(mockAccounts);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [historicalData] = useState(mockHistoricalData);

  // Setup form
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      balance: 0,
      interestRate: 0.5,
      accountType: "savings",
      institution: "",
    },
  });

  // Handle form submission
  const onSubmit = (values: AccountFormValues) => {
    if (editingAccount) {
      // Update existing account - ensure all required fields are included
      const updatedAccounts = accounts.map(account => 
        account.id === editingAccount.id ? { ...values, id: account.id } : account
      );
      setAccounts(updatedAccounts);
      toast({
        title: "Account updated",
        description: `${values.name} has been updated successfully`,
      });
    } else {
      // Add new account - ensure all required fields are included
      const newAccount: SavingsAccount = {
        id: `sav${accounts.length + 1}`,
        name: values.name,
        balance: values.balance,
        interestRate: values.interestRate,
        accountType: values.accountType,
        institution: values.institution
      };
      setAccounts([...accounts, newAccount]);
      toast({
        title: "Account added",
        description: `${values.name} has been added to your accounts`,
      });
    }

    setIsAddOpen(false);
    setEditingAccount(null);
    form.reset();
  };

  // Handle edit account
  const handleEditAccount = (account: SavingsAccount) => {
    setEditingAccount(account);
    form.reset({
      name: account.name,
      balance: account.balance,
      interestRate: account.interestRate,
      accountType: account.accountType,
      institution: account.institution,
    });
    setIsAddOpen(true);
  };

  // Handle delete account
  const handleDeleteAccount = (id: string) => {
    const updatedAccounts = accounts.filter(account => account.id !== id);
    setAccounts(updatedAccounts);
    toast({
      title: "Account deleted",
      description: "The savings account has been deleted",
    });
  };

  // Calculate total balance
  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  // Project balance in 1 year
  const projectBalance = (months: number) => {
    return accounts.reduce((total, account) => {
      const monthlyInterestRate = account.interestRate / 100 / 12;
      const projectedBalance = account.balance * Math.pow(1 + monthlyInterestRate, months);
      return total + projectedBalance;
    }, 0);
  };

  // Monthly savings rate calculation
  const monthlySavingsRate = 2500; // Mock monthly contribution
  const monthlyIncome = 8000; // Mock monthly income
  const savingsPercentage = (monthlySavingsRate / monthlyIncome) * 100;

  return (
    <PageTemplate 
      title="Savings Accounts" 
      subtitle="Manage and track your savings and investments"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${calculateTotalBalance().toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Across {accounts.length} accounts
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Projected in 1 Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${Math.round(projectBalance(12)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              With current interest rates
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {savingsPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              of monthly income
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Savings trend chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Savings Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Balance"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone" 
                  dataKey="interest" 
                  name="Interest Earned"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone" 
                  dataKey="contributions" 
                  name="Contributions"
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Accounts list */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Accounts</CardTitle>
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                <Plus className="mr-2 h-4 w-4" /> Add Account
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingAccount ? "Edit Account" : "Add New Account"}</SheetTitle>
                <SheetDescription>
                  {editingAccount 
                    ? "Update your savings account details" 
                    : "Add a new savings or investment account to track"}
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
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Emergency Fund" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="balance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Balance ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormDescription>
                            Annual percentage yield (APY)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="savings">Savings Account</SelectItem>
                              <SelectItem value="checking">Checking Account</SelectItem>
                              <SelectItem value="moneymarket">Money Market</SelectItem>
                              <SelectItem value="cd">Certificate of Deposit</SelectItem>
                              <SelectItem value="investment">Investment Account</SelectItem>
                              <SelectItem value="retirement">Retirement Account</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="institution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Financial Institution</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Chase Bank" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end pt-4">
                      <Button type="submit" className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                        {editingAccount ? "Update Account" : "Add Account"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
                <Wallet size={48} className="text-spendwise-orange" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Accounts Added</h2>
              <p className="text-gray-500 text-center max-w-md mb-6">
                Add your savings and investment accounts to track your financial growth
              </p>
              <Button 
                className="bg-spendwise-orange hover:bg-spendwise-orange/90"
                onClick={() => setIsAddOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Your First Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => {
                // Calculate monthly interest
                const monthlyInterest = account.balance * (account.interestRate / 100 / 12);
                
                return (
                  <div 
                    key={account.id} 
                    className="border rounded-lg p-4 flex flex-wrap justify-between items-center gap-4"
                  >
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="text-lg font-medium">{account.name}</h3>
                      <div className="text-sm text-gray-500 flex items-center">
                        <span className="capitalize">{account.accountType}</span>
                        <span className="mx-2">•</span>
                        <span>{account.institution}</span>
                      </div>
                    </div>
                    
                    <div className="min-w-[140px]">
                      <div className="text-xl font-bold">
                        ${account.balance.toLocaleString()}
                      </div>
                      <div className="text-sm flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        <span>
                          {account.interestRate}% APY
                        </span>
                      </div>
                    </div>
                    
                    <div className="min-w-[120px]">
                      <div className="text-sm text-gray-500">Monthly interest</div>
                      <div className="font-medium text-green-600">
                        +${monthlyInterest.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Savings calculator */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Compound Interest Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            See how your money can grow over time with compound interest
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">If you keep saving at your current rate:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">In 1 year:</span>
                    <span className="font-medium">${Math.round(projectBalance(12)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">In 5 years:</span>
                    <span className="font-medium">${Math.round(projectBalance(60)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">In 10 years:</span>
                    <span className="font-medium">${Math.round(projectBalance(120)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Recommended savings:</h3>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-sm">
                    Based on your income, aim to save at least{" "}
                    <span className="font-bold">${(monthlyIncome * 0.2).toLocaleString()}</span>{" "}
                    per month (20% of your income).
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Your savings breakdown:</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { year: "Now", amount: calculateTotalBalance() },
                    { year: "1yr", amount: projectBalance(12) },
                    { year: "3yr", amount: projectBalance(36) },
                    { year: "5yr", amount: projectBalance(60) },
                    { year: "10yr", amount: projectBalance(120) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, undefined]}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Projected Balance"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
