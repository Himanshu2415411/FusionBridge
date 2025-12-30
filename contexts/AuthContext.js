"use client"

import { createContext, useContext, useEffect, useState } from "react"
import apiService from "@/lib/api"

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load → verify token
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await apiService.getCurrentUser()
      if (res?.success && res.user) {
        setUser(res.user)
      } else {
        logout()
      }
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    const res = await apiService.login(credentials)
    if (res?.success && res.token) {
      localStorage.setItem("token", res.token)
      setUser(res.user)
      return { success: true }
    }
    return { success: false, error: res?.message || "Login failed" }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
