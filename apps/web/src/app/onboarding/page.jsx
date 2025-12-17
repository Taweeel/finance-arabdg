import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: user, loading: userLoading } = useUser();
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            // User already has a profile, redirect to dashboard
            window.location.href = "/dashboard";
          }
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };

    if (user && !userLoading) {
      checkProfile();
    }
  }, [user, userLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        throw new Error("Failed to create profile");
      }

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Failed to complete onboarding. Please try again.");
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select your role to complete setup
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Your Role
            </label>

            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={role === "employee"}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Employee
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    View payroll and manage expenses
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="finance_manager"
                  checked={role === "finance_manager"}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Finance Manager
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Manage all financial operations
                  </div>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Complete Setup"}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            Note: Admin role must be assigned by an existing administrator
          </p>
        </div>
      </form>
    </div>
  );
}
