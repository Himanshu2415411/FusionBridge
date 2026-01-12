'use client'

import { useState } from 'react'
import Sidebar from './sidebar'

export default function NavbarLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex w-full h-full bg-[#FFF4A4]">
      {/* Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(prev => !prev)}
      />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto transition-all duration-300">

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
