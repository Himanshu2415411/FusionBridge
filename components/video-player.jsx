'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Volume2, VolumeX, Maximize, Play, Pause } from 'lucide-react'
import { VideoPlayerSkeleton } from '@/components/skeletons'

/**
 * HLS Video Player Component
 * Supports adaptive bitrate streaming and progress tracking
 * Install hls.js: npm install hls.js
 */
export function HLSVideoPlayer({
  src,
  thumbnail,
  title,
  onProgress,
  onComplete,
  watchTimeThreshold = 80, // 80% watched to mark complete
  autoPlay = false,
  controls = true,
  isLoading = false,
}) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [bufferedPercentage, setBufferedPercentage] = useState(0)
  const [watchPercentage, setWatchPercentage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const progressIntervalRef = useRef(null)

  // Initialize HLS
  useEffect(() => {
    if (!src || !videoRef.current) return

    // Load HLS video if src is HLS URL
    if (src.includes('.m3u8')) {
      // Import HLS.js dynamically for better performance
      import('hls.js').then((HLS) => {
        const hls = new HLS.default({
          enableWorker: true,
          lowLatencyMode: true,
        })
        hls.loadSource(src)
        hls.attachMedia(videoRef.current)

        return () => {
          hls.destroy()
        }
      })
    } else {
      // For regular video sources
      videoRef.current.src = src
    }
  }, [src])

  // Track watch percentage
  useEffect(() => {
    if (duration === 0) return

    progressIntervalRef.current = setInterval(() => {
      const percentage = (currentTime / duration) * 100
      setWatchPercentage(percentage)

      // Call progress callback
      if (onProgress) {
        onProgress({
          currentTime,
          duration,
          watchPercentage: Math.round(percentage),
        })
      }

      // Mark complete when watched enough
      if (percentage >= watchTimeThreshold && onComplete) {
        onComplete({
          watchPercentage: Math.round(percentage),
          totalDuration: Math.round(duration),
        })
        clearInterval(progressIntervalRef.current)
      }
    }, 1000)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [currentTime, duration, watchTimeThreshold, onProgress, onComplete])

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (value) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleProgressChange = (value) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const handleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    }

    setIsFullscreen(!isFullscreen)
  }

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Track buffered content
  useEffect(() => {
    if (!videoRef.current) return

    const handleProgress = () => {
      if (videoRef.current?.buffered.length > 0) {
        const buffered = videoRef.current.buffered.end(
          videoRef.current.buffered.length - 1
        )
        const percentage = (buffered / duration) * 100
        setBufferedPercentage(percentage)
      }
    }

    const video = videoRef.current
    video.addEventListener('progress', handleProgress)

    return () => video.removeEventListener('progress', handleProgress)
  }, [duration])

  if (isLoading) {
    return <VideoPlayerSkeleton />
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      className={`w-full bg-black rounded-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      <div className="relative w-full h-0 pb-[56.25%]">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full"
          poster={thumbnail}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer hover:bg-black/50 transition"
            onClick={handlePlay}>
            <div className="bg-white/20 rounded-full p-4 hover:bg-white/30 transition">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {controls && (
        <div className="bg-gray-900 text-white p-4 space-y-2">
          {/* Progress Bar */}
          <div className="space-y-1">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleProgressChange}
              className="w-full"
            />
            {/* Buffered indicator */}
            <div className="text-xs text-gray-400">
              Buffered: {Math.round(bufferedPercentage)}%
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePlay}
                className="text-white hover:bg-gray-800"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMute}
                  className="text-white hover:bg-gray-800"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              {/* Time */}
              <span className="text-sm ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Watch Percentage */}
              <span className="text-xs text-gray-400 ml-2">
                {Math.round(watchPercentage)}%
              </span>
            </div>

            {/* Fullscreen */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFullscreen}
              className="text-white hover:bg-gray-800"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>

          {/* Title */}
          {title && <div className="text-sm font-semibold text-white">{title}</div>}
        </div>
      )}
    </div>
  )
}

/**
 * Video Player with progress tracking for lessons
 */
export function LessonVideoPlayer({
  lessonId,
  courseId,
  videoUrl,
  thumbnail,
  title,
  onProgressUpdate,
  onLessonComplete,
}) {
  const [watchPercentage, setWatchPercentage] = useState(0)

  const handleProgress = (progress) => {
    setWatchPercentage(progress.watchPercentage)
    onProgressUpdate?.({
      lessonId,
      courseId,
      ...progress,
    })
  }

  const handleComplete = (data) => {
    onLessonComplete?.({
      lessonId,
      courseId,
      ...data,
    })
  }

  return (
    <div className="space-y-2">
      <HLSVideoPlayer
        src={videoUrl}
        thumbnail={thumbnail}
        title={title}
        onProgress={handleProgress}
        onComplete={handleComplete}
        watchTimeThreshold={80}
        controls={true}
      />
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Lesson Progress</span>
          <span className="text-sm text-gray-600">{watchPercentage}% watched</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${watchPercentage}%` }}
          />
        </div>
        {watchPercentage >= 80 && (
          <p className="text-sm text-green-600 mt-2">✓ Lesson completed!</p>
        )}
      </div>
    </div>
  )
}
