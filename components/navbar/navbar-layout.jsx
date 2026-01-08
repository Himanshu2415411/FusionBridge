'use client'

import Sidebar from './sidebar'

export default function NavbarLayout({ children }) {
  return (
    <div className="h-full flex bg-[#FFF4A4]">
      {/* Sidebar (fixed in layout, not scrolling) */}
      <Sidebar />

      {/* Main content — ONLY scroll container */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
