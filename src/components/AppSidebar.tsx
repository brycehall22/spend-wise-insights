
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  PiggyBank,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  User,
  CalendarClock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "./ui/use-toast";

export default function AppSidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Get user initials for avatar
  const initials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "SP";

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Transactions", icon: CreditCard, path: "/transactions" },
    { name: "Accounts", icon: Wallet, path: "/accounts" },
    { name: "Budgets", icon: PiggyBank, path: "/budgets" },
    { name: "Goals", icon: PiggyBank, path: "/goals" },
    { name: "Subscriptions", icon: CalendarClock, path: "/subscriptions" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
    { name: "Settings", icon: Settings, path: "/settings" }
  ];

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-40 lg:hidden">
        <button
          className="p-4 text-spendwise-oxford"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center h-16 px-6 border-b">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-spendwise-oxford">Budget App</span>
            </Link>
          </div>
          
          <div className="px-3 py-4">
            <div className="mb-4 flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-50">
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium text-sm truncate">{user?.email}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = 
                  item.path === "/" 
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-spendwise-orange text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-500")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="mt-auto px-3 py-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 text-gray-500" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 lg:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-spendwise-oxford">Budget App</span>
            </Link>
            <button
              className="text-spendwise-oxford"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="px-3 py-4">
            <div className="mb-4 flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-50">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-medium text-sm truncate">{user?.email}</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = 
                  item.path === "/" 
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-spendwise-orange text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-500")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="mt-auto px-3 py-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 text-gray-500" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
