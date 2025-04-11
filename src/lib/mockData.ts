
export const mockTransactions = [
  {
    id: 't1',
    date: '2023-04-01',
    description: 'Grocery Store',
    amount: 78.35,
    category: 'Groceries',
    type: 'expense'
  },
  {
    id: 't2',
    date: '2023-04-02',
    description: 'Coffee Shop',
    amount: 5.75,
    category: 'Dining Out',
    type: 'expense'
  },
  {
    id: 't3',
    date: '2023-04-03',
    description: 'Monthly Salary',
    amount: 3500,
    category: 'Income',
    type: 'income'
  },
  {
    id: 't4',
    date: '2023-04-05',
    description: 'Electric Bill',
    amount: 95.40,
    category: 'Utilities',
    type: 'expense'
  },
  {
    id: 't5',
    date: '2023-04-07',
    description: 'Internet Subscription',
    amount: 59.99,
    category: 'Utilities',
    type: 'expense'
  },
  {
    id: 't6',
    date: '2023-04-10',
    description: 'Restaurant Dinner',
    amount: 68.50,
    category: 'Dining Out',
    type: 'expense'
  },
  {
    id: 't7',
    date: '2023-04-15',
    description: 'Gasoline',
    amount: 45.23,
    category: 'Transportation',
    type: 'expense'
  },
  {
    id: 't8',
    date: '2023-04-18',
    description: 'Movie Tickets',
    amount: 24.00,
    category: 'Entertainment',
    type: 'expense'
  },
  {
    id: 't9',
    date: '2023-04-20',
    description: 'Freelance Payment',
    amount: 800,
    category: 'Income',
    type: 'income'
  },
  {
    id: 't10',
    date: '2023-04-25',
    description: 'Phone Bill',
    amount: 85.00,
    category: 'Utilities',
    type: 'expense'
  }
];

export const mockBudgets = [
  {
    id: 'b1',
    category: 'Groceries',
    budgeted: 400,
    spent: 310.25,
    remaining: 89.75,
    period: 'April 2023'
  },
  {
    id: 'b2',
    category: 'Dining Out',
    budgeted: 200,
    spent: 174.25,
    remaining: 25.75,
    period: 'April 2023'
  },
  {
    id: 'b3',
    category: 'Entertainment',
    budgeted: 150,
    spent: 124.00,
    remaining: 26.00,
    period: 'April 2023'
  },
  {
    id: 'b4',
    category: 'Utilities',
    budgeted: 300,
    spent: 240.39,
    remaining: 59.61,
    period: 'April 2023'
  },
  {
    id: 'b5',
    category: 'Transportation',
    budgeted: 200,
    spent: 155.45,
    remaining: 44.55,
    period: 'April 2023'
  },
  {
    id: 'b6',
    category: 'Shopping',
    budgeted: 150,
    spent: 187.34,
    remaining: -37.34,
    period: 'April 2023'
  }
];

export const mockIncomeVsExpenses = [
  { month: 'Jan', income: 4200, expenses: 3700 },
  { month: 'Feb', income: 4200, expenses: 3450 },
  { month: 'Mar', income: 5000, expenses: 3800 },
  { month: 'Apr', income: 4300, expenses: 3950 },
  { month: 'May', income: 4500, expenses: 3600 },
  { month: 'Jun', income: 4300, expenses: 3650 },
];

export const mockCategoryTrends = [
  { month: 'Jan', Groceries: 380, Utilities: 250, Entertainment: 120, Dining: 200, Transportation: 150 },
  { month: 'Feb', Groceries: 370, Utilities: 240, Entertainment: 140, Dining: 180, Transportation: 160 },
  { month: 'Mar', Groceries: 390, Utilities: 260, Entertainment: 110, Dining: 220, Transportation: 170 },
  { month: 'Apr', Groceries: 310, Utilities: 240, Entertainment: 124, Dining: 174, Transportation: 155 },
];

export const mockSavingsGoals = [
  {
    id: 'g1',
    name: 'Emergency Fund',
    target: 10000,
    current: 5700,
    deadline: '2023-12-31',
    category: 'Savings'
  },
  {
    id: 'g2',
    name: 'Vacation',
    target: 3000,
    current: 1850,
    deadline: '2023-08-15',
    category: 'Travel'
  },
  {
    id: 'g3',
    name: 'New Laptop',
    target: 1500,
    current: 1200,
    deadline: '2023-06-30',
    category: 'Electronics'
  }
];

export const mockInsights = [
  {
    id: 'i1',
    title: 'You\'re spending less on groceries',
    description: 'Your grocery spending is 18% lower than last month. Keep it up!',
    type: 'positive',
    category: 'Groceries'
  },
  {
    id: 'i2',
    title: 'Dining out expenses rising',
    description: 'You\'ve spent 15% more on restaurants compared to your 3-month average.',
    type: 'warning',
    category: 'Dining Out'
  },
  {
    id: 'i3',
    title: 'Shopping budget exceeded',
    description: 'You\'ve gone over your shopping budget by $37.34 this month.',
    type: 'negative',
    category: 'Shopping'
  },
  {
    id: 'i4',
    title: 'Emergency fund on track',
    description: 'You\'re on pace to reach your emergency fund goal by your target date.',
    type: 'positive',
    category: 'Savings'
  }
];

export const mockSubscriptions = [
  {
    id: 's1',
    name: 'Netflix',
    amount: 13.99,
    frequency: 'monthly',
    category: 'Entertainment',
    nextPayment: '2023-05-15'
  },
  {
    id: 's2',
    name: 'Spotify',
    amount: 9.99,
    frequency: 'monthly',
    category: 'Entertainment',
    nextPayment: '2023-05-07'
  },
  {
    id: 's3',
    name: 'Gym Membership',
    amount: 45.00,
    frequency: 'monthly',
    category: 'Health & Fitness',
    nextPayment: '2023-05-01'
  },
  {
    id: 's4',
    name: 'Cloud Storage',
    amount: 2.99,
    frequency: 'monthly',
    category: 'Software',
    nextPayment: '2023-05-10'
  }
];

export const getMonthlyTotals = () => {
  const income = mockTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = mockTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    income,
    expenses,
    net: income - expenses
  };
};

export const getSpendingByCategory = () => {
  const categoryTotals: Record<string, number> = {};

  mockTransactions
    .filter(transaction => transaction.type === 'expense')
    .forEach(transaction => {
      const { category, amount } = transaction;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += amount;
    });

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount
  }));
};

export const getCategoryColors = () => {
  return {
    Groceries: '#4CAF50',
    'Dining Out': '#FF9800',
    Utilities: '#2196F3',
    Transportation: '#9C27B0',
    Entertainment: '#F44336',
    Shopping: '#00BCD4',
    Income: '#8BC34A',
    Health: '#E91E63',
    'Health & Fitness': '#E91E63',
    Software: '#607D8B',
    Travel: '#3F51B5',
    Electronics: '#FF5722',
    Savings: '#009688',
  };
};
