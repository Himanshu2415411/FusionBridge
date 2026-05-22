import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

/**
 * Resources Component - Display lesson resources
 */
export function ResourcesComponent({ courseId, lessonId, lesson }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (courseId && lessonId) {
      fetchResources()
    }
  }, [courseId, lessonId])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lessons/${courseId}/${lessonId}/resources`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch resources')

      const data = await response.json()
      setResources(data.data || [])
    } catch (error) {
      console.error('Fetch resources error:', error)
      // Don't show error toast for missing resources
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (url, title) => {
    try {
      // For external links, just open them
      if (url.startsWith('http')) {
        window.open(url, '_blank')
        return
      }

      // For relative paths, initiate download
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to download')

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

      toast({
        title: 'Success',
        description: `Downloaded ${title}`,
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Info',
        description: `Opening ${title} in new tab`,
      })
      window.open(url, '_blank')
    }
  }

  const getResourceIcon = (type) => {
    const icons = {
      pdf: '📄',
      link: '🔗',
      code: '💻',
    }
    return icons[type] || '📎'
  }

  const getResourceColor = (type) => {
    const colors = {
      pdf: 'bg-red-50 text-red-900 border-red-200',
      link: 'bg-blue-50 text-blue-900 border-blue-200',
      code: 'bg-purple-50 text-purple-900 border-purple-200',
    }
    return colors[type] || 'bg-gray-50 text-gray-900 border-gray-200'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>Loading resources...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>No resources available for this lesson</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            This lesson doesn't have any attached resources yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resources</CardTitle>
        <CardDescription>Additional materials for this lesson</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {resources.map((resource, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border ${getResourceColor(resource.type)}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{resource.icon || getResourceIcon(resource.type)}</span>
                <div className="min-w-0">
                  <p className="font-medium text-sm break-words">{resource.title}</p>
                  <p className="text-xs opacity-75">{resource.type.toUpperCase()}</p>
                </div>
              </div>

              <Button
                onClick={() => handleDownload(resource.url, resource.title)}
                size="sm"
                variant="ghost"
                className="ml-2 flex-shrink-0"
              >
                📥
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            💡 <span className="font-medium">Tip:</span> Download these resources to deepen your understanding
            of the lesson material.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ResourcesComponent
