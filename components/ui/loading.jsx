import { Loader2 } from "lucide-react"

export function LoadingSpinner({ size = "default", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  return <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
}

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF4A4]/20 via-white to-[#FED16A]/5 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#1E2E26]/20 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" className="text-[#386641] dark:text-[#FF9433] mx-auto" />
        <p className="text-lg text-gray-600 dark:text-[#FFD86B]/70">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingButton({ loading, children, ...props }) {
  return (
    <button disabled={loading} {...props}>
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" className="mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
}
