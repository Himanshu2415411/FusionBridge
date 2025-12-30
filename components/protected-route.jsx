"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      {loading && (
        <div className="text-gray-600 dark:text-[#FFD86B]/70">
          Checking access…
        </div>
      )}

      {!loading && !isAuthenticated && (
        <div className="flex flex-col items-center text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#FFD86B]">
            Sign in required
          </h2>
          <p className="text-gray-600 dark:text-[#FFD86B]/70 max-w-md">
            You need to be signed in to access your dashboard.
          </p>
          <Button
            className="
              bg-[#386641]
              text-white
              hover:bg-[#2d5233]
              hover:text-white
              dark:bg-[#FF9433]
              dark:text-[#121212]
              dark:hover:bg-[#e6841d]
              dark:hover:text-[#121212]
            "
            onClick={() => {
              window.dispatchEvent(new Event("open-auth-modal"))
            }}
          >
            Sign in to continue
          </Button>
        </div>
      )}

      {!loading && isAuthenticated && (
        <div className="w-full">
          {children}
        </div>
      )}
    </div>
  )
}
