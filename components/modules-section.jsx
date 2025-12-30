import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, TrendingUp, DollarSign, Brain, FileText, Users, ArrowRight } from 'lucide-react'

export default function ModulesSection() {
  const modules = [
    {
      id: "learn",
      icon: GraduationCap,
      title: "🌱 Learn Module",
      subtitle: "UniBridge Core",
      description: "AI-powered learning paths tailored to your goals",
      features: [
        "AI Career Path Suggestion",
        "Skill Tree Visualization", 
        "GPT-based Learning Planner",
        "Event Finder",
        "AI Study Assistant"
      ],
      color: "#386641",
      darkColor: "#FF9433",
      bgGradient: "from-[#386641]/10 to-[#386641]/5 dark:from-[#FF9433]/10 dark:to-[#FF9433]/5"
    },
    {
      id: "grow", 
      icon: TrendingUp,
      title: "🌿 Grow Module",
      subtitle: "Career Acceleration",
      description: "Optimize your professional growth with smart tools",
      features: [
        "Resume Builder with ATS Score",
        "AI Project Generator",
        "GitHub README Writer", 
        "Flashcard & Study Tools",
        "Mock Interview Prep"
      ],
      color: "#F97A00",
      darkColor: "#FF9433",
      bgGradient: "from-[#F97A00]/10 to-[#F97A00]/5 dark:from-[#FF9433]/10 dark:to-[#FF9433]/5"
    },
    {
      id: "earn",
      icon: DollarSign, 
      title: "💼 Earn Module",
      subtitle: "FreelanceFusion Core",
      description: "Streamline your freelancing with intelligent automation",
      features: [
        "GPT-based Proposal Generator",
        "Time/Budget Estimator",
        "Freelance Contract Writer",
        "Client & Task Tracker", 
        "Freelance Dashboard"
      ],
      color: "#FED16A",
      darkColor: "#FFD86B",
      bgGradient: "from-[#FED16A]/20 to-[#FED16A]/10 dark:from-[#FFD86B]/20 dark:to-[#FFD86B]/10"
    }
  ]

  return (
    <section className="py-20 px-4 bg-white dark:bg-[#121212] transition-all duration-500">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-[#FFD86B] mb-4 transition-colors duration-500">
            🎯 Core Modules
          </h2>
          <p className="text-xl text-gray-600 dark:text-[#FFD86B]/80 max-w-3xl mx-auto transition-colors duration-500">
            Three powerful modules designed to transform your learning journey, 
            accelerate your growth, and maximize your earning potential.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <Card key={module.id} className={`card-gradient bg-gradient-to-br ${module.bgGradient} hover:shadow-xl dark:hover:shadow-[#FF9433]/20 transition-all duration-300 group transform hover:scale-105`}>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500"
                    style={{ backgroundColor: module.color }}
                  >
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                      {module.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 font-medium transition-colors duration-500">
                      {module.subtitle}
                    </p>
                  </div>
                </div>
                <CardDescription className="text-gray-700 dark:text-[#FFD86B]/80 text-base transition-colors duration-500">
                  {module.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {module.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-gray-700 dark:text-[#FFD86B]/80 transition-colors duration-500">
                      <div className="w-2 h-2 rounded-full transition-colors duration-500" style={{ backgroundColor: module.color }}></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full group-hover:scale-105 transition-all duration-300 text-white hover:shadow-lg"
                  style={{ backgroundColor: module.color }}
                >
                  Explore Module <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
