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
      if (res?.user) {
      setUser(res.user)
      }else {
        logout()
      }
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
  try {
    const userData = await apiService.login(credentials)

    setUser(userData.user)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}




const register = async (userData) => {
  try {
    const res = await apiService.register(userData)

    setUser(res.user)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
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
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
