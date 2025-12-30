import LeftSidebar from '../components/left-sidebar'
import Header from '../components/header'
import HeroSection from '../components/hero-section'
import ModulesSection from '../components/modules-section'
import FeaturesSection from '../components/features-section'
import CTASection from '../components/cta-section'

export default function HomePage() {
  return (
    <div className="min-h-screen flex">
      <LeftSidebar />
      
      <div className="flex-1">
        {/* <Header /> */}
        <HeroSection />
        <ModulesSection />
        <FeaturesSection />
        <CTASection />
      </div>
    </div>
  )
}
