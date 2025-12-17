import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <DashboardLayout activeItem="reports">
      <div className="p-6 flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <BarChart3 size={32} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Advanced financial reports and analytics will be available here soon.
        </p>
      </div>
    </DashboardLayout>
  );
}
