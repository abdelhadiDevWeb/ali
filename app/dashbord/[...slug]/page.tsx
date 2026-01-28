'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ErrorBoundary from '@/components/dashboard/ErrorBoundary'
import ProfilePage from '@/components/dashboard/ProfilePage'
import CategoryPage from '@/components/dashboard/CategoryPage'
import AudioPage from '@/components/dashboard/AudioPage'
import CertificationPage from '@/components/dashboard/CertificationPage'
import WorkPage from '@/components/dashboard/WorkPage'

export default function DashboardPage() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Extract the current page from the pathname
  const getCurrentPage = () => {
    const segments = pathname.split('/')
    const lastSegment = segments[segments.length - 1]
    
    // Handle different page routes
    if (lastSegment === 'profile' || lastSegment === 'alilou_kermiche') return 'profile'
    if (lastSegment === 'category') return 'category'
    if (lastSegment === 'audio') return 'audio'
    if (lastSegment === 'certification') return 'certification'
    if (lastSegment === 'work') return 'work'
    return 'profile' // default
  }

  const currentPage = getCurrentPage()

  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage />
      case 'category':
        return <CategoryPage />
      case 'audio':
        return <AudioPage />
      case 'certification':
        return <CertificationPage />
      case 'work':
        return <WorkPage />
      default:
        return <ProfilePage />
    }
  }

  return (
    <ErrorBoundary>
      <DashboardLayout currentPage={currentPage}>
        {renderPage()}
      </DashboardLayout>
    </ErrorBoundary>
  )
}
