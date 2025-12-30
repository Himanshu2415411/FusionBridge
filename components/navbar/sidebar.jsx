'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, GraduationCap, TrendingUp, DollarSign, Users, ChevronLeft, ChevronRight, Brain } from 'lucide-react'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    name: 'UniBridge',
    href: '/unibridge',
    icon: GraduationCap,
    description: 'Learn & Study',
    badge: 'Learn'
  },
  {
    name: 'Grow',
    href: '/grow',
    icon: TrendingUp,
    description: 'Resume & Projects',
    badge: 'Career'
  },
  {
    name: 'Earn',
    href: '/earn',
    icon: DollarSign,
    description: 'FreelanceFusion',
    badge: 'Freelance'
  },
  {
    name: 'Community',
    href: '/community',
    icon: Users,
    description: 'Connect & Share'
  }
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 bg-black/50 z-40" />
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 z-50 h-screen bg-[#386641] text-white
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-56'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
        aria-label="Main navigation sidebar"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#2d5233]">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-[#F97A00] to-[#FED16A] rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-[#FED16A] truncate">FusionBridge</h1>
                <p className="text-xs text-[#FED16A]/80 truncate">Learn • Grow • Earn</p>
              </div>
            )}
          </div>
          
          {/* Collapse Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-[#2d5233] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FED16A] focus:ring-offset-2 focus:ring-offset-[#386641]"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
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
                  transition-all duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-[#FED16A] focus:ring-offset-2 focus:ring-offset-[#386641]
                  ${isActive 
                    ? 'bg-[#F97A00] text-white shadow-lg' 
                    : 'text-[#FED16A] hover:bg-[#2d5233] hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                
                {!isCollapsed && (
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

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-[#FED16A] rounded-r-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#2d5233]">
          {!isCollapsed && (
            <div className="text-center">
              <p className="text-xs text-[#FED16A]/60">
                © 2024 FusionBridge
              </p>
              <p className="text-xs text-[#FED16A]/60 mt-1">
                v1.0.0
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
