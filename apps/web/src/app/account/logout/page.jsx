import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Sign Out
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Are you sure you want to sign out?
          </p>

          <button
            onClick={handleSignOut}
            className="w-full rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
