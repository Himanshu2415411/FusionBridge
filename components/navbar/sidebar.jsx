'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight,
  Brain,
} from 'lucide-react'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics',
  },
  {
    name: 'UniBridge',
    href: '/unibridge',
    icon: GraduationCap,
    description: 'Learn & Study',
    badge: 'Learn',
  },
  {
    name: 'Grow',
    href: '/grow',
    icon: TrendingUp,
    description: 'Resume & Projects',
    badge: 'Career',
  },
  {
    name: 'Earn',
    href: '/earn',
    icon: DollarSign,
    description: 'FreelanceFusion',
    badge: 'Freelance',
  },
  {
    name: 'Community',
    href: '/community',
    icon: Users,
    description: 'Connect & Share',
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname()
console.log("🔥 Sidebar rendered")
  return (
    <aside
      className={`
        sticky top-0 z-40 h-screen bg-[#386641] text-white
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-56'}
      `}
      aria-label="Main navigation sidebar"
    >

      

      {/* Sidebar Header */}
      {/* Sidebar Header */}
<div className="relative p-3 border-b border-[#2d5233]">
  <div className="flex items-center space-x-3">
    <div className="w-8 h-8 bg-gradient-to-br from-[#F97A00] to-[#FED16A] rounded-lg flex items-center justify-center flex-shrink-0">
      <Brain className="h-5 w-5 text-white" />
    </div>

    {!collapsed && (
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-[#FED16A] truncate">
          FusionBridge
        </h1>
        <p className="text-xs text-[#FED16A]/80 truncate">
          Learn • Grow • Earn
        </p>
      </div>
    )}
  </div>

  {/* Collapse Toggle — ALWAYS VISIBLE */}
  <button
    onClick={onToggle}
    className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-[#2d5233] transition-colors"
    aria-label="Toggle sidebar"
  >
    {collapsed ? (
      <ChevronRight className="h-4 w-4 text-white" />
    ) : (
      <ChevronLeft className="h-4 w-4 text-white" />
    )}
  </button>
</div>


      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-[#F97A00] text-white shadow-lg'
                    : 'text-[#FED16A] hover:bg-[#2d5233] hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-[#FED16A]/20 text-[#FED16A] rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-75 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              )}

              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-[#FED16A] rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#2d5233]">
        {!collapsed && (
          <div className="text-center text-xs text-[#FED16A]/60">
            © 2024 FusionBridge
            <br />
            v1.0.0
          </div>
        )}
      </div>
    </aside>
  )
}
