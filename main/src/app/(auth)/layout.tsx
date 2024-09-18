import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800">
      {children}
    </div>
  );
}
