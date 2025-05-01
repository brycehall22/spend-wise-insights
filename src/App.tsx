
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Calendar from "./pages/Calendar";
import Subscriptions from "./pages/Subscriptions";
import Auth from "./pages/Auth";
import { Toaster } from "./components/ui/toaster";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
            <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
