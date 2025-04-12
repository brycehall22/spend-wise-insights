
import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, ChevronDown, PiggyBank, Plus, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Progress } from "@/components/ui/progress";

// Mock data
interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  accountType: string;
  institution: string;
}

const mockAccounts: SavingsAccount[] = [
  {
    id: "sa1",
    name: "Emergency Fund",
    balance: 9500,
    interestRate: 1.5,
    accountType: "High-Yield Savings",
    institution: "Ally Bank"
  },
  {
    id: "sa2",
    name: "Retirement Fund",
    balance: 42000,
    interestRate: 7.2,
    accountType: "401(k)",
    institution: "Vanguard"
  },
  {
    id: "sa3",
    name: "Vacation Fund",
    balance: 2800,
    interestRate: 1.2,
    accountType: "Regular Savings",
    institution: "Chase"
  },
  {
    id: "sa4",
    name: "Home Down Payment",
    balance: 15000,
    interestRate: 2.1,
    accountType: "CD",
    institution: "Capital One"
  }
];

const mockSavingsHistory = [
  { month: "Jan", savings: 8200 },
  { month: "Feb", savings: 8500 },
  { month: "Mar", savings: 8900 },
  { month: "Apr", savings: 9100 },
  { month: "May", savings: 9300 },
  { month: "Jun", savings: 9500 },
  { month: "Jul", savings: 9800 },
  { month: "Aug", savings: 10100 },
  { month: "Sep", savings: 10500 },
  { month: "Oct", savings: 10900 },
  { month: "Nov", savings: 11400 },
  { month: "Dec", savings: 12000 },
];

const mockSavingsRate = [
  { month: "Jan", savingsRate: 12 },
  { month: "Feb", savingsRate: 15 },
  { month: "Mar", savingsRate: 13 },
  { month: "Apr", savingsRate: 16 },
  { month: "May", savingsRate: 14 },
  { month: "Jun", savingsRate: 17 },
  { month: "Jul", savingsRate: 15 },
  { month: "Aug", savingsRate: 18 },
  { month: "Sep", savingsRate: 20 },
  { month: "Oct", savingsRate: 19 },
  { month: "Nov", savingsRate: 21 },
  { month: "Dec", savingsRate: 22 },
];

