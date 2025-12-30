"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "../../contexts/AuthContext"
import { LoadingSpinner } from "../ui/loading"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, LogIn, UserPlus } from "lucide-react"

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, loading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [formErrors, setFormErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = (isLogin = true) => {
    const errors = {}

    if (!formData.email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (!isLogin) {
      if (!formData.firstName) {
        errors.firstName = "First name is required"
      }
      if (!formData.lastName) {
        errors.lastName = "Last name is required"
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateForm(true)) return

    const result = await login({
      email: formData.email,
      password: formData.password,
    })

    if (result.success) {
      onClose()
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validateForm(false)) return

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    })

    if (result.success) {
      onClose()
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
    }
  }

  const handleClose = () => {
    onClose()
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
    setFormErrors({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-6 bg-gradient-to-br from-white to-[#FFF4A4] dark:from-[#121212] dark:to-[#1E2E26] border-2 border-[#386641] dark:border-[#FF9433]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center text-[#386641] dark:text-[#FF9433] drop-shadow-lg">
            Welcome to FusionBridge
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#386641]/10 dark:bg-[#FF9433]/10 border border-[#386641]/30 dark:border-[#FF9433]/30">
            <TabsTrigger value="login" className="flex items-center space-x-2 text-[#386641] dark:text-[#FF9433] font-semibold hover:bg-[#386641]/20 dark:hover:bg-[#FF9433]/20 data-[state=active]:bg-[#386641] dark:data-[state=active]:bg-[#FF9433] data-[state=active]:text-white">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center space-x-2 text-[#386641] dark:text-[#FF9433] font-semibold hover:bg-[#386641]/20 dark:hover:bg-[#FF9433]/20 data-[state=active]:bg-[#386641] dark:data-[state=active]:bg-[#FF9433] data-[state=active]:text-white">
              <UserPlus className="h-4 w-4" />
              <span>Sign Up</span>
            </TabsTrigger>
          </TabsList>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <TabsContent value="login" className="space-y-4 bg-gradient-to-br from-[#386641]/10 to-[#FF9433]/10 p-6 rounded-lg border border-[#386641]/20 dark:border-[#FF9433]/20">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#386641] dark:text-[#FF9433] font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#386641] dark:text-[#FF9433]" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 text-gray-900 dark:text-yellow-400 font-semibold bg-white dark:bg-[#121212] border-2 border-[#386641]/30 dark:border-[#FF9433]/30 focus:border-[#386641] dark:focus:border-[#FF9433] placeholder:text-[#386641]/70 dark:placeholder:text-[#FF9433]/70 ${formErrors.email ? "border-red-500" : ""}`}
                    disabled={loading}
                  />
                </div>
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#386641] dark:text-[#FF9433] font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#386641] dark:text-[#FF9433]" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 text-gray-900 dark:text-yellow-400 font-semibold bg-white dark:bg-[#121212] border-2 border-[#386641]/30 dark:border-[#FF9433]/30 focus:border-[#386641] dark:focus:border-[#FF9433] placeholder:text-[#386641]/70 dark:placeholder:text-[#FF9433]/70 ${formErrors.password ? "border-red-500" : ""}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#386641] dark:text-[#FF9433] hover:text-[#2d5233] dark:hover:text-[#e6841d]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Signing In...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70">
                Don't have an account?{" "}
                <button
                  onClick={() => setActiveTab("register")}
                  className="text-[#386641] dark:text-[#FF9433] hover:underline font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`pl-10 ${formErrors.firstName ? "border-red-500" : ""}`}
                      disabled={loading}
                    />
                  </div>
                  {formErrors.firstName && <p className="text-sm text-red-500">{formErrors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`pl-10 ${formErrors.lastName ? "border-red-500" : ""}`}
                      disabled={loading}
                    />
                  </div>
                  {formErrors.lastName && <p className="text-sm text-red-500">{formErrors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${formErrors.email ? "border-red-500" : ""}`}
                    disabled={loading}
                  />
                </div>
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 text-gray-900 dark:text-yellow-400 font-semibold ${formErrors.password ? "border-red-500" : ""}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 text-gray-900 dark:text-yellow-400 font-semibold ${formErrors.confirmPassword ? "border-red-500" : ""}`}
                    disabled={loading}
                  />
                </div>
                {formErrors.confirmPassword && <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating Account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70">
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="text-[#386641] dark:text-[#FF9433] hover:underline font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-gray-500 dark:text-[#FFD86B]/50">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
