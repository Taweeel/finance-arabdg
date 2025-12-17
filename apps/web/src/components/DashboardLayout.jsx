import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu, X, Bell, Search } from "lucide-react";
import useUser from "@/utils/useUser";

export default function DashboardLayout({
  children,
  activeItem = "dashboard",
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user } = useUser();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen">
        <Sidebar activeItem={activeItem} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black opacity-50 dark:opacity-70"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 h-screen bg-white dark:bg-gray-800 shadow-xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            <Sidebar activeItem={activeItem} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Finance System
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">
                <Search
                  size={18}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>
              <button className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600">
                <Bell size={18} className="text-gray-600 dark:text-gray-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                {user?.name?.[0] || "U"}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
