/**
 * Environment Variable Validator
 * Validates required environment variables at startup
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

export function validateEnvVars() {
  const missing: string[] = [];
  const invalid: string[] = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    
    if (!value || value.trim() === '') {
      missing.push(envVar);
    } else if (envVar.includes('URL') && !isValidUrl(value)) {
      invalid.push(`${envVar} is not a valid URL`);
    } else if (envVar.includes('KEY') && value.length < 20) {
      invalid.push(`${envVar} appears to be invalid (too short)`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }

  if (invalid.length > 0) {
    throw new Error(
      `Invalid environment variables:\n${invalid.join('\n')}`
    );
  }

  return true;
}

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

// Validate on import in production
if (process.env.NODE_ENV === 'production') {
  validateEnvVars();
}
