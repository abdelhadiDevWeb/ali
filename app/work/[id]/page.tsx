'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Video, Calendar, Play, ExternalLink, Loader2 } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Work = Database['public']['Tables']['work']['Row']

export default function WorkDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadWorkDetails(params.id as string)
    }
  }, [params.id])

  // Auto-play video when it loads
  useEffect(() => {
    if (videoRef.current && work?.video) {
      const video = videoRef.current
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, user will need to click play
        })
      }
    }
  }, [work])

  const loadWorkDetails = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('work')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setWork(data)
    } catch (error) {
      console.error('Error loading work details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 pt-32 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={32} />
          <p className="text-slate-300">Loading work details...</p>
        </div>
      </div>
    )
  }

  if (!work) {
    return (
      <div className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 text-lg mb-4">Work not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 pt-32">
      {/* Futuristic background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
      <div className="fixed inset-0 -z-10 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Portfolio</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Video */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Video Player */}
            {work.video ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 shadow-2xl">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                  <Video className="w-5 h-5 text-cyan-400" />
                  Video Preview
                </h3>
                {(() => {
                  const youtubeMatch = work.video?.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/)
                  const vimeoMatch = work.video?.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com)\/(?:video\/|)(\d+)(?:\S+)?/)

                  if (youtubeMatch) {
                    return (
                      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          src={`https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="YouTube video player"
                        ></iframe>
                      </div>
                    )
                  } else if (vimeoMatch) {
                    return (
                      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1`}
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title="Vimeo video player"
                        ></iframe>
                      </div>
                    )
                  } else {
                    return (
                      <div className="w-full">
                        <video
                          ref={videoRef}
                          controls
                          autoPlay
                          muted
                          className="w-full h-auto rounded-lg border border-slate-700"
                          preload="auto"
                        >
                          <source src={work.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <a
                          href={work.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open Video File</span>
                        </a>
                      </div>
                    )
                  }
                })()}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 shadow-2xl h-96 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-20 h-20 text-cyan-400/50 mx-auto mb-4" />
                  <p className="text-slate-400">No video available</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Side - Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/20 shadow-2xl">
              <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {work.title}
              </h1>

              {work.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-3">Description</h2>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                    {work.description}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span>
                    {new Date(work.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {work.video && (
                <div className="mt-6 pt-6 border-t border-cyan-400/20">
                  <a
                    href={work.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                  >
                    <Play className="w-5 h-5" />
                    <span>Watch Full Video</span>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
