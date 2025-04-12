
import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Plus, ArrowUp, ArrowDown, CreditCard } from "lucide-react";
import { format, isEqual, isWithinInterval, addDays, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";

// Types for financial events
interface FinancialEvent {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  isIncome: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  isPaid?: boolean;
}

// Mock data
const mockEvents: FinancialEvent[] = [
  {
    id: "fe1",
    title: "Rent Payment",
    amount: 1200,
    date: "2025-04-01",
    category: "Housing",
    isIncome: false,
    isRecurring: true,
    recurrencePattern: "monthly",
    isPaid: true
  },
  {
    id: "fe2",
    title: "Paycheck",
    amount: 3500,
    date: "2025-04-15",
    category: "Income",
    isIncome: true,
    isRecurring: true,
    recurrencePattern: "biweekly"
  },
  {
    id: "fe3",
    title: "Car Payment",
    amount: 350,
    date: "2025-04-10",
    category: "Transportation",
    isIncome: false,
    isRecurring: true,
    recurrencePattern: "monthly"
  },
  {
    id: "fe4",
    title: "Utilities",
    amount: 175,
    date: "2025-04-18",
    category: "Utilities",
    isIncome: false,
    isRecurring: true,
    recurrencePattern: "monthly"
  },
  {
    id: "fe5",
    title: "End-of-Month Paycheck",
    amount: 3500,
    date: "2025-04-30",
    category: "Income",
    isIncome: true,
    isRecurring: true,
    recurrencePattern: "biweekly"
  },
  {
    id: "fe6",
    title: "Internet Bill",
    amount: 65,
    date: "2025-04-22",
    category: "Utilities",
    isIncome: false,
    isRecurring: true,
    recurrencePattern: "monthly"
  },
  {
    id: "fe7",
    title: "Phone Bill",
    amount: 85,
    date: "2025-04-25",
    category: "Utilities",
    isIncome: false,
    isRecurring: true,
    recurrencePattern: "monthly"
  },
  {
    id: "fe8",
    title: "Insurance Premium",
    amount: 180,
    date: "2025-04-05",
    category: "Insurance",
    isIncome: false,
    isRecurring: true,
    recurrencePattern: "monthly",
    isPaid: true
  }
];

// Validation schema for event creation/editing
const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date({
    required_error: "Date is required",
  }),
  category: z.string().min(1, "Category is required"),
  isIncome: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function Calendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<FinancialEvent[]>(mockEvents);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FinancialEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  
  // Setup form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      amount: 0,
      date: new Date(),
      category: "",
      isIncome: false,
      isRecurring: false,
      recurrencePattern: "monthly",
    },
  });

  // Handle form submission
  const onSubmit = (values: EventFormValues) => {
    const formattedDate = format(values.date, "yyyy-MM-dd");
    
    if (editingEvent) {
      // Update existing event
      const updatedEvents = events.map(event => 
        event.id === editingEvent.id ? { 
          ...event, 
          title: values.title,
          amount: values.amount,
          date: formattedDate,
          category: values.category,
          isIncome: values.isIncome,
          isRecurring: values.isRecurring,
          recurrencePattern: values.isRecurring ? values.recurrencePattern : undefined,
        } : event
      );
      setEvents(updatedEvents);
      toast({
        title: "Event updated",
        description: `${values.title} has been updated successfully`,
      });
    } else {
      // Add new event
      const newEvent: FinancialEvent = {
        id: `fe${events.length + 1}`,
        title: values.title,
        amount: values.amount,
        date: formattedDate,
        category: values.category,
        isIncome: values.isIncome,
        isRecurring: values.isRecurring,
        recurrencePattern: values.isRecurring ? values.recurrencePattern : undefined,
      };
      setEvents([...events, newEvent]);
      toast({
        title: "Event added",
        description: `${values.title} has been added to your calendar`,
      });
    }

    setIsAddDialogOpen(false);
    setEditingEvent(null);
    form.reset();
  };

  // Handle edit event
  const handleEditEvent = (event: FinancialEvent) => {
    setEditingEvent(event);
    form.reset({
      title: event.title,
      amount: event.amount,
      date: parseISO(event.date),
      category: event.category,
      isIncome: event.isIncome,
      isRecurring: event.isRecurring,
      recurrencePattern: event.recurrencePattern,
    });
    setIsAddDialogOpen(true);
  };

  // Handle delete event
  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
    toast({
      title: "Event deleted",
      description: "The financial event has been deleted from your calendar",
    });
  };

  // Toggle paid status
  const togglePaidStatus = (id: string) => {
    const updatedEvents = events.map(event => 
      event.id === id ? { ...event, isPaid: !event.isPaid } : event
    );
    setEvents(updatedEvents);
    
    const eventTitle = events.find(e => e.id === id)?.title;
    toast({
      title: updatedEvents.find(e => e.id === id)?.isPaid ? "Marked as paid" : "Marked as unpaid",
      description: `${eventTitle} has been updated`,
    });
  };

  // Get events for the selected date
  const eventsForSelectedDate = selectedDate 
    ? events.filter(event => isSameDay(parseISO(event.date), selectedDate))
    : [];

  // Get events for the month view
  const getMonthEventsOnDate = (date: Date) => {
    return events.filter(event => isSameDay(parseISO(event.date), date));
  };

  // Get events for the week view
  const weekStart = startOfWeek(selectedDate || new Date());
  const weekEnd = endOfWeek(selectedDate || new Date());
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Calculate monthly cash flow
  const currentMonth = startOfMonth(date);
  const currentMonthEnd = endOfMonth(date);
  const currentMonthEvents = events.filter(event => {
    const eventDate = parseISO(event.date);
    return isWithinInterval(eventDate, { start: currentMonth, end: currentMonthEnd });
  });
  
  const totalIncome = currentMonthEvents
    .filter(event => event.isIncome)
    .reduce((sum, event) => sum + event.amount, 0);
  
  const totalExpenses = currentMonthEvents
    .filter(event => !event.isIncome)
    .reduce((sum, event) => sum + event.amount, 0);
  
  const cashFlow = totalIncome - totalExpenses;

  // Get date-specific content for the calendar
  const getDayContent = (day: Date) => {
    const dayEvents = getMonthEventsOnDate(day);
    
    if (dayEvents.length === 0) return null;
    
    return (
      <div className="absolute bottom-0 left-0 right-0 p-1 overflow-hidden">
        {dayEvents.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {dayEvents.slice(0, 2).map((event) => (
              <div 
                key={event.id} 
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  event.isIncome ? "bg-green-500" : "bg-red-500"
                )}
              />
            ))}
            {dayEvents.length > 2 && (
              <span className="text-[10px] text-gray-500">+{dayEvents.length - 2}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <PageTemplate 
      title="Financial Calendar" 
      subtitle="View and manage upcoming bills and financial events"
    >
      <div className="space-y-6">
        {/* Cash Flow Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
                <div className="flex items-center mt-1">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xl font-semibold">${totalIncome.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
                <div className="flex items-center mt-1">
                  <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xl font-semibold">${totalExpenses.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Net Cash Flow</h3>
                <div className="flex items-center mt-1">
                  {cashFlow >= 0 ? (
                    <>
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xl font-semibold text-green-600">+${cashFlow.toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-xl font-semibold text-red-600">-${Math.abs(cashFlow).toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "week" | "list")} className="w-auto">
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const newDate = new Date(date);
                newDate.setMonth(date.getMonth() - 1);
                setDate(newDate);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">
              {format(date, 'MMMM yyyy')}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const newDate = new Date(date);
                newDate.setMonth(date.getMonth() + 1);
                setDate(newDate);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setDate(new Date());
                setSelectedDate(new Date());
              }}
            >
              Today
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                  <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingEvent ? "Edit Event" : "Add Financial Event"}</DialogTitle>
                  <DialogDescription>
                    {editingEvent ? "Update your financial event details" : "Add a new bill, payment, or income event to your calendar"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Rent Payment" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount ($)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} />
                            </FormControl>
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
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Housing">Housing</SelectItem>
                                <SelectItem value="Utilities">Utilities</SelectItem>
                                <SelectItem value="Transportation">Transportation</SelectItem>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Insurance">Insurance</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Entertainment">Entertainment</SelectItem>
                                <SelectItem value="Income">Income</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                                  variant="outline"
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
                              <CalendarComponent
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
                    <FormField
                      control={form.control}
                      name="isIncome"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Income Event</FormLabel>
                            <FormDescription>
                              Mark this as an income event rather than an expense
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Recurring Event</FormLabel>
                            <FormDescription>
                              This event repeats on a regular schedule
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("isRecurring") && (
                      <FormField
                        control={form.control}
                        name="recurrencePattern"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recurrence Pattern</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pattern" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <DialogFooter>
                      <Button type="submit" className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                        {editingEvent ? "Update Event" : "Add Event"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Calendar Views */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className={cn(
            "lg:col-span-2",
            viewMode === "list" && "lg:col-span-3"
          )}>
            <Card>
              <CardContent className={cn(
                "p-0",
                viewMode !== "list" && "overflow-x-auto"
              )}>
                <TabsContent value="month" className="m-0">
                  <div className="p-4">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={date}
                      onMonthChange={setDate}
                      classNames={{
                        day_selected: "bg-spendwise-orange text-white hover:bg-spendwise-orange hover:text-white",
                        day_today: "bg-gray-100 text-gray-900"
                      }}
                      components={{
                        Day: ({ day, ...props }) => {
                          const dayEvents = getMonthEventsOnDate(day);
                          const hasEvents = dayEvents.length > 0;
                          const isToday = isSameDay(day, new Date());
                          const hasIncome = dayEvents.some(e => e.isIncome);
                          const hasExpense = dayEvents.some(e => !e.isIncome);
                          
                          return (
                            <div
                              {...props}
                              className={cn(
                                props.className,
                                "relative h-12 w-12 p-0 font-normal aria-selected:opacity-100",
                                hasEvents && "border-t-2",
                                hasIncome && hasExpense ? "border-t-purple-500" : 
                                hasIncome ? "border-t-green-500" : 
                                hasExpense ? "border-t-red-500" : "",
                                !isSameMonth(day, date) && "text-gray-400"
                              )}
                            >
                              <div className={cn(
                                "flex h-full w-full items-center justify-center",
                                isEqual(day, selectedDate) && "bg-spendwise-orange text-white rounded-md",
                                isToday && !isEqual(day, selectedDate) && "bg-gray-100 rounded-md"
                              )}>
                                {day.getDate()}
                              </div>
                              {getDayContent(day)}
                            </div>
                          );
                        },
                      }}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="week" className="m-0">
                  <div className="grid grid-cols-7 text-center border-b py-2 bg-gray-50">
                    {weekDays.map((day, i) => (
                      <div key={i} className="px-1">
                        <div className="text-sm font-medium mb-1">
                          {format(day, 'EEEEEE')}
                        </div>
                        <div 
                          className={cn(
                            "h-8 w-8 mx-auto rounded-full flex items-center justify-center text-sm",
                            isSameDay(day, new Date()) && "bg-blue-100",
                            isSameDay(day, selectedDate || new Date()) && "bg-spendwise-orange text-white"
                          )}
                          onClick={() => setSelectedDate(day)}
                        >
                          {format(day, 'd')}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 h-[500px] overflow-y-auto">
                    {weekDays.map((day, dayIdx) => {
                      const dayEvents = events.filter(event => 
                        isSameDay(parseISO(event.date), day)
                      ).sort((a, b) => a.isIncome === b.isIncome ? 0 : a.isIncome ? 1 : -1);
                      
                      return (
                        <div 
                          key={dayIdx} 
                          className={cn(
                            "border-r min-h-full p-2",
                            !isSameMonth(day, date) && "bg-gray-50",
                            isSameDay(day, new Date()) && "bg-blue-50"
                          )}
                        >
                          {dayEvents.map((event, eventIdx) => (
                            <div 
                              key={eventIdx}
                              className={cn(
                                "mb-2 p-2 rounded-md text-xs cursor-pointer hover:opacity-80",
                                event.isIncome ? "bg-green-100 border-l-4 border-green-500" : "bg-red-50 border-l-4 border-red-400"
                              )}
                              onClick={() => handleEditEvent(event)}
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="mt-1 flex justify-between items-center">
                                <span>
                                  ${event.amount.toLocaleString()}
                                </span>
                                {event.isRecurring && (
                                  <span className="text-[10px] bg-gray-200 px-1 rounded">
                                    {event.recurrencePattern}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="list" className="m-0 p-4">
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
                      <div className="flex gap-2">
                        <Badge className="bg-green-500">Income</Badge>
                        <Badge className="bg-red-500">Expense</Badge>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <Select defaultValue="date">
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="amount">Amount</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {currentMonthEvents.length > 0 ? (
                      <div className="divide-y">
                        {currentMonthEvents
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((event) => {
                            const eventDate = parseISO(event.date);
                            
                            return (
                              <div 
                                key={event.id} 
                                className="py-3 px-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between gap-4"
                                onClick={() => handleEditEvent(event)}
                              >
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1">
                                  <div className="text-sm font-medium w-24">
                                    {format(eventDate, 'MMM dd')}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{event.title}</div>
                                    <div className="text-sm text-gray-500">
                                      {event.category}
                                      {event.isRecurring && (
                                        <span className="ml-2 text-xs bg-gray-200 px-1 rounded">
                                          {event.recurrencePattern}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "font-semibold",
                                    event.isIncome ? "text-green-600" : "text-red-600"
                                  )}>
                                    {event.isIncome ? '+' : '-'}${event.amount.toLocaleString()}
                                  </span>
                                  
                                  {!event.isIncome && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePaidStatus(event.id);
                                      }}
                                      className={cn(
                                        event.isPaid ? "text-green-600" : "text-gray-400"
                                      )}
                                    >
                                      <CheckCircle className="h-5 w-5" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
                          <CalendarIcon size={48} className="text-spendwise-orange" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No Events This Month</h2>
                        <p className="text-gray-500 text-center max-w-md mb-6">
                          Add financial events to keep track of bills, payments, and income
                        </p>
                        <Button 
                          className="bg-spendwise-orange hover:bg-spendwise-orange/90"
                          onClick={() => setIsAddDialogOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Your First Event
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>

          {/* Details Panel */}
          {viewMode !== "list" && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsForSelectedDate.length > 0 ? (
                    <div className="space-y-3">
                      {eventsForSelectedDate.map((event) => (
                        <div 
                          key={event.id} 
                          className={cn(
                            "p-3 rounded-lg border",
                            event.isIncome ? "bg-green-50" : "bg-red-50"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{event.title}</h3>
                            <span className={cn(
                              "font-semibold",
                              event.isIncome ? "text-green-600" : "text-red-600"
                            )}>
                              {event.isIncome ? '+' : '-'}${event.amount.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Category:</span>
                              <span className="ml-1">{event.category}</span>
                            </div>
                            
                            <div>
                              <span className="text-gray-500">Type:</span>
                              <span className="ml-1">{event.isIncome ? 'Income' : 'Expense'}</span>
                            </div>
                            
                            {event.isRecurring && (
                              <div className="col-span-2">
                                <span className="text-gray-500">Recurrence:</span>
                                <span className="ml-1 capitalize">{event.recurrencePattern}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center">
                            {!event.isIncome && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePaidStatus(event.id)}
                                className={cn(
                                  "text-xs h-7",
                                  event.isPaid ? "bg-green-100 text-green-800" : ""
                                )}
                              >
                                {event.isPaid ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" /> Paid
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="h-3 w-3 mr-1" /> Mark Paid
                                  </>
                                )}
                              </Button>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEvent(event)}
                                className="h-7 px-2"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                                className="h-7 px-2 text-red-500 hover:text-red-600"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedDate ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <Clock className="h-12 w-12 text-gray-300 mb-2" />
                      <h3 className="font-medium mb-1">No events scheduled</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        There are no financial events for this date
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          form.setValue("date", selectedDate);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Event
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <CalendarIcon className="h-12 w-12 text-gray-300 mb-2" />
                      <h3 className="font-medium">Select a date</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Click on a date to view scheduled events
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}
