
import PageTemplate from "./PageTemplate";
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <PageTemplate 
      title="Settings" 
      subtitle="Customize your SpendWise experience"
    >
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-spendwise-orange/10 p-4 rounded-full mb-4">
            <SettingsIcon size={48} className="text-spendwise-orange" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            This page allows you to customize your profile, notifications, and application preferences.
          </p>
        </div>
      </Card>
    </PageTemplate>
  );
}
