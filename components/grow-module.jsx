'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Upload, Download, Zap, Plus, Calendar, Edit, Trash2, CheckCircle, Clock, PlayCircle, Target, TrendingUp, Award, Code, Lightbulb, Star, BarChart3 } from 'lucide-react'

export default function GrowModule() {
  const [resumeText, setResumeText] = useState('')
  const [selectedTechStack, setSelectedTechStack] = useState('')
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'E-commerce Dashboard',
      description: 'A comprehensive admin dashboard for managing online store operations with real-time analytics.',
      techStack: ['React', 'Node.js', 'MongoDB', 'Chart.js'],
      difficulty: 'Intermediate',
      status: 'In Progress',
      deadline: '2024-03-15',
      progress: 65,
      createdAt: '2024-01-10'
    },
    {
      id: 2,
      title: 'Task Management API',
      description: 'RESTful API for task management with user authentication and real-time notifications.',
      techStack: ['Express.js', 'PostgreSQL', 'JWT', 'Socket.io'],
      difficulty: 'Advanced',
      status: 'Not Started',
      deadline: '2024-04-01',
      progress: 0,
      createdAt: '2024-01-15'
    },
    {
      id: 3,
      title: 'Weather App',
      description: 'Mobile-responsive weather application with location-based forecasts and interactive maps.',
      techStack: ['React', 'Weather API', 'Tailwind CSS'],
      difficulty: 'Beginner',
      status: 'Done',
      deadline: '2024-02-01',
      progress: 100,
      createdAt: '2023-12-20'
    }
  ])

  // Dummy resume analysis data
  const resumeAnalysis = {
    score: 78,
    strengths: [
      'Strong technical skills section',
      'Relevant work experience',
      'Clear project descriptions'
    ],
    improvements: [
      'Add more quantifiable achievements',
      'Include relevant certifications',
      'Optimize for ATS keywords'
    ],
    atsScore: 85
  }

  // Tech stack options for project generation
  const techStackOptions = [
    'React + Node.js',
    'Vue.js + Express',
    'Angular + .NET',
    'Python + Django',
    'React Native',
    'Flutter + Firebase',
    'Next.js + Prisma',
    'MERN Stack',
    'MEAN Stack',
    'JAMstack'
  ]

  const handleGenerateProject = () => {
    // Placeholder for AI project generation
    const newProject = {
      id: projects.length + 1,
      title: 'AI-Generated Project',
      description: 'This project will be generated based on your selected tech stack and interests.',
      techStack: selectedTechStack.split(' + '),
      difficulty: 'Intermediate',
      status: 'Not Started',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    setProjects([newProject, ...projects])
    setSelectedTechStack('')
  }

  const updateProjectStatus = (projectId, newStatus) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { ...project, status: newStatus, progress: newStatus === 'Done' ? 100 : project.progress }
        : project
    ))
  }

  const deleteProject = (projectId) => {
    setProjects(projects.filter(project => project.id !== projectId))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':
        return 'bg-[#386641]/10 dark:bg-[#FF9433]/10 text-[#386641] dark:text-[#FF9433]'
      case 'In Progress':
        return 'bg-[#F97A00]/10 dark:bg-[#FF9433]/10 text-[#F97A00] dark:text-[#FF9433]'
      default:
        return 'bg-gray-100 dark:bg-[#1E2E26] text-gray-600 dark:text-[#FFD86B]/60'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-[#386641]/10 dark:bg-[#FF9433]/10 text-[#386641] dark:text-[#FF9433]'
      case 'Intermediate':
        return 'bg-[#F97A00]/10 dark:bg-[#FF9433]/10 text-[#F97A00] dark:text-[#FF9433]'
      case 'Advanced':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-[#1E2E26] text-gray-600 dark:text-[#FFD86B]/60'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF4A4]/20 via-white to-[#FED16A]/5 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#1E2E26]/20 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-[#FFD86B] mb-4 transition-colors duration-500">
            🚀 Grow Your Skills
          </h1>
          <p className="text-xl text-gray-600 dark:text-[#FFD86B]/80 max-w-3xl mx-auto transition-colors duration-500">
            Build your resume and create impactful projects to accelerate your career growth
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#386641]/10 dark:bg-[#FF9433]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-[#386641] dark:text-[#FF9433]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] mb-1 transition-colors duration-500">
                {resumeAnalysis.score}%
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                Resume Score
              </p>
            </CardContent>
          </Card>

          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#F97A00]/10 dark:bg-[#FF9433]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Code className="h-6 w-6 text-[#F97A00] dark:text-[#FF9433]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] mb-1 transition-colors duration-500">
                {projects.length}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                Total Projects
              </p>
            </CardContent>
          </Card>

          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#FED16A]/20 dark:bg-[#FFD86B]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-[#b8860b] dark:text-[#FFD86B]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] mb-1 transition-colors duration-500">
                {projects.filter(p => p.status === 'Done').length}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                Completed
              </p>
            </CardContent>
          </Card>

          <Card className="card-gradient hover:shadow-lg dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#386641]/10 dark:bg-[#FF9433]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-[#386641] dark:text-[#FF9433]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] mb-1 transition-colors duration-500">
                {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                Avg Progress
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          
          {/* Resume Builder & Analyzer */}
          <Card className="card-gradient hover:shadow-xl dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                <FileText className="h-6 w-6 mr-3 text-[#386641] dark:text-[#FF9433]" />
                Resume Builder & Analyzer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Resume Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-[#FFD86B]/80 transition-colors duration-500">
                    Upload Resume or Paste Content
                  </label>
                  <Button variant="outline" className="border-[#386641] dark:border-[#FF9433] text-[#386641] dark:text-[#FF9433] hover:bg-[#386641] dark:hover:bg-[#FF9433] hover:text-white dark:hover:text-[#121212] transition-all duration-300">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PDF
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Paste your resume content here or upload a PDF file above..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-32 border-[#386641]/20 dark:border-[#FFD86B]/20 focus:border-[#386641] dark:focus:border-[#FF9433] transition-colors duration-500"
                />
                
                <Button className="w-full bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] transition-all duration-300">
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze with AI
                </Button>
              </div>

              {/* Analysis Results */}
              <div className="bg-gray-50 dark:bg-[#1E2E26]/30 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                    Resume Analysis
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-[#F97A00] dark:text-[#FF9433]" />
                    <span className="text-2xl font-bold text-[#F97A00] dark:text-[#FF9433]">
                      {resumeAnalysis.score}%
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                        Overall Score
                      </span>
                      <span className="font-medium text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                        {resumeAnalysis.score}%
                      </span>
                    </div>
                    <Progress value={resumeAnalysis.score} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                        ATS Compatibility
                      </span>
                      <span className="font-medium text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                        {resumeAnalysis.atsScore}%
                      </span>
                    </div>
                    <Progress value={resumeAnalysis.atsScore} className="h-2" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-[#FFD86B] mb-2 transition-colors duration-500">
                      ✅ Strengths
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                      {resumeAnalysis.strengths.map((strength, index) => (
                        <li key={index}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-[#FFD86B] mb-2 transition-colors duration-500">
                      🔧 Improvements
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                      {resumeAnalysis.improvements.map((improvement, index) => (
                        <li key={index}>• {improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button className="w-full bg-[#F97A00] dark:bg-[#FF9433] hover:bg-[#e06900] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] transition-all duration-300">
                  <Download className="h-4 w-4 mr-2" />
                  Download Optimized PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Project Generator */}
          <Card className="card-gradient hover:shadow-xl dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                <Lightbulb className="h-6 w-6 mr-3 text-[#F97A00] dark:text-[#FF9433]" />
                AI Project Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Project Generation Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-[#FFD86B]/80 mb-2 block transition-colors duration-500">
                    Select Tech Stack
                  </label>
                  <Select value={selectedTechStack} onValueChange={setSelectedTechStack}>
                    <SelectTrigger className="border-[#F97A00]/20 dark:border-[#FFD86B]/20 focus:border-[#F97A00] dark:focus:border-[#FF9433] transition-colors duration-500">
                      <SelectValue placeholder="Choose your preferred tech stack" />
                    </SelectTrigger>
                    <SelectContent>
                      {techStackOptions.map((tech) => (
                        <SelectItem key={tech} value={tech}>
                          {tech}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateProject}
                  disabled={!selectedTechStack}
                  className="w-full bg-[#F97A00] dark:bg-[#FF9433] hover:bg-[#e06900] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Project
                </Button>
              </div>

              {/* Generated Project Preview */}
              <div className="bg-gray-50 dark:bg-[#1E2E26]/30 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                  Latest Generated Project
                </h3>
                
                {projects.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                          {projects[0].title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 mt-1 transition-colors duration-500">
                          {projects[0].description}
                        </p>
                      </div>
                      <Badge className={`${getDifficultyColor(projects[0].difficulty)} border-0 ml-3`}>
                        {projects[0].difficulty}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {projects[0].techStack.map((tech, index) => (
                        <Badge key={index} variant="outline" className="border-[#F97A00]/30 dark:border-[#FF9433]/30 text-[#F97A00] dark:text-[#FF9433] text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full border-[#F97A00] dark:border-[#FF9433] text-[#F97A00] dark:text-[#FF9433] hover:bg-[#F97A00] dark:hover:bg-[#FF9433] hover:text-white dark:hover:text-[#121212] transition-all duration-300">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Tracker
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-r from-[#FED16A]/10 to-[#F97A00]/10 dark:from-[#FFD86B]/10 dark:to-[#FF9433]/10 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-[#FFD86B] mb-2 flex items-center transition-colors duration-500">
                  <Star className="h-4 w-4 mr-2 text-[#F97A00] dark:text-[#FF9433]" />
                  Pro Tips
                </h4>
                <ul className="text-sm text-gray-600 dark:text-[#FFD86B]/70 space-y-1 transition-colors duration-500">
                  <li>• Choose tech stacks you want to learn or improve</li>
                  <li>• Generated projects include detailed requirements</li>
                  <li>• Each project comes with learning resources</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Tracker */}
        <Card className="card-gradient hover:shadow-xl dark:hover:shadow-[#FF9433]/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-[#FFD86B] flex items-center transition-colors duration-500">
                <Target className="h-6 w-6 mr-3 text-[#386641] dark:text-[#FF9433]" />
                Project Tracker
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="border-[#386641] dark:border-[#FF9433] text-[#386641] dark:text-[#FF9433] hover:bg-[#386641] dark:hover:bg-[#FF9433] hover:text-white dark:hover:text-[#121212] transition-all duration-300">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button className="bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="border border-gray-200 dark:border-[#FFD86B]/20 hover:shadow-md transition-all duration-300 group">
                  <CardContent className="p-6 space-y-4">
                    
                    {/* Project Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-[#FFD86B] mb-1 transition-colors duration-500 group-hover:text-[#386641] dark:group-hover:text-[#FF9433]">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <Badge className={`${getStatusColor(project.status)} border-0 text-xs`}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.map((tech, index) => (
                        <Badge key={index} variant="outline" className="border-[#386641]/30 dark:border-[#FF9433]/30 text-[#386641] dark:text-[#FF9433] text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Progress */}
                    {project.status !== 'Not Started' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                            Progress
                          </span>
                          <span className="font-medium text-gray-900 dark:text-[#FFD86B] transition-colors duration-500">
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-1.5" />
                      </div>
                    )}

                    {/* Project Details */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-[#FFD86B]/60 transition-colors duration-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{project.deadline}</span>
                      </div>
                      <Badge className={`${getDifficultyColor(project.difficulty)} border-0 text-xs`}>
                        {project.difficulty}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#386641] dark:text-[#FF9433] hover:bg-[#386641]/10 dark:hover:bg-[#FF9433]/10 transition-all duration-300"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProject(project.id)}
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {project.status === 'Not Started' && (
                          <Button
                            size="sm"
                            onClick={() => updateProjectStatus(project.id, 'In Progress')}
                            className="bg-[#F97A00] dark:bg-[#FF9433] hover:bg-[#e06900] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] text-xs transition-all duration-300"
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        
                        {project.status === 'In Progress' && (
                          <Button
                            size="sm"
                            onClick={() => updateProjectStatus(project.id, 'Done')}
                            className="bg-[#386641] dark:bg-[#FF9433] hover:bg-[#2d5233] dark:hover:bg-[#e6841d] text-white dark:text-[#121212] text-xs transition-all duration-300"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}

                        {project.status === 'Done' && (
                          <Badge className="bg-[#386641]/10 dark:bg-[#FF9433]/10 text-[#386641] dark:text-[#FF9433] border-0 text-xs">
                            ✅ Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 dark:text-[#FFD86B]/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-[#FFD86B] mb-2 transition-colors duration-500">
                  No projects yet
                </h3>
                <p className="text-gray-600 dark:text-[#FFD86B]/70 transition-colors duration-500">
                  Generate your first project using the AI Project Generator above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
