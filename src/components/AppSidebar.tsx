
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  Home,
  LineChart,
  LogOut,
  Menu,
  PiggyBank,
  Settings,
  Target,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
};

const NavItem = ({ icon, label, href, isActive, onClick }: NavItemProps) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
      isActive
        ? "bg-spendwise-orange text-spendwise-oxford font-medium"
        : "text-white hover:bg-white/10"
    )}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default function AppSidebar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const closeMobileMenu = () => setIsMobileOpen(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("There was a problem signing out");
    }
  };

  const navItems = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/" },
    { icon: <Wallet size={20} />, label: "Transactions", href: "/transactions" },
    { icon: <BarChart3 size={20} />, label: "Budgets", href: "/budgets" },
    { icon: <LineChart size={20} />, label: "Analytics", href: "/analytics" },
    { icon: <Target size={20} />, label: "Goals", href: "/goals" },
    { icon: <PiggyBank size={20} />, label: "Savings", href: "/savings" },
    { icon: <Calendar size={20} />, label: "Calendar", href: "/calendar" },
    { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-spendwise-oxford text-white z-50 transition-all duration-300 flex flex-col w-64 shadow-xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo and close button */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Wallet className="text-spendwise-orange" size={24} />
            <h1 className="font-bold text-lg">SpendWise</h1>
          </div>
          <button
            onClick={closeMobileMenu}
            className="lg:hidden text-white/80 hover:text-white"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={isActive(item.href)}
              onClick={closeMobileMenu}
            />
          ))}
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-white/10">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-spendwise-orange text-spendwise-oxford flex items-center justify-center font-bold">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-white/70 truncate">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:text-white rounded-md hover:bg-white/10 transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/auth"
                className="w-full px-3 py-2 text-center bg-spendwise-orange text-white rounded-md hover:bg-spendwise-orange/90 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile toggle button - moved outside the sidebar */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 bg-spendwise-oxford text-white p-2 rounded-md shadow-md"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Main content spacing */}
      <div className="lg:pl-64" />
    </>
  );
}
