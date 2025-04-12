
import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { BellRing, CreditCard, Download, Key, LogOut, RefreshCcw, Settings as SettingsIcon, Upload, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";

// User profile schema
const profileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
});

// Security settings schema
const securitySchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Notification preferences schema
const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  dailySummary: z.boolean().default(false),
  weeklyReport: z.boolean().default(true),
  billReminders: z.boolean().default(true),
  unusualActivity: z.boolean().default(true),
  budgetAlerts: z.boolean().default(true),
  goalProgress: z.boolean().default(true),
});

// Display preferences schema
const displaySchema = z.object({
  currency: z.string().min(1, { message: "Currency is required" }),
  dateFormat: z.string().min(1, { message: "Date format is required" }),
  theme: z.string().min(1, { message: "Theme is required" }),
  language: z.string().min(1, { message: "Language is required" }),
});

// Mock account data for connected accounts
const connectedAccounts = [
  {
    id: "acc1",
    name: "Chase Bank",
    type: "bank",
    logo: "https://logo.clearbit.com/chase.com",
    lastSync: "2025-04-10T12:30:00Z",
    status: "connected",
  },
  {
    id: "acc2",
    name: "Vanguard",
    type: "investment",
    logo: "https://logo.clearbit.com/vanguard.com",
    lastSync: "2025-04-11T09:15:00Z",
    status: "connected",
  },
  {
    id: "acc3",
    name: "American Express",
    type: "credit",
    logo: "https://logo.clearbit.com/americanexpress.com",
    lastSync: "2025-04-11T10:45:00Z",
    status: "error",
  },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Setup forms
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      phone: "+1 555-123-4567",
    },
  });
  
  const securityForm = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const notificationForm = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      dailySummary: false,
      weeklyReport: true,
      billReminders: true,
      unusualActivity: true,
      budgetAlerts: true,
      goalProgress: true,
    },
  });
  
  const displayForm = useForm({
    resolver: zodResolver(displaySchema),
    defaultValues: {
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      theme: "light",
      language: "en",
    },
  });
  
  // Handle form submissions
  const onProfileSubmit = (data) => {
    console.log("Profile data:", data);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };
  
  const onSecuritySubmit = (data) => {
    console.log("Security data:", data);
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully",
    });
    securityForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };
  
  const onNotificationSubmit = (data) => {
    console.log("Notification preferences:", data);
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated",
    });
  };
  
  const onDisplaySubmit = (data) => {
    console.log("Display preferences:", data);
    toast({
      title: "Display preferences saved",
      description: "Your display settings have been updated",
    });
  };
  
  // Handle account disconnect
  const handleDisconnectAccount = (accountId) => {
    console.log(`Disconnecting account: ${accountId}`);
    toast({
      title: "Account disconnected",
      description: "The financial account has been disconnected from SpendWise",
    });
  };

  return (
    <PageTemplate 
      title="Settings" 
      subtitle="Customize your SpendWise experience"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="md:w-64">
          <Card>
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                <TabsList className="flex flex-col h-auto items-stretch gap-1">
                  <TabsTrigger value="profile" className="justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="accounts" className="justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Connected Accounts
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="justify-start">
                    <BellRing className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="security" className="justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="display" className="justify-start">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Display
                  </TabsTrigger>
                  <TabsTrigger value="data" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Data Management
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          <div className="mt-6">
            <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1">
          <TabsContent value="profile" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>Used for account recovery and notifications</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="accounts" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Connected Financial Accounts</CardTitle>
                <CardDescription>
                  Manage your connected banks, credit cards, and investment accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectedAccounts.map((account) => (
                    <div 
                      key={account.id} 
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{account.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-3 md:mt-0">
                        <div className="text-sm text-gray-500">
                          <span className="mr-1">Last sync:</span>
                          <span>
                            {new Date(account.lastSync).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              toast({
                                title: "Syncing account",
                                description: "Your account is being synchronized",
                              });
                            }}
                          >
                            <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDisconnectAccount(account.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-center mt-6">
                    <Button onClick={() => {
                      toast({
                        title: "Coming soon",
                        description: "The ability to add new financial institutions is coming soon",
                      });
                    }}>
                      Connect a New Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Delivery Methods</h3>
                      <div className="space-y-2">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationForm.control}
                          name="pushNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Push Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications on your device
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <h3 className="text-base font-medium">Notification Types</h3>
                      <div className="space-y-2">
                        <FormField
                          control={notificationForm.control}
                          name="dailySummary"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Daily Summary</FormLabel>
                                <FormDescription>
                                  Get a daily summary of your financial activity
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationForm.control}
                          name="weeklyReport"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Weekly Report</FormLabel>
                                <FormDescription>
                                  Receive a weekly summary of your finances
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationForm.control}
                          name="billReminders"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Bill Reminders</FormLabel>
                                <FormDescription>
                                  Get reminded when bills are due
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationForm.control}
                          name="unusualActivity"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Unusual Activity</FormLabel>
                                <FormDescription>
                                  Be notified of suspicious or unusual transactions
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationForm.control}
                          name="budgetAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Budget Alerts</FormLabel>
                                <FormDescription>
                                  Receive alerts when approaching budget limits
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationForm.control}
                          name="goalProgress"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Goal Progress</FormLabel>
                                <FormDescription>
                                  Be updated on progress toward your financial goals
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                      Save Notification Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Change Password</h3>
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password should be at least 8 characters and include a mix of letters, numbers, and symbols
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Two-Factor Authentication</h3>
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Enable Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline">Setup 2FA</Button>
                      </div>
                    </div>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Session Management</h3>
                      <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Active Sessions</h4>
                          <p className="text-sm text-gray-500">You're currently logged in on 2 devices</p>
                        </div>
                        <Button variant="outline">Manage Sessions</Button>
                      </div>
                    </div>
                    <Button type="submit" className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                      Update Password
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="display" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>
                  Customize the look and feel of your SpendWise experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...displayForm}>
                  <form onSubmit={displayForm.handleSubmit(onDisplaySubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={displayForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                                <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                                <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                                <SelectItem value="CAD">CAD - Canadian Dollar (C$)</SelectItem>
                                <SelectItem value="AUD">AUD - Australian Dollar (A$)</SelectItem>
                                <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose your preferred currency for displaying financial information
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={displayForm.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select date format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (04/12/2025)</SelectItem>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (12/04/2025)</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-04-12)</SelectItem>
                                <SelectItem value="MMM D, YYYY">MMM D, YYYY (Apr 12, 2025)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={displayForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="light">Light Mode</SelectItem>
                                <SelectItem value="dark">Dark Mode</SelectItem>
                                <SelectItem value="system">Use System Setting</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={displayForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="de">Deutsch</SelectItem>
                                <SelectItem value="zh">中文</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit" className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                      Save Display Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Import, export, or delete your financial data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-5">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Download className="w-5 h-5 mr-2" /> Export Data
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Download your financial data for backup or analysis in external tools
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm">
                        Export as CSV
                      </Button>
                      <Button variant="outline" size="sm">
                        Export as PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        Export as JSON
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-5">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Upload className="w-5 h-5 mr-2" /> Import Data
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Import transactions, accounts, or budget data from other sources
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline">
                        Import CSV File
                      </Button>
                      <Button variant="outline">
                        Import QIF/OFX
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="border border-red-200 rounded-lg p-5 bg-red-50">
                    <h3 className="text-lg font-medium mb-2 text-red-700 flex items-center">
                      Delete Account Data
                    </h3>
                    <p className="text-sm text-red-600 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-100">
                      Delete My Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </PageTemplate>
  );
}
