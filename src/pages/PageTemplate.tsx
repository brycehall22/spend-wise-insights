
import AppSidebar from "@/components/AppSidebar";

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageTemplate({ title, subtitle, children }: PageTemplateProps) {
  return (
    <div className="min-h-screen bg-spendwise-platinum">
      <AppSidebar />
      
      <div className="pt-6 lg:pl-72 pr-6 pb-12">
        <main className="max-w-7xl mx-auto">
          <div className="mb-6 px-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-spendwise-oxford">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
