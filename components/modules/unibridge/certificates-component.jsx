import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Certificates Component - Display and manage user certificates
 */
export function CertificatesComponent() {
  const [certificates, setCertificates] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCert, setSelectedCert] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCertificates()
    fetchStats()
  }, [])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch certificates')

      const data = await response.json()
      setCertificates(data.data.certificates)
    } catch (error) {
      console.error('Fetch certificates error:', error)
      toast({
        title: 'Error',
        description: 'Failed to load certificates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/stats/overview`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      setStats(data.data)
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const handleDownloadCertificate = async (certificateId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${certificateId}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (!response.ok) throw new Error('Failed to download certificate')

      const data = await response.json()

      // Generate PDF (this would be done client-side or via a separate service)
      // For now, we'll just copy the verification URL to clipboard
      navigator.clipboard.writeText(data.data.verificationUrl)

      toast({
        title: 'Success',
        description: 'Verification link copied to clipboard',
      })
    } catch (error) {
      console.error('Download certificate error:', error)
      toast({
        title: 'Error',
        description: 'Failed to download certificate',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Loading certificates...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalCertificates || 0}</p>
            </div>
            {stats?.recentCertificates && stats.recentCertificates.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Recent Achievements</p>
                <div className="space-y-1">
                  {stats.recentCertificates.map((cert, index) => (
                    <p key={index} className="text-xs text-gray-700">
                      📜 {cert.courseTitle}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle>Earned Certificates</CardTitle>
          <CardDescription>View and download your certificates of completion</CardDescription>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-8">
              No certificates yet. Complete courses to earn certificates!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 border rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">📜</span>
                    <Badge className="bg-green-100 text-green-900 border-0">
                      Verified
                    </Badge>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1">
                    {cert.courseTitle}
                  </h3>

                  <p className="text-xs text-gray-600 mb-3">
                    Completed on {new Date(cert.completedAt).toLocaleDateString()}
                  </p>

                  <p className="text-xs text-gray-600 mb-3 font-mono break-all">
                    ID: {cert.certificateId}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedCert(cert)
                        setShowDetails(true)
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleDownloadCertificate(cert.certificateId)}
                      size="sm"
                      className="flex-1"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
          </DialogHeader>
          {selectedCert && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="font-medium">{selectedCert.courseTitle}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Certificate ID</p>
                <p className="font-mono text-sm break-all">
                  {selectedCert.certificateId}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Completed On</p>
                <p className="font-medium">
                  {new Date(selectedCert.completedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Verification URL</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedCert.verificationUrl}
                    readOnly
                    className="flex-1 px-2 py-1 text-xs border rounded bg-gray-50"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCert.verificationUrl)
                      toast({
                        title: 'Copied',
                        description: 'Verification URL copied to clipboard',
                      })
                    }}
                    size="sm"
                    variant="outline"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-600 text-center">
                  Share this certificate or verification link with employers and colleagues
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CertificatesComponent
