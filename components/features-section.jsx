import { Card, CardContent } from "@/components/ui/card"
import { Smartphone, Database, Brain, Shield, Zap, Puzzle } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: Smartphone,
      title: "Modern UI",
      description: "React + Vite + Tailwind CSS v4.1",
      color: "#386641",
      darkColor: "#FF9433"
    },
    {
      icon: Database, 
      title: "Robust Backend",
      description: "Node.js + Express + MongoDB",
      color: "#F97A00",
      darkColor: "#FF9433"
    },
    {
      icon: Brain,
      title: "AI Integrations", 
      description: "OpenAI GPT-4 + Cohere",
      color: "#FED16A",
      darkColor: "#FFD86B"
    },
    {
      icon: Shield,
      title: "JWT Authentication",
      description: "Role-Based Dashboards",
      color: "#386641",
      darkColor: "#FF9433"
    },
    {
      icon: Puzzle,
      title: "Modular System",
      description: "Plugin-based Features",
      color: "#F97A00",
      darkColor: "#FF9433"
    },
    {
      icon: Zap,
      title: "Real-time Stats",
      description: "Dashboard + User Analytics",
      color: "#FED16A",
      darkColor: "#FFD86B"
    }
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#FFF4A4]/30 to-white dark:from-[#121212] dark:to-[#1a1a1a] transition-all duration-500">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-[#FFD86B] mb-4 transition-colors duration-500">
            🧩 Key Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-[#FFD86B]/80 max-w-3xl mx-auto transition-colors duration-500">
            Built with cutting-edge technology and designed for scalability, 
            performance, and user experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300 group transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon 
                    className="h-8 w-8 transition-colors duration-500" 
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#FFD86B] mb-2 transition-colors duration-500">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
