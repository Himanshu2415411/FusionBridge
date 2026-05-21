'use client'

/**
 * useErrorHandler Hook
 * Provides centralized error handling with toast notifications
 */

import { useToast } from '@/hooks/use-toast'
import { getErrorMessage, handleApiError, logError } from '@/lib/error-utils'

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = (error: unknown, context = '') => {
    const message = getErrorMessage(error, context)

    logError(error, context)

    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    })
  }

  const handleApiErrorWithToast = (error: unknown, context = '') => {
    const { status, message } = handleApiError(error, context)

    logError(error, context)

    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    })
  }

  const handleSuccess = (message: string) => {
    toast({
      title: 'Success',
      description: message,
      variant: 'default',
    })
  }

  const handleWarning = (message: string) => {
    toast({
      title: 'Warning',
      description: message,
      variant: 'default',
    })
  }

  return {
    handleError,
    handleApiErrorWithToast,
    handleSuccess,
    handleWarning,
  }
}
