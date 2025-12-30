"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import AuthModal from "@/components/auth/auth-modal"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Menu, X } from "lucide-react"

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Learn", href: "/learn" },
    { name: "Grow", href: "/grow" },
    { name: "Earn", href: "/earn" },
    { name: "Community", href: "/community" },
  ]

  // 🔑 GLOBAL AUTH MODAL TRIGGER
  useEffect(() => {
    const openAuthModal = () => setShowAuthModal(true)

    window.addEventListener("open-auth-modal", openAuthModal)

    return () => {
      window.removeEventListener("open-auth-modal", openAuthModal)
    }
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#386641]/20 dark:border-[#FFD86B]/20 bg-white/90 dark:bg-[#121212]/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#386641] to-[#6A994E] dark:from-[#FF9433] dark:to-[#FFD86B] shadow-md">
                <span className="text-white dark:text-[#121212] font-bold text-sm">
                  FB
                </span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B]">
                FusionBridge
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative text-sm font-medium text-gray-600 dark:text-[#FFD86B]/70 hover:text-[#386641] dark:hover:text-[#FF9433] transition"
                >
                  {item.name}
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#386641] dark:bg-[#FF9433] transition-all duration-300 hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-gray-700 dark:text-[#FFD86B]/70 hover:text-[#386641] dark:hover:text-[#FF9433]"
                    >
                      Dashboard
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full p-0 ring-1 ring-[#386641]/30 dark:ring-[#FFD86B]/30 hover:ring-[#386641]/60 dark:hover:ring-[#FF9433]/60 transition"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-[#386641] dark:bg-[#FF9433] text-white dark:text-[#121212]">
                            {user?.firstName?.[0]}
                            {user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-white dark:bg-[#1a1a1a] border border-[#386641]/20 dark:border-[#FFD86B]/20"
                    >
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-[#FFD86B]">
                            {user?.firstName} {user?.lastName}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-[#FFD86B]/70">
                            {user?.email}
                          </span>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={logout}
                        className="text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAuthModal(true)}
                    className="text-gray-700 dark:text-[#FFD86B]/70 hover:text-[#386641] dark:hover:text-[#FF9433]"
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] shadow-md"
                  >
                    Get started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-700 dark:text-[#FFD86B]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
