/**
 * Error Handler Utility
 * Sanitizes database errors and converts them to user-friendly messages
 * Prevents exposing database structure, table names, column names, or technical details
 */

interface DatabaseError {
  message?: string
  code?: string
  details?: string
  hint?: string
}

/**
 * Sanitizes error messages to hide database details
 */
export function sanitizeError(error: unknown): string {
  // If it's already a string, check if it contains database info
  if (typeof error === 'string') {
    return sanitizeErrorMessage(error)
  }

  // If it's an Error object
  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message)
  }

  // If it's a Supabase/PostgreSQL error object
  if (error && typeof error === 'object') {
    const dbError = error as DatabaseError
    
    // Check for common database error patterns
    if (dbError.message) {
      return sanitizeErrorMessage(dbError.message)
    }
    
    if (dbError.code) {
      return getFriendlyErrorMessage(dbError.code)
    }
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again later.'
}

/**
 * Sanitizes error messages by removing database-specific information
 */
function sanitizeErrorMessage(message: string): string {
  if (!message) return 'An unexpected error occurred. Please try again later.'

  const lowerMessage = message.toLowerCase()

  // Remove table names (common patterns)
  const tablePatterns = [
    /\b(?:table|relation)\s+['"]?(\w+)['"]?\s+(?:does not exist|already exists)/gi,
    /\bfrom\s+['"]?(\w+)['"]?/gi,
    /\binto\s+['"]?(\w+)['"]?/gi,
    /\bupdate\s+['"]?(\w+)['"]?/gi,
  ]

  let sanitized = message
  tablePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  // Remove column names
  sanitized = sanitized.replace(/\bcolumn\s+['"]?(\w+)['"]?\s+/gi, 'field ')
  sanitized = sanitized.replace(/\b(\w+)\s+column/gi, 'field')

  // Remove database-specific error codes
  sanitized = sanitized.replace(/\(SQLSTATE\s+\w+\)/gi, '')
  sanitized = sanitized.replace(/\(PGRST\d+\)/gi, '')

  // Remove connection strings or URLs
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '[connection]')
  sanitized = sanitized.replace(/postgresql:\/\/[^\s]+/gi, '[connection]')

  // Remove specific database error patterns
  const dbErrorPatterns = [
    /duplicate key value violates unique constraint/gi,
    /violates foreign key constraint/gi,
    /violates not-null constraint/gi,
    /violates check constraint/gi,
    /relation.*does not exist/gi,
    /column.*does not exist/gi,
    /permission denied for table/gi,
    /syntax error at or near/gi,
  ]

  dbErrorPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      sanitized = getFriendlyErrorMessage(sanitized)
    }
  })

  // Map common database errors to user-friendly messages
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('unique')) {
    return 'This information already exists. Please use a different value.'
  }

  if (lowerMessage.includes('foreign key') || lowerMessage.includes('constraint')) {
    return 'This operation cannot be completed due to related data. Please check your input.'
  }

  if (lowerMessage.includes('not null') || lowerMessage.includes('required')) {
    return 'Please fill in all required fields.'
  }

  if (lowerMessage.includes('does not exist') || lowerMessage.includes('not found')) {
    return 'The requested information could not be found.'
  }

  if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized')) {
    return 'You do not have permission to perform this action.'
  }

  if (lowerMessage.includes('connection') || lowerMessage.includes('network')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }

  if (lowerMessage.includes('timeout')) {
    return 'The request took too long. Please try again.'
  }

  if (lowerMessage.includes('invalid') || lowerMessage.includes('syntax')) {
    return 'The information provided is invalid. Please check your input and try again.'
  }

  // If the message still contains technical details, return a generic message
  if (containsTechnicalDetails(sanitized)) {
    return 'An error occurred while processing your request. Please try again later.'
  }

  // Clean up extra whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ')

  // If sanitized message is too short or empty, return default
  if (sanitized.length < 10) {
    return 'An unexpected error occurred. Please try again later.'
  }

  return sanitized
}

/**
 * Checks if a message contains technical details that should be hidden
 */
function containsTechnicalDetails(message: string): boolean {
  const technicalPatterns = [
    /\b(?:supabase|postgres|postgresql|sql|database|db)\b/gi,
    /\b(?:table|column|relation|schema|constraint|index)\b/gi,
    /\b(?:select|insert|update|delete|from|where|join)\b/gi,
    /\(SQLSTATE|PGRST|ERROR|WARNING\)/gi,
    /\b\d{5}\b/, // PostgreSQL error codes
    /[a-z_]+\.(id|created_at|updated_at)/gi, // Column references
  ]

  return technicalPatterns.some(pattern => pattern.test(message))
}

/**
 * Gets friendly error messages for specific error codes
 */
function getFriendlyErrorMessage(codeOrMessage: string): string {
  const code = codeOrMessage.toLowerCase()

  // PostgreSQL error codes
  if (code.includes('23505') || code.includes('duplicate')) {
    return 'This information already exists. Please use a different value.'
  }

  if (code.includes('23503') || code.includes('foreign key')) {
    return 'This operation cannot be completed due to related data.'
  }

  if (code.includes('23502') || code.includes('not null')) {
    return 'Please fill in all required fields.'
  }

  if (code.includes('42P01') || code.includes('does not exist')) {
    return 'The requested information could not be found.'
  }

  if (code.includes('42501') || code.includes('permission')) {
    return 'You do not have permission to perform this action.'
  }

  if (code.includes('08000') || code.includes('connection')) {
    return 'Unable to connect to the server. Please try again later.'
  }

  if (code.includes('timeout')) {
    return 'The request took too long. Please try again.'
  }

  // Default
  return 'An error occurred while processing your request. Please try again later.'
}

/**
 * Logs error details to console (for debugging) without exposing to user
 */
export function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, error)
  } else {
    // In production, only log minimal info
    console.error(`[${context}] An error occurred`)
  }
}
