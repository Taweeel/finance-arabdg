import { useState } from "react";
import useUser from "@/utils/useUser";

/**
 * IMPORTANT: This page is for creating the FIRST admin user only.
 * After creating your first admin in both development and production,
 * you should DELETE this file and the /api/user/make-admin endpoint.
 */

export default function SetupAdminPage() {
  const { data: user, loading } = useUser();
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleMakeAdmin = async () => {
    setCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/user/make-admin", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to create admin");
      }

      const data = await res.json();
      setSuccess(true);
    } catch (err) {
      setError("Failed to assign admin role. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please sign in first
          </p>
          <a
            href="/account/signin"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create the first administrator account
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Important Security Notice
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
            This page should ONLY be used to create the first admin user. After
            creating your admin account:
          </p>
          <ol className="list-decimal list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1 ml-2">
            <li>
              Delete the file at{" "}
              <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">
                /apps/web/src/app/setup-admin/page.jsx
              </code>
            </li>
            <li>
              Delete the file at{" "}
              <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">
                /apps/web/src/app/api/user/make-admin/route.js
              </code>
            </li>
            <li>Do this in BOTH development and production environments</li>
          </ol>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Logged in as:
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {user.email}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {user.name}
          </div>
        </div>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              ✓ Success!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Admin role has been assigned. You can now access the admin
              dashboard.
            </p>
            <div className="flex gap-3">
              <a
                href="/dashboard"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </a>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-4 font-semibold">
              ⚠️ Remember to delete this page and the /api/user/make-admin
              endpoint!
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleMakeAdmin}
              disabled={creating}
              className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium disabled:opacity-50 transition-colors"
            >
              {creating
                ? "Creating Admin Account..."
                : "Make Me an Administrator"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
