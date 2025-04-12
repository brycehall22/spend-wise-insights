import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for financial events
interface FinancialEvent {
  id: string;
  title: string;
  amount: number;
  date: Date;
  type: "income" | "expense" | "transfer" | "bill";
  category?: string;
  isPaid?: boolean;
  isRecurring?: boolean;
}

const mockEvents: FinancialEvent[] = [
  {
    id: "evt1",
    title: "Salary Deposit",
    amount: 3500,
    date: new Date(2025, 3, 15),
    type: "income",
    category: "Salary",
    isRecurring: true
  },
  {
    id: "evt2",
    title: "Rent Payment",
    amount: 1200,
    date: new Date(2025, 3, 1),
    type: "expense",
    category: "Housing",
    isPaid: true,
    isRecurring: true
  },
  {
    id: "evt3",
    title: "Electric Bill",
    amount: 85.75,
    date: new Date(2025, 3, 10),
    type: "bill",
    category: "Utilities",
    isPaid: false,
    isRecurring: true
  },
  {
    id: "evt4",
    title: "Internet Bill",
    amount: 65.99,
    date: new Date(2025, 3, 5),
    type: "bill",
    category: "Utilities",
    isPaid: true,
    isRecurring: true
  },
  {
    id: "evt5",
    title: "Credit Card Payment",
    amount: 450,
    date: new Date(2025, 3, 20),
    type: "bill",
    category: "Debt",
    isPaid: false,
    isRecurring: true
  },
  {
    id: "evt6",
    title: "Savings Transfer",
    amount: 500,
    date: new Date(2025, 3, 16),
    type: "transfer",
    category: "Savings",
    isRecurring: true
  },
  {
    id: "evt7",
    title: "Grocery Shopping",
    amount: 120.50,
    date: new Date(2025, 3, 8),
    type: "expense",
    category: "Groceries"
  },
  {
    id: "evt8",
    title: "Freelance Payment",
    amount: 850,
    date: new Date(2025, 3, 22),
    type: "income",
    category: "Freelance"
  }
];

