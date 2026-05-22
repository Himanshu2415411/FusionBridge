"use client"

import { useEffect, useState } from "react"

/**
 * Hook for managing CSRF tokens
 * Fetches token on component mount and provides it for API calls
 */
export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const res = await fetch(`${apiUrl}/auth/csrf-token`, {
          credentials: "include",
        })

        const data = await res.json()

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch CSRF token")
        }

        setCsrfToken(data.csrfToken)
      } catch (err) {
        console.error("CSRF token fetch error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCsrfToken()
  }, [])

  return {
    csrfToken,
    loading,
    error,
    isReady: !!csrfToken && !loading,
  }
}

/**
 * Hook for fetching signed video URLs
 * Gets time-limited signed URLs for video playback
 */
export function useSignedVideoUrl(courseId, lessonId) {
  const [videoUrl, setVideoUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expiresAt, setExpiresAt] = useState(null)

  const fetchVideoUrl = async () => {
    if (!courseId || !lessonId) return

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(
        `${apiUrl}/courses/${courseId}/video-url/${lessonId}`,
        {
          credentials: "include",
        }
      )

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch video URL")
      }

      setVideoUrl(data.data.url)
      setExpiresAt(new Date(data.data.expiresAt))
    } catch (err) {
      console.error("Video URL fetch error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    videoUrl,
    expiresAt,
    loading,
    error,
    fetchVideoUrl,
  }
}
