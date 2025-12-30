import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-[#386641] to-[#F97A00] dark:from-[#1E2E26] dark:to-[#FF9433]/20 transition-all duration-500">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <Sparkles className="h-16 w-16 text-[#FED16A] dark:text-[#FFD86B] mx-auto mb-6 transition-colors duration-500" />
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Bridge Your Future?
          </h2>
          
          <p className="text-xl text-white/90 dark:text-[#FFD86B]/90 mb-8 max-w-2xl mx-auto transition-colors duration-500">
            Join thousands of learners, professionals, and freelancers who are already 
            transforming their careers with FusionBridge's AI-powered platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-8">
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-white/10 dark:bg-[#FF9433]/10 border-white/20 dark:border-[#FFD86B]/30 text-white dark:text-[#FFD86B] placeholder:text-white/60 dark:placeholder:[#FFD86B]/60 backdrop-blur-sm transition-all duration-500"
            />
            <Button className="bg-[#FED16A] dark:bg-[#FFD86B] text-[#386641] dark:text-[#121212] hover:bg-[#FED16A]/90 dark:hover:bg-[#FFD86B]/90 font-bold whitespace-nowrap px-8 transform hover:scale-105 transition-all duration-300">
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-white/80 dark:text-[#FFD86B]/80 text-sm transition-colors duration-500">
            <span>✅ No credit card required</span>
            <span>✅ 14-day free trial</span>
            <span>✅ Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}