export default function Calendar() {
  const [events] = useState<FinancialEvent[]>(mockEvents);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<FinancialEvent | null>(null);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  
  // Navigate between months
  const nextMonth = () => setDisplayMonth(addMonths(displayMonth, 1));
  const prevMonth = () => setDisplayMonth(subMonths(displayMonth, 1));
  
  // Generate days for the current month view
  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Fill the starting days of the calendar grid
  const startDay = getDay(monthStart);
  const blanks = Array(startDay).fill(null);
  
  // Get events for a specific date
  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };
  
  // Count events by type for a specific date
  const countEventsByType = (date: Date, type: FinancialEvent["type"]) => {
    return events.filter(event => isSameDay(event.date, date) && event.type === type).length;
  };
  
  // Calculate sum of events by type for a specific date
  const sumEventsByType = (date: Date, type: FinancialEvent["type"]) => {
    return events
      .filter(event => isSameDay(event.date, date) && event.type === type)
      .reduce((sum, event) => sum + event.amount, 0);
  };
  
  // Format amount with currency symbol
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Mock data for accounts and categories (for AddTransactionDialog)
  const mockAccounts = [
    { account_id: "acc1", account_name: "Checking Account" },
    { account_id: "acc2", account_name: "Savings Account" },
    { account_id: "acc3", account_name: "Credit Card" },
  ];

  const mockCategories = [
    { category_id: "cat1", name: "Groceries", is_income: false },
    { category_id: "cat2", name: "Dining Out", is_income: false },
    { category_id: "cat3", name: "Transportation", is_income: false },
    { category_id: "cat4", name: "Utilities", is_income: false },
    { category_id: "cat5", name: "Housing", is_income: false },
    { category_id: "cat6", name: "Salary", is_income: true },
    { category_id: "cat7", name: "Freelance", is_income: true },
    { category_id: "cat8", name: "Investments", is_income: true },
  ];

  // Handle adding a transaction
  const handleAddTransaction = (transactionData: any) => {
    console.log("Adding transaction:", transactionData);
    // In a real app, you would dispatch this to Redux or make an API call
  };

  return (
    <PageTemplate 
      title="Financial Calendar" 
      subtitle="View and manage your scheduled transactions and bills"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                <span>{format(displayMonth, "MMMM yyyy")}</span>
              </div>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setDisplayMonth(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day labels */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-medium p-2 text-sm">
                  {day}
                </div>
              ))}
              
              {/* Empty cells */}
              {blanks.map((_, index) => (
                <div key={`blank-${index}`} className="aspect-square border rounded-md bg-gray-50"></div>
              ))}
              
              {/* Calendar days */}
              {monthDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;
                const incomeCount = countEventsByType(day, "income");
                const expenseCount = countEventsByType(day, "expense") + countEventsByType(day, "bill");
                const incomeTotal = sumEventsByType(day, "income");
                const expenseTotal = sumEventsByType(day, "expense") + sumEventsByType(day, "bill");
                
                return (
                  <div 
                    key={day.toString()} 
                    className={cn(
                      "aspect-square p-1 border rounded-md transition-colors cursor-pointer hover:bg-gray-100",
                      isToday && "border-blue-300 bg-blue-50 hover:bg-blue-100",
                      isSelected && "ring-2 ring-spendwise-orange",
                      !isSameMonth(day, displayMonth) && "opacity-50"
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="h-full flex flex-col">
                      <div className="text-right text-sm font-medium p-1">
                        {format(day, "d")}
                      </div>
                      
                      {hasEvents && (
                        <div className="flex-1 overflow-hidden text-xs">
                          {incomeCount > 0 && (
                            <div className="text-green-600 truncate">
                              +{formatCurrency(incomeTotal)}
                            </div>
                          )}
                          {expenseCount > 0 && (
                            <div className="text-red-600 truncate">
                              -{formatCurrency(expenseTotal)}
                            </div>
                          )}
                          
                          {dayEvents.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div 
                                  key={event.id} 
                                  className={cn(
                                    "w-full truncate rounded-sm px-1 py-0.5",
                                    event.type === "income" && "bg-green-100 text-green-700",
                                    event.type === "expense" && "bg-red-100 text-red-700",
                                    event.type === "bill" && "bg-amber-100 text-amber-700",
                                    event.type === "transfer" && "bg-blue-100 text-blue-700"
                                  )}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-gray-500 text-xs">
                                  + {dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Events for selected day */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">
              {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
            <Button 
              size="sm" 
              className="bg-spendwise-orange hover:bg-spendwise-orange/90"
              onClick={() => setIsAddTransactionOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Event
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getEventsForDay(selectedDate).length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No events scheduled for this day</p>
                  <Button 
                    className="mt-4 bg-spendwise-orange hover:bg-spendwise-orange/90"
                    onClick={() => setIsAddTransactionOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Event
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[50vh]">
                  <div className="space-y-2">
                    {getEventsForDay(selectedDate).map((event) => (
                      <div 
                        key={event.id}
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <p className="text-sm text-gray-500">
                              {event.category} 
                              {event.isRecurring && " • Recurring"}
                            </p>
                          </div>
                          <div className={cn(
                            "font-medium",
                            event.type === "income" ? "text-green-600" : "text-red-600"
                          )}>
                            {event.type === "income" ? "+" : "-"}{formatCurrency(event.amount)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex gap-2">
                            <Badge variant="outline" className={cn(
                              event.type === "income" && "border-green-200 bg-green-50 text-green-700",
                              event.type === "expense" && "border-red-200 bg-red-50 text-red-700",
                              event.type === "bill" && "border-amber-200 bg-amber-50 text-amber-700",
                              event.type === "transfer" && "border-blue-200 bg-blue-50 text-blue-700"
                            )}>
                              {event.type}
                            </Badge>
                            {event.type === "bill" && (
                              <Badge variant={event.isPaid ? "outline" : "default"} className={
                                event.isPaid 
                                  ? "border-green-200 bg-green-50 text-green-700" 
                                  : "bg-yellow-500"
                              }>
                                {event.isPaid ? "Paid" : "Due"}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(event.date, "h:mm a")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Event detail dialog */}
      <Dialog
        open={selectedEvent !== null}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Amount</div>
                    <div className={cn(
                      "text-xl font-semibold",
                      selectedEvent.type === "income" ? "text-green-600" : "text-red-600"
                    )}>
                      {selectedEvent.type === "income" ? "+" : "-"}{formatCurrency(selectedEvent.amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="text-base">
                      {format(selectedEvent.date, "MMMM d, yyyy")}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="capitalize">{selectedEvent.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div>{selectedEvent.category || "Uncategorized"}</div>
                  </div>
                </div>
                
                {selectedEvent.type === "bill" && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <Badge variant={selectedEvent.isPaid ? "outline" : "default"} className={
                      selectedEvent.isPaid 
                        ? "border-green-200 bg-green-50 text-green-700" 
                        : "bg-yellow-500"
                    }>
                      {selectedEvent.isPaid ? "Paid" : "Due"}
                    </Badge>
                  </div>
                )}
                
                <div className="pt-4 flex justify-end space-x-2">
                  {selectedEvent.type === "bill" && !selectedEvent.isPaid && (
                    <Button className="bg-green-600 hover:bg-green-700">
                      Mark as Paid
                    </Button>
                  )}
                  <Button variant="outline">
                    Edit
                  </Button>
                  <Button variant="destructive">
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        onAddTransaction={handleAddTransaction}
        accounts={mockAccounts}
        categories={mockCategories}
      />
    </PageTemplate>
  );
}
