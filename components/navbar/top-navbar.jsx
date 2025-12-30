'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User, Settings, LogOut, ChevronDown, Bell, Search, Menu, X } from 'lucide-react'

const navigationLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Contact', href: '/contact' }
]

export default function TopNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const profileRef = useRef(null)

  // Dummy user data
  const user = {
    name: 'Himanshu',
    email: 'himanshu0937@gmail.com',
    avatar: '/diverse-user-avatars.png',
    role: 'Premium User'
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-[#F97A00] shadow-lg relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-[#FED16A] focus:ring-offset-2 focus:ring-offset-[#F97A00] rounded-lg p-1"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#386641] to-[#FED16A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FB</span>
              </div>
              <span className="text-[#FED16A] font-bold text-xl group-hover:text-white transition-colors">
                FusionBridge
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[#FED16A] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FED16A] focus:ring-offset-2 focus:ring-offset-[#F97A00]"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section - Search, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            
            {/* Search Bar - Desktop Only */}
            <div className="hidden lg:block relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#FED16A]/60" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-[#386641]/20 text-[#FED16A] placeholder-[#FED16A]/60 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FED16A] focus:bg-[#386641]/30 transition-colors w-64"
                />
              </div>
            </div>

            {/* Notifications */}
            <button 
              className="relative p-2 text-[#FED16A] hover:text-white hover:bg-[#386641]/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FED16A] focus:ring-offset-2 focus:ring-offset-[#F97A00]"
              aria-label="View notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#386641] text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className="flex items-center space-x-3 p-2 text-[#FED16A] hover:text-white hover:bg-[#386641]/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FED16A] focus:ring-offset-2 focus:ring-offset-[#F97A00]"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={`${user.name} avatar`}
                  className="h-8 w-8 rounded-full border-2 border-[#FED16A]/30"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs opacity-75">{user.role}</p>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FED16A]/10 hover:text-[#386641] transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    View Profile
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FED16A]/10 hover:text-[#386641] transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Change Password
                  </Link>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        setIsProfileOpen(false)
                        // Handle logout logic here
                        console.log('Logout clicked')
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-[#FED16A] hover:text-white hover:bg-[#386641]/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FED16A] focus:ring-offset-2 focus:ring-offset-[#F97A00]"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#386641]/20 py-4">
            <div className="space-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 text-[#FED16A] hover:text-white hover:bg-[#386641]/20 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* Mobile Search */}
            <div className="mt-4 px-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#FED16A]/60" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-[#386641]/20 text-[#FED16A] placeholder-[#FED16A]/60 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FED16A] focus:bg-[#386641]/30 transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
