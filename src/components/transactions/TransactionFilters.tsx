
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronDown, Filter, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Category {
  category_id: string;
  name: string;
  parent_category_id: string | null;
}

interface Account {
  account_id: string;
  account_name: string;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categories: Category[];
  accounts: Account[];
  activeFilters: number;
}

export interface FilterState {
  search: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  accounts: string[];
  categories: string[];
  amountRange: {
    min: number | undefined;
    max: number | undefined;
  };
  transactionType: 'all' | 'income' | 'expense';
  status: 'all' | 'cleared' | 'pending';
}

const defaultFilters: FilterState = {
  search: '',
  dateRange: {
    from: undefined,
    to: undefined,
  },
  accounts: [],
  categories: [],
  amountRange: {
    min: undefined,
    max: undefined,
  },
  transactionType: 'all',
  status: 'all'
};

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  onFilterChange,
  categories,
  accounts,
  activeFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [searchValue, setSearchValue] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchValue });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setSearchValue('');
    onFilterChange(defaultFilters);
  };

  const handleDatePreset = (preset: 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear') => {
    const today = new Date();
    let from: Date | undefined;
    let to: Date | undefined;

    switch (preset) {
      case 'today':
        from = new Date();
        to = new Date();
        break;
      case 'yesterday':
        from = new Date();
        from.setDate(from.getDate() - 1);
        to = new Date();
        to.setDate(to.getDate() - 1);
        break;
      case 'thisWeek':
        from = new Date();
        from.setDate(from.getDate() - from.getDay());
        to = new Date();
        break;
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date();
        break;
      case 'lastMonth':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisYear':
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date();
        break;
    }

    setIsCalendarOpen(false);
    updateFilters({ dateRange: { from, to } });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-9"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button type="submit" variant="default" className="ml-2 bg-spendwise-oxford hover:bg-spendwise-oxford/90">
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Calendar size={16} />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "MMM d")} - {format(filters.dateRange.to, "MMM d")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b">
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleDatePreset('today')}>Today</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDatePreset('yesterday')}>Yesterday</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDatePreset('thisWeek')}>This Week</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDatePreset('thisMonth')}>This Month</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDatePreset('lastMonth')}>Last Month</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDatePreset('thisYear')}>This Year</Button>
                </div>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  <div className="grid gap-2">
                    <p className="text-sm text-gray-500">Custom Range</p>
                    <div className="border rounded-md p-2">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={filters.dateRange.from}
                        selected={{
                          from: filters.dateRange.from,
                          to: filters.dateRange.to,
                        }}
                        onSelect={(range) => {
                          updateFilters({
                            dateRange: {
                              from: range?.from,
                              to: range?.to,
                            },
                          });
                        }}
                        numberOfMonths={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter size={16} />
                Filters
                {activeFilters > 0 && (
                  <span className="ml-1 rounded-full bg-spendwise-orange text-white px-2 py-0.5 text-xs">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-3" align="end">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="accounts">
                  <AccordionTrigger className="text-sm font-medium">Accounts</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {accounts.map((account) => (
                        <div key={account.account_id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`account-${account.account_id}`}
                            checked={filters.accounts.includes(account.account_id)}
                            onChange={(e) => {
                              const newAccounts = e.target.checked 
                                ? [...filters.accounts, account.account_id] 
                                : filters.accounts.filter((id) => id !== account.account_id);
                              updateFilters({ accounts: newAccounts });
                            }}
                            className="rounded border-gray-300 text-spendwise-orange focus:ring-spendwise-orange mr-2"
                          />
                          <label htmlFor={`account-${account.account_id}`} className="text-sm">
                            {account.account_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="categories">
                  <AccordionTrigger className="text-sm font-medium">Categories</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.category_id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-${category.category_id}`}
                            checked={filters.categories.includes(category.category_id)}
                            onChange={(e) => {
                              const newCategories = e.target.checked 
                                ? [...filters.categories, category.category_id] 
                                : filters.categories.filter((id) => id !== category.category_id);
                              updateFilters({ categories: newCategories });
                            }}
                            className="rounded border-gray-300 text-spendwise-orange focus:ring-spendwise-orange mr-2"
                          />
                          <label htmlFor={`category-${category.category_id}`} className="text-sm">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="amount">
                  <AccordionTrigger className="text-sm font-medium">Amount Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="min-amount" className="text-sm text-gray-500 block mb-1">Minimum</label>
                        <Input
                          id="min-amount"
                          type="number"
                          placeholder="0.00"
                          value={filters.amountRange.min || ''}
                          onChange={(e) => {
                            updateFilters({
                              amountRange: {
                                ...filters.amountRange,
                                min: e.target.value ? Number(e.target.value) : undefined,
                              },
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="max-amount" className="text-sm text-gray-500 block mb-1">Maximum</label>
                        <Input
                          id="max-amount"
                          type="number"
                          placeholder="0.00"
                          value={filters.amountRange.max || ''}
                          onChange={(e) => {
                            updateFilters({
                              amountRange: {
                                ...filters.amountRange,
                                max: e.target.value ? Number(e.target.value) : undefined,
                              },
                            });
                          }}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="type">
                  <AccordionTrigger className="text-sm font-medium">Transaction Type</AccordionTrigger>
                  <AccordionContent>
                    <Select
                      value={filters.transactionType}
                      onValueChange={(value: 'all' | 'income' | 'expense') => {
                        updateFilters({ transactionType: value });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="income">Income Only</SelectItem>
                        <SelectItem value="expense">Expenses Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="status">
                  <AccordionTrigger className="text-sm font-medium">Status</AccordionTrigger>
                  <AccordionContent>
                    <Select
                      value={filters.status}
                      onValueChange={(value: 'all' | 'cleared' | 'pending') => {
                        updateFilters({ status: value });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="cleared">Cleared</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="flex justify-between mt-4">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset All
                </Button>
                <Button size="sm" className="bg-spendwise-orange hover:bg-spendwise-orange/90">
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
