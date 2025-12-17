import DashboardLayout from "@/components/DashboardLayout";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout activeItem="settings">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">System configuration</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
           <div className="flex items-center gap-3 mb-4 text-amber-600">
             <Settings size={24} />
             <span className="font-medium">System Settings</span>
           </div>
           <p className="text-gray-600 dark:text-gray-300">
             Global application settings and user management preferences will be displayed here.
           </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
