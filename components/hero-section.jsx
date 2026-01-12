import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Users, TrendingUp } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#FFF4A4] via-white to-[#FED16A]/20 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#1E2E26]/20 transition-all duration-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#386641]/10 dark:bg-[#FF9433]/10 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-[#F97A00]/15 dark:bg-[#FF9433]/15 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-[#FED16A]/20 dark:bg-[#FFD86B]/20 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-[#386641]/8 dark:bg-[#FF9433]/8 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
        
        {/* Floating Icons */}
        <div className="absolute top-32 right-32 animate-float" style={{animationDelay: '1s'}}>
          <div className="w-8 h-8 bg-[#F97A00]/20 dark:bg-[#FF9433]/20 rounded-lg flex items-center justify-center">
            <span className="text-[#F97A00] dark:text-[#FF9433] text-sm">🚀</span>
          </div>
        </div>
        <div className="absolute bottom-40 left-32 animate-float" style={{animationDelay: '2s'}}>
          <div className="w-8 h-8 bg-[#386641]/20 dark:bg-[#FF9433]/20 rounded-lg flex items-center justify-center">
            <span className="text-[#386641] dark:text-[#FF9433] text-sm">💡</span>
          </div>
        </div>
        <div className="absolute top-60 left-1/4 animate-float" style={{animationDelay: '0.5s'}}>
          <div className="w-6 h-6 bg-[#FED16A]/30 dark:bg-[#FFD86B]/30 rounded-full flex items-center justify-center">
            <span className="text-[#b8860b] dark:text-[#FFD86B] text-xs">⭐</span>
          </div>
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-10 right-1/4 w-32 h-32 bg-gradient-to-r from-[#386641]/5 to-[#F97A00]/5 dark:from-[#FF9433]/5 dark:to-[#FFD86B]/5 rounded-full blur-xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-gradient-to-r from-[#F97A00]/5 to-[#FED16A]/5 dark:from-[#FF9433]/5 dark:to-[#FFD86B]/5 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
      </div>

      <div className="w-full px-6 text-center relative z-10">
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-[#FFD86B] mb-6 leading-tight transition-colors duration-500">
          <span className="text-[#386641] dark:text-[#FF9433]">🧠 FusionBridge</span>
          <br />
          <span className="bg-gradient-to-r from-[#F97A00] to-[#FED16A] dark:from-[#FF9433] dark:to-[#FFD86B] bg-clip-text text-transparent">
            Learn • Grow • Earn
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-700 dark:text-[#FFD86B]/90 mb-4 max-w-4xl mx-auto font-medium transition-colors duration-500">
          "Bridging Knowledge, Growth, and Opportunity into One Platform"
        </p>
        
        <p className="text-lg text-gray-600 dark:text-[#FFD86B]/70 mb-12 max-w-3xl mx-auto transition-colors duration-500">
          Empower your journey with AI-powered tools that simplify learning paths, 
          optimize your career growth, and streamline your freelancing success.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button size="lg" className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300">
            Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-[#FFD86B]/80 transition-colors duration-500">
            <Sparkles className="h-5 w-5 text-[#F97A00] dark:text-[#FF9433]" />
            <span className="font-semibold">AI-Powered Tools</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-[#FFD86B]/80 transition-colors duration-500">
            <Users className="h-5 w-5 text-[#386641] dark:text-[#FF9433]" />
            <span className="font-semibold">10k+ Active Users</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-[#FFD86B]/80 transition-colors duration-500">
            <TrendingUp className="h-5 w-5 text-[#FED16A] dark:text-[#FFD86B]" />
            <span className="font-semibold">95% Success Rate</span>
          </div>
        </div>
      </div>
    </section>
  )
}