// Validation schema for adding/editing accounts
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | null>(null);
  
  const totalSavings = accounts.reduce((sum, account) => sum + account.balance, 0);
  const emergencyFundMonths = 6;
  const monthlyExpenses = 3500; // Mock monthly expenses
  const emergencyFundTarget = monthlyExpenses * emergencyFundMonths;
  const emergencyFundBalance = accounts.find(a => a.name === "Emergency Fund")?.balance || 0;
  const emergencyFundPercent = (emergencyFundBalance / emergencyFundTarget) * 100;

  // Setup form
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      balance: 0,
      interestRate: 0,
      accountType: "",
      institution: "",
    },
  });

  // Handle form submission
  const onSubmit = (values: AccountFormValues) => {
    if (editingAccount) {
      // Update existing account
      const updatedAccounts = accounts.map(account => 
        account.id === editingAccount.id ? { ...values, id: account.id } : account
      );
      setAccounts(updatedAccounts);
      toast({
        title: "Account updated",
        description: `${values.name} has been updated successfully`,
      });
    } else {
      // Add new account
      const newAccount: SavingsAccount = {
        id: `sa${accounts.length + 1}`,
        ...values,
      };
      setAccounts([...accounts, newAccount]);
      toast({
        title: "Account added",
        description: `${values.name} has been added to your savings accounts`,
      });
    }

    setIsAddDialogOpen(false);
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
    setIsAddDialogOpen(true);
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

  return (
    <PageTemplate 
      title="Savings" 
      subtitle="Manage and optimize your savings accounts"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="flex flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Savings</span>
                <PiggyBank className="h-5 w-5 text-spendwise-orange" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">${totalSavings.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Across {accounts.length} accounts</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Savings Rate</span>
                <ArrowUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">20%</div>
                <p className="text-xs text-gray-500 mt-1">Of monthly income</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Emergency Fund</span>
                <Wallet className="h-5 w-5 text-blue-500" />
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{(emergencyFundPercent).toFixed(0)}% Complete</span>
                  <span className="text-xs text-gray-500">Target: ${emergencyFundTarget.toLocaleString()}</span>
                </div>
                <Progress value={emergencyFundPercent} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  {(emergencyFundBalance / monthlyExpenses).toFixed(1)} months of expenses covered
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Savings Accounts</CardTitle>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                      <Plus className="mr-2 h-4 w-4" /> Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingAccount ? "Edit Account" : "Add New Savings Account"}</DialogTitle>
                      <DialogDescription>
                        {editingAccount ? "Update your savings account details" : "Enter the details of your savings account"}
                      </DialogDescription>
                    </DialogHeader>
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
                                  <SelectItem value="Regular Savings">Regular Savings</SelectItem>
                                  <SelectItem value="High-Yield Savings">High-Yield Savings</SelectItem>
                                  <SelectItem value="Money Market">Money Market</SelectItem>
                                  <SelectItem value="CD">Certificate of Deposit</SelectItem>
                                  <SelectItem value="401(k)">401(k)</SelectItem>
                                  <SelectItem value="IRA">IRA</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
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
                        <DialogFooter className="mt-6">
                          <Button type="submit" className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                            {editingAccount ? "Update Account" : "Add Account"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {accounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
                      <PiggyBank size={48} className="text-spendwise-orange" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Savings Accounts</h2>
                    <p className="text-gray-500 text-center max-w-md mb-6">
                      Add your savings accounts to track and optimize your savings
                    </p>
                    <Button 
                      className="bg-spendwise-orange hover:bg-spendwise-orange/90"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div key={account.id} className="border rounded-lg p-4">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                          <div>
                            <h3 className="text-lg font-medium">{account.name}</h3>
                            <p className="text-sm text-gray-500">{account.institution}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-semibold">${account.balance.toLocaleString()}</div>
                            <p className="text-sm text-gray-500">{account.interestRate}% APY</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-3">
                          <span className="text-gray-600">{account.accountType}</span>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => handleEditAccount(account)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAccount(account.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Growth Tab */}
          <TabsContent value="growth">
            <Card>
              <CardHeader>
                <CardTitle>Savings Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={mockSavingsHistory}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => [`$${value}`, "Total Savings"]} />
                      <Area 
                        type="monotone" 
                        dataKey="savings" 
                        stackId="1" 
                        stroke="#FCA311" 
                        fill="#FCA311" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Savings Growth Calculator</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Initial Amount</label>
                      <Input type="number" defaultValue="10000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Monthly Contribution</label>
                      <Input type="number" defaultValue="500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Annual Interest Rate (%)</label>
                      <Input type="number" defaultValue="2.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Period (Years)</label>
                      <Input type="number" defaultValue="5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Compounding</label>
                      <Select defaultValue="monthly">
                        <SelectTrigger>
                          <SelectValue placeholder="Select compounding frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                      Calculate
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="text-base font-medium mb-3">Projected Growth Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Future Value</p>
                        <p className="text-2xl font-bold">$44,325.68</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Contributions</p>
                        <p className="text-2xl font-bold">$40,000.00</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Interest Earned</p>
                        <p className="text-2xl font-bold">$4,325.68</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Return on Investment</p>
                        <p className="text-2xl font-bold">10.81%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Insights Tab */}
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Savings Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockSavingsRate}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, "Savings Rate"]} />
                      <Line 
                        type="monotone" 
                        dataKey="savingsRate" 
                        stroke="#14213D" 
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Savings Recommendations</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="flex items-center text-base font-medium text-blue-800">
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Increase Emergency Fund
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Your emergency fund covers {(emergencyFundBalance / monthlyExpenses).toFixed(1)} months of expenses. 
                        Consider increasing it to reach the recommended 6-month target.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-green-50">
                      <h4 className="flex items-center text-base font-medium text-green-800">
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Optimize Interest Rate
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Your current average interest rate is 2.8%. Consider moving funds from low-interest accounts 
                        to high-yield savings accounts offering 3.5%+ APY.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-amber-50">
                      <h4 className="flex items-center text-base font-medium text-amber-800">
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Automate Savings
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Set up automatic transfers to your savings accounts on payday to reach your savings target 
                        of at least 20% of your income.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
