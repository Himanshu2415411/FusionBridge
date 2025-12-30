"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & Analytics",
  },
  {
    name: "UniBridge",
    href: "/unibridge",
    icon: GraduationCap,
    description: "Learning Platform",
  },
  {
    name: "Grow",
    href: "/grow",
    icon: TrendingUp,
    description: "Resume & Projects",
  },
  {
    name: "Earn",
    href: "/earn",
    icon: DollarSign,
    description: "FreelanceFusion",
  },
  {
    name: "Community",
    href: "/community",
    icon: Users,
    description: "Connect & Share",
  },
]

export default function LeftSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#386641] dark:bg-[#FF9433] text-[#FED16A] dark:text-[#121212] rounded-xl shadow-lg hover:bg-[#2d5233] dark:hover:bg-[#e6841d] transition-all duration-300 transform hover:scale-110"
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-all duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-full min-h-screen bg-[#386641] dark:bg-[#1E2E26] text-white dark:text-[#FFD86B]
          transition-all duration-300 ease-in-out border-r border-[#2d5233] dark:border-[#FFD86B]/20
          ${isCollapsed ? "w-16" : "w-56"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{ height: "100vh", minHeight: "100vh" }}
        aria-label="Main navigation sidebar"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#2d5233] dark:border-[#FFD86B]/20">
          <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : ""}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#F97A00] to-[#FED16A] dark:from-[#FF9433] dark:to-[#FFD86B] rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-lg">
              <span className="text-white dark:text-[#121212] font-bold text-sm">FB</span>
            </div>
          </div>

          {/* Desktop Collapse Toggle */}
          {!isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-[#2d5233] dark:hover:bg-[#FF9433]/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FED16A] dark:focus:ring-[#FFD86B] focus:ring-offset-2 focus:ring-offset-[#386641] dark:focus:ring-offset-[#1E2E26] transform hover:scale-110"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4 text-[#FED16A] dark:text-[#FFD86B]" />
            </button>
          )}

          {/* Expand button when collapsed */}
          {isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-[#386641] dark:bg-[#1E2E26] border-2 border-[#2d5233] dark:border-[#FFD86B]/30 rounded-full hover:bg-[#2d5233] dark:hover:bg-[#FF9433]/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FED16A] dark:focus:ring-[#FFD86B] shadow-lg hover:scale-110"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-3 w-3 text-[#FED16A] dark:text-[#FFD86B]" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1" role="navigation">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                  transition-all duration-300 ease-in-out relative transform hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-[#FED16A] dark:focus:ring-[#FFD86B] focus:ring-offset-2 focus:ring-offset-[#386641] dark:focus:ring-offset-[#1E2E26]
                  ${
                    isActive
                      ? "bg-[#F97A00] dark:bg-[#FF9433] text-white dark:text-[#121212] shadow-lg scale-105"
                      : "text-[#FED16A] dark:text-[#FFD86B] hover:bg-[#2d5233] dark:hover:bg-[#FF9433]/20 hover:text-white dark:hover:text-white hover:shadow-md"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? "" : "mr-3"}`} />

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="truncate font-semibold text-sm">{item.name}</span>
                    <p className="text-xs opacity-75 truncate mt-0.5">{item.description}</p>
                  </div>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-[#FED16A] dark:bg-[#FFD86B] rounded-r-full shadow-lg" />
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-[#F97A00]/10 dark:bg-[#FF9433]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Spacer for Desktop */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? "w-16" : "w-56"}`} />
    </>
  )
}
