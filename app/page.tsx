'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/error-handler'
import FuturisticBackground from '@/components/portfolio/FuturisticBackground'
import Header from '@/components/portfolio/Header'
import HeroSection from '@/components/portfolio/HeroSection'
import AboutSection from '@/components/portfolio/AboutSection'
import AudioDemosSection from '@/components/portfolio/AudioDemosSection'
import WorkSection from '@/components/portfolio/WorkSection'
import CertificationsSection from '@/components/portfolio/CertificationsSection'
import Footer from '@/components/portfolio/Footer'
import type { Database } from '@/lib/supabase/types'

type Audio = Database['public']['Tables']['audio']['Row']
type Work = Database['public']['Tables']['work']['Row']
type Certification = Database['public']['Tables']['certification']['Row']
type Category = Database['public']['Tables']['category']['Row']
type Admin = Database['public']['Tables']['admin']['Row']

export default function Home() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [audios, setAudios] = useState<Audio[]>([])
  const [works, setWorks] = useState<Work[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [adminRes, audiosRes, worksRes, certsRes, catsRes] = await Promise.all([
        supabase.from('admin').select('*').limit(1).single(),
        supabase.from('audio').select('*').order('created_at', { ascending: false }),
        supabase.from('work').select('*').order('created_at', { ascending: false }),
        supabase.from('certification').select('*').order('date', { ascending: false }),
        supabase.from('category').select('*').order('name'),
      ])

      if (adminRes.data) setAdmin(adminRes.data)
      if (audiosRes.data) setAudios(audiosRes.data)
      if (worksRes.data) setWorks(worksRes.data)
      if (certsRes.data) setCertifications(certsRes.data)
      if (catsRes.data) setCategories(catsRes.data)
    } catch (error) {
      logError('Home.loadData', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
  return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <FuturisticBackground />
      <Header />
      <div className="relative z-10">
        <HeroSection admin={admin} />
        <AboutSection admin={admin} />
        <AudioDemosSection audios={audios} categories={categories} />
        <WorkSection works={works} />
        <CertificationsSection certifications={certifications} />
        <Footer admin={admin} />
        </div>
    </div>
  )
}
