
import { transactionService } from './TransactionService';
export const getTransactions = transactionService.getTransactions.bind(transactionService);
