'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Optimized image component with lazy loading and fallback
 * Automatically handles responsive sizing and formats
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  objectFit = 'cover',
  sizes,
  priority = false,
  fallbackSrc,
  showSkeleton = true,
  onLoad,
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  useEffect(() => {
    setImageSrc(src)
    setHasError(false)
    setIsLoading(true)
  }, [src])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    } else {
      setIsLoading(false)
    }
  }

  // Responsive sizes for Next.js Image optimization
  const defaultSizes = sizes || '(max-width: 768px) 100vw, 50vw'

  return (
    <div className={cn('relative overflow-hidden bg-gray-100', containerClassName)}>
      {showSkeleton && isLoading && <Skeleton className="absolute inset-0" />}

      {imageSrc && !hasError ? (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn('transition-opacity duration-300', {
            'opacity-0': isLoading,
            'opacity-100': !isLoading,
          }, className)}
          onLoadingComplete={handleLoadingComplete}
          onError={handleError}
          sizes={defaultSizes}
          priority={priority}
          style={{
            objectFit,
          }}
        />
      ) : (
        <div className={cn('w-full h-full bg-gray-200 flex items-center justify-center', className)}>
          <span className="text-gray-400 text-sm">Image not available</span>
        </div>
      )}
    </div>
  )
}

/**
 * Course card image with optimized loading
 */
export function CourseImageCard({
  src,
  alt,
  title,
  category,
  containerClassName,
}) {
  return (
    <div className={cn('relative group cursor-pointer', containerClassName)}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={300}
        height={200}
        objectFit="cover"
        className="w-full h-48 rounded-t-lg group-hover:scale-105 transition-transform duration-300"
        containerClassName="w-full h-48 overflow-hidden rounded-t-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Overlay with info */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-3 rounded-t-lg">
        {title && (
          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="font-semibold text-sm">{title}</p>
            {category && <p className="text-xs text-gray-200">{category}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Avatar image with fallback
 */
export function AvatarImage({
  src,
  alt,
  size = 'md',
  className,
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div className={cn('relative overflow-hidden rounded-full bg-gray-200', sizeClasses[size])}>
      <OptimizedImage
        src={src || '/avatar-placeholder.png'}
        alt={alt}
        width={64}
        height={64}
        className={cn('w-full h-full', className)}
        containerClassName="w-full h-full"
        sizes="64px"
        objectFit="cover"
      />
    </div>
  )
}

/**
 * Hero image with aspect ratio control
 */
export function HeroImage({
  src,
  alt,
  aspectRatio = '16/9',
  className,
  containerClassName,
}) {
  return (
    <div className={cn('relative w-full', containerClassName)}>
      <div style={{ aspectRatio }} className="relative">
        <OptimizedImage
          src={src}
          alt={alt}
          width={1200}
          height={675}
          objectFit="cover"
          className={className}
          containerClassName="w-full h-full"
          sizes="(max-width: 768px) 100vw, 100vw"
          priority
        />
      </div>
    </div>
  )
}

/**
 * Responsive image gallery
 */
export function ImageGallery({
  images,
  columns = 3,
  gap = 4,
  containerClassName,
}) {
  return (
    <div
      className={cn('grid', {
        'grid-cols-1': columns === 1,
        'grid-cols-2': columns === 2,
        'grid-cols-3': columns === 3,
        'grid-cols-4': columns === 4,
        'gap-2': gap === 2,
        'gap-3': gap === 3,
        'gap-4': gap === 4,
        'gap-6': gap === 6,
      }, containerClassName)}
    >
      {images.map((image, index) => (
        <div key={index}>
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            width={300}
            height={300}
            objectFit="cover"
            className="w-full h-64 rounded-lg"
            containerClassName="w-full h-64 rounded-lg"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ))}
    </div>
  )
}

/**
 * Thumbnail image with badge
 */
export function ThumbnailImage({
  src,
  alt,
  badge,
  badgeClassName,
  onClick,
  className,
  containerClassName,
}) {
  return (
    <div
      className={cn('relative cursor-pointer group', containerClassName)}
      onClick={onClick}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={200}
        height={200}
        objectFit="cover"
        className={cn('w-full h-40 rounded-lg group-hover:opacity-75 transition-opacity', className)}
        containerClassName="w-full h-40 rounded-lg"
        sizes="200px"
      />

      {badge && (
        <div className={cn(
          'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white bg-blue-500',
          badgeClassName
        )}>
          {badge}
        </div>
      )}
    </div>
  )
}

/**
 * Background image with blur effect
 */
export function BackgroundImage({
  src,
  alt,
  children,
  className,
  blurAmount = 'md',
  overlayOpacity = 0.5,
}) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  }

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={1920}
        height={1080}
        objectFit="cover"
        className="absolute inset-0 w-full h-full"
        containerClassName="absolute inset-0"
        sizes="100vw"
        priority
      />

      {/* Overlay */}
      <div
        className={cn('absolute inset-0', blurClasses[blurAmount])}
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

/**
 * Progressive image loader (blur-up effect)
 */
export function ProgressiveImage({
  src,
  blurDataUrl,
  alt,
  width,
  height,
  className,
  containerClassName,
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Blur placeholder */}
      {blurDataUrl && !isLoaded && (
        <Image
          src={blurDataUrl}
          alt={alt}
          width={width}
          height={height}
          className={cn('blur-sm', className)}
          quality={10}
        />
      )}

      {/* Full image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn('transition-opacity duration-500', {
          'opacity-0': !isLoaded,
          'opacity-100': isLoaded,
        }, className)}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  )
}
