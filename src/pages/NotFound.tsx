
import { Link } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-spendwise-platinum">
      <AppSidebar />
      
      <div className="pt-6 lg:pl-72 pr-6 pb-12 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-spendwise-orange/10">
              <Frown size={60} className="text-spendwise-orange" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-spendwise-oxford mb-2">Page Not Found</h1>
          <p className="text-gray-500 mb-6">
            Sorry, the page you're looking for doesn't exist or is still under construction.
          </p>
          <Button asChild className="bg-spendwise-orange hover:bg-spendwise-orange/90 text-white">
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
