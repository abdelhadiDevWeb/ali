'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { sanitizeError } from '@/lib/utils/error-handler'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Supabase') || event.message.includes('environment variables')) {
        setHasError(true)
        setError(new Error(event.message))
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-red-200 dark:border-red-900">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Supabase Configuration Required
            </h1>
          </div>

          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p className="text-lg">
              The Supabase environment variables are not configured. Please set up your credentials to use the dashboard.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
              <h2 className="font-semibold text-slate-900 dark:text-white">Quick Setup:</h2>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  Open <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">client/.env.local</code>
                </li>
                <li>
                  Add your Supabase credentials:
                  <pre className="mt-2 bg-slate-900 dark:bg-slate-950 text-green-400 p-3 rounded-lg text-sm overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here`}
                  </pre>
                </li>
                <li>
                  Get your credentials from:{' '}
                  <a
                    href="https://app.supabase.com/project/_/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Supabase API Settings
                  </a>
                </li>
                <li>Restart your dev server (Ctrl+C then npm run dev)</li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> The .env.local file is already created. You just need to add your actual Supabase project URL and anon key.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {sanitizeError(error)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
