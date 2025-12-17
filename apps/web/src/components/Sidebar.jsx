import { useState } from "react";
import {
  Home,
  Building2,
  Handshake,
  FileText,
  CreditCard,
  Users,
  DollarSign,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar({ activeItem = "dashboard", onItemClick }) {
  const handleItemClick = (itemId) => {
    if (onItemClick) {
      onItemClick(itemId);
    } else {
      window.location.href = `/${itemId === "dashboard" ? "dashboard" : itemId}`;
    }
  };

  const MenuItem = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`
        relative w-full flex items-center h-10 px-6 rounded-lg transition-all duration-150 ease-in-out
        hover:bg-gray-100 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
        ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"}
      `}
      aria-current={isActive ? "page" : undefined}
    >
      {isActive && (
        <div className="absolute left-0 top-0 w-1 h-full bg-blue-600 dark:bg-blue-400 rounded-r-full" />
      )}
      <Icon size={24} strokeWidth={1.5} className="flex-shrink-0" />
      <span className="ml-5 text-[15px] font-normal">{label}</span>
    </button>
  );

  const SectionLabel = ({ children }) => (
    <h3 className="text-[13px] font-light tracking-wide text-gray-500 dark:text-gray-400 mb-5 uppercase">
      {children}
    </h3>
  );

  return (
    <div className="w-64 bg-white dark:bg-gray-800 h-screen flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Brand Block */}
      <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <img
            src="/logo.svg"
            alt="ArabDg Finance"
            className="w-10 h-10 rounded-lg shadow-sm flex-shrink-0"
          />
          <span className="ml-3 text-2xl font-semibold text-gray-900 dark:text-white">
            ArabDg Finance
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-6 py-8 space-y-8 overflow-y-auto">
        {/* Main Section */}
        <div>
          <SectionLabel>Main</SectionLabel>
          <div className="space-y-4">
            <MenuItem
              id="dashboard"
              icon={Home}
              label="Dashboard"
              isActive={activeItem === "dashboard"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="clients"
              icon={Building2}
              label="Clients"
              isActive={activeItem === "clients"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="deals"
              icon={Handshake}
              label="Deals"
              isActive={activeItem === "deals"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="invoices"
              icon={FileText}
              label="Invoices"
              isActive={activeItem === "invoices"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="payments"
              icon={CreditCard}
              label="Payments"
              isActive={activeItem === "payments"}
              onClick={handleItemClick}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="my-7">
          <hr className="border-gray-200 dark:border-gray-700" />
        </div>

        {/* Operations Section */}
        <div>
          <SectionLabel>Operations</SectionLabel>
          <div className="space-y-4">
            <MenuItem
              id="payroll"
              icon={Users}
              label="Payroll / الرواتب"
              isActive={activeItem === "payroll"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="subscriptions"
              icon={DollarSign}
              label="Subscriptions"
              isActive={activeItem === "subscriptions"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="petty-cash"
              icon={Wallet}
              label="Petty Cash / عهدة"
              isActive={activeItem === "petty-cash"}
              onClick={handleItemClick}
            />
            <MenuItem
              id="reports"
              icon={BarChart3}
              label="Reports"
              isActive={activeItem === "reports"}
              onClick={handleItemClick}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="my-7">
          <hr className="border-gray-200 dark:border-gray-700" />
        </div>

        {/* System Section */}
        <div>
          <SectionLabel>System</SectionLabel>
          <div className="space-y-4">
            <MenuItem
              id="settings"
              icon={Settings}
              label="Settings"
              isActive={activeItem === "settings"}
              onClick={handleItemClick}
            />
          </div>
        </div>
      </nav>

      {/* Log Out Row */}
      <div className="px-6 pb-8">
        <MenuItem
          id="account/logout"
          icon={LogOut}
          label="Log out"
          isActive={false}
          onClick={handleItemClick}
        />
      </div>
    </div>
  );
}
