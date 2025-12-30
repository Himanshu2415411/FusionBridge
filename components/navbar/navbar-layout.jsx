'use client'

import { useState, useEffect } from 'react'
import Sidebar from './sidebar'

export default function NavbarLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <div className="min-h-screen bg-[#FFF4A4]">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 transition-all duration-300">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
