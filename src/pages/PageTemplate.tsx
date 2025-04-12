
import React from "react";
import AppSidebar from "@/components/AppSidebar";

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageTemplate({ 
  title, 
  subtitle, 
  actions, 
  children 
}: PageTemplateProps) {
  return (
    <div className="min-h-screen bg-spendwise-platinum">
      <AppSidebar />
      
      <div className="pt-6 lg:pl-72 pr-6 pb-12">
        <main className="max-w-7xl mx-auto">
          <div className="mb-6 px-4">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-spendwise-oxford">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
              </div>
              
              {actions && (
                <div className="flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
