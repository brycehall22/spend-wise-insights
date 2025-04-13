
import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ArrowDownRight, ArrowUpRight, CreditCard, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTransactionsByMonth, getTransactionsByDate } from "@/services/calendarService";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Calendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Get transactions for the month
  const { data: monthTransactions, isLoading: loadingMonth } = useQuery({
    queryKey: ['transactionsByMonth', date.toISOString().substring(0, 7)],
    queryFn: () => getTransactionsByMonth(date),
  });
  
  // Get transactions for the selected date
  const { data: dayTransactions, isLoading: loadingDay } = useQuery({
    queryKey: ['transactionsByDate', selectedDate?.toISOString().substring(0, 10)],
    queryFn: () => selectedDate ? getTransactionsByDate(selectedDate) : Promise.resolve([]),
    enabled: !!selectedDate,
  });
  
  // Group transactions by date
  const transactionsByDate = new Map<string, { income: number; expenses: number }>();
  
  if (monthTransactions) {
    monthTransactions.forEach(transaction => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');
      
      if (!transactionsByDate.has(dateKey)) {
        transactionsByDate.set(dateKey, { income: 0, expenses: 0 });
      }
      
      if (transaction.type === 'income') {
        transactionsByDate.get(dateKey)!.income += transaction.amount;
      } else {
        transactionsByDate.get(dateKey)!.expenses += transaction.amount;
      }
    });
  }
  
  // Function to handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  // Function to close the transaction dialog
  const handleCloseDialog = () => {
    setSelectedDate(null);
  };
  
  // Custom day rendering to show transaction indicators
  const renderDay = (day: Date, isSelected: boolean) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayData = transactionsByDate.get(dateKey);
    
    return (
      <div className="relative w-full h-full flex flex-col">
        <span className={`mx-auto ${isSelected ? 'text-white' : ''}`}>
          {format(day, 'd')}
        </span>
        {dayData && (
          <div className="flex justify-center mt-1 gap-1">
            {dayData.income > 0 && (
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            )}
            {dayData.expenses > 0 && (
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <PageTemplate 
      title="Financial Calendar" 
      subtitle="View your transactions organized by date"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loadingMonth ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <div className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={handleSelect}
                    month={date}
                    onMonthChange={setDate}
                    className="rounded-md border max-w-lg mx-auto"
                    components={{
                      Day: ({ date, ...props }) => (
                        <div {...props} className="w-10 h-10 p-0 flex items-center justify-center">
                          {renderDay(date, selectedDate?.toDateString() === date.toDateString())}
                        </div>
                      ),
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMonth ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : monthTransactions && monthTransactions.length > 0 ? (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{monthTransactions.length}</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Income</p>
                      <p className="text-xl font-bold text-green-600">
                        ${monthTransactions
                          .filter(t => t.type === 'income')
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Expenses</p>
                      <p className="text-xl font-bold text-red-600">
                        ${monthTransactions
                          .filter(t => t.type === 'expense')
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Transaction Days</h3>
                  <p className="text-sm text-muted-foreground">
                    {transactionsByDate.size} days with transactions
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No transactions found for this month</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add transactions to see them in the calendar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Transactions for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </DialogTitle>
            <DialogDescription>
              All transactions that occurred on this date
            </DialogDescription>
          </DialogHeader>
          
          {loadingDay ? (
            <div className="space-y-4 py-2">
              {[1, 2, 3].map(index => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : dayTransactions && dayTransactions.length > 0 ? (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 py-2">
                {dayTransactions.map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight size={16} className="text-green-600" />
                        ) : (
                          <ArrowDownRight size={16} className="text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.title}</p>
                        <p className="text-xs text-gray-500">{transaction.category} • {transaction.merchant}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-6 text-center">
              <CreditCard className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No transactions for this date</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleCloseDialog}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
