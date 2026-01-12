import HeroSection from '@/components/hero-section'
import ModulesSection from '@/components/modules-section'
import FeaturesSection from '@/components/features-section'
import CTASection from '@/components/cta-section'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ModulesSection />
      <FeaturesSection />
      <CTASection />
    </div>
  )
}
