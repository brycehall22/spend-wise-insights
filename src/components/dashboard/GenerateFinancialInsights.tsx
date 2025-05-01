import { Insight } from "./FinancialInsights";

interface FinancialData {
  currentIncome?: number;
  previousIncome?: number;
  currentExpenses?: number;
  previousExpenses?: number;
  currentSavingRate?: number;
  previousSavingRate?: number;
  topCategory?: { name: string, amount: number, percentage: number };
  categoryCount?: number;
  transactionCount?: number;
  totalCategories?: number;
  daysSinceLastTransaction?: number;
  incomeSourceCount?: number;
}

/**
 * Generates financial insights based on transaction data and financial metrics
 */
export function generateFinancialInsights(data: FinancialData): Insight[] {
  const insights: Insight[] = [];
  
  // Check if there's enough data to generate insights
  if (!data || Object.keys(data).length === 0) {
    return [];
  }
  
  // Income insights
  if (data.currentIncome !== undefined && data.previousIncome !== undefined) {
    const incomeChange = data.previousIncome > 0 
      ? ((data.currentIncome - data.previousIncome) / data.previousIncome) * 100 
      : 0;
    
    if (incomeChange > 10) {
      insights.push({
        id: 'income-increase',
        type: 'positive',
        title: 'Income Growth',
        description: `Your income has increased by ${incomeChange.toFixed(1)}% compared to last month.`
      });
    } else if (incomeChange < -5) {
      insights.push({
        id: 'income-decrease',
        type: 'warning',
        title: 'Income Decrease',
        description: `Your income has decreased by ${Math.abs(incomeChange).toFixed(1)}% compared to last month.`
      });
    }
  }
  
  // Expense insights
  if (data.currentExpenses !== undefined && data.previousExpenses !== undefined) {
    const expenseChange = data.previousExpenses > 0
      ? ((data.currentExpenses - data.previousExpenses) / data.previousExpenses) * 100
      : 0;
    
    if (expenseChange > 15) {
      insights.push({
        id: 'expense-increase',
        type: 'warning',
        title: 'Spending Increase',
        description: `Your expenses have increased by ${expenseChange.toFixed(1)}% compared to last month.`
      });
    } else if (expenseChange < -10) {
      insights.push({
        id: 'expense-decrease',
        type: 'positive',
        title: 'Spending Decrease',
        description: `Your expenses have decreased by ${Math.abs(expenseChange).toFixed(1)}% compared to last month.`
      });
    }
  }
  
  // Savings rate insights
  if (data.currentSavingRate !== undefined) {
    if (data.currentSavingRate < 0) {
      insights.push({
        id: 'negative-savings',
        type: 'negative',
        title: 'Negative Savings',
        description: 'You\'re spending more than you earn this month. Consider reducing unnecessary expenses.'
      });
    } else if (data.currentSavingRate > 20) {
      insights.push({
        id: 'high-savings',
        type: 'positive',
        title: 'Excellent Saving',
        description: `Your savings rate is ${data.currentSavingRate.toFixed(1)}%, which is excellent. Keep it up!`
      });
    } else if (data.currentSavingRate < 10) {
      insights.push({
        id: 'low-savings',
        type: 'warning',
        title: 'Low Savings Rate',
        description: `Your current savings rate is ${data.currentSavingRate.toFixed(1)}%. Consider increasing your savings to at least 15-20%.`
      });
    }
  }
  
  // Category spending insights
  if (data.topCategory) {
    if (data.topCategory.percentage > 40) {
      insights.push({
        id: 'high-category-spend',
        type: 'warning',
        title: 'High Category Spending',
        description: `${data.topCategory.percentage.toFixed(1)}% of your spending is on ${data.topCategory.name}. Consider diversifying your expenses.`
      });
    }
  }
  
  // Categorization insights
  if (data.categoryCount !== undefined && data.transactionCount !== undefined) {
    const uncategorizedPercentage = data.transactionCount > 0
      ? ((data.transactionCount - data.categoryCount) / data.transactionCount) * 100
      : 0;
    
    if (uncategorizedPercentage > 30) {
      insights.push({
        id: 'uncategorized',
        type: 'neutral',
        title: 'Categorize Transactions',
        description: `${uncategorizedPercentage.toFixed(1)}% of your transactions are uncategorized. Categorizing them will give you better insights.`
      });
    }
  }
  
  // Income source diversity
  if (data.incomeSourceCount !== undefined) {
    if (data.incomeSourceCount === 1) {
      insights.push({
        id: 'single-income',
        type: 'warning',
        title: 'Single Income Source',
        description: 'You have only one source of income. Consider diversifying your income streams to reduce financial risk.'
      });
    } else if (data.incomeSourceCount > 2) {
      insights.push({
        id: 'multiple-income',
        type: 'positive',
        title: 'Diverse Income',
        description: `You have ${data.incomeSourceCount} income sources, which helps reduce financial risk.`
      });
    }
  }
  
  // Recent activity
  if (data.daysSinceLastTransaction !== undefined && data.daysSinceLastTransaction > 7) {
    insights.push({
      id: 'update-transactions',
      type: 'neutral',
      title: 'Update Your Transactions',
      description: `It's been ${data.daysSinceLastTransaction} days since your last recorded transaction. Keep your records up to date for better insights.`
    });
  }
  
  // If we have fewer than 2 insights, add a generic one
  if (insights.length < 2) {
    insights.push({
      id: 'more-data',
      type: 'neutral',
      title: 'More Data Needed',
      description: 'Add more transactions over time to receive more personalized financial insights.'
    });
  }
  
  // Limit to 3 insights maximum
  return insights.slice(0, 3);
}

export default generateFinancialInsights;