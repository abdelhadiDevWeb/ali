'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, Volume2, Image as ImageIcon, Video, Calendar, FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Audio = Database['public']['Tables']['audio']['Row']
type Category = Database['public']['Tables']['category']['Row']

export default function AudioDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const audioId = params.id as string
  const [audio, setAudio] = useState<Audio | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadAudioDetails()
  }, [audioId])

  const loadAudioDetails = async () => {
    try {
      const { data: audioData, error: audioError } = await supabase
        .from('audio')
        .select('*')
        .eq('id', audioId)
        .single()

      if (audioError) throw audioError

      if (audioData) {
        setAudio(audioData)

        // Load category if exists
        if (audioData.category_id) {
          const { data: categoryData } = await supabase
            .from('category')
            .select('*')
            .eq('id', audioData.category_id)
            .single()

          if (categoryData) {
            setCategory(categoryData)
          }
        }
      }
    } catch (error) {
      // Silently fail - error will show as "not found" state
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = async () => {
    if (!audio?.audio_file) return

    const audioElement = audioRef.current
    if (audioElement) {
      try {
        if (playing) {
          audioElement.pause()
          setPlaying(false)
        } else {
          await audioElement.play()
          setPlaying(true)
        }
      } catch (error) {
        alert('Unable to play audio. Please check if the audio file is accessible.')
      }
    }
  }

  const handleSeek = (newTime: number) => {
    const audioElement = audioRef.current
    if (audioElement) {
      audioElement.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-300">Loading audio details...</p>
        </div>
      </div>
    )
  }

  if (!audio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="text-center">
          <p className="text-slate-300 text-xl mb-4">Audio not found</p>
          <button
            onClick={() => router.push('/#audio')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Back to Audio Demos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      {/* Futuristic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />
        <div className="absolute inset-0 opacity-20">
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
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/#audio')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Audio Demos</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Image and Audio Player */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Audio Image */}
              {audio.image ? (
                <div className="relative rounded-2xl overflow-hidden border border-cyan-400/20 shadow-2xl">
                  <img
                    src={audio.image}
                    alt={audio.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-cyan-400/20 shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Volume2 className="w-20 h-20 text-cyan-400/50 mx-auto mb-4" />
                    <p className="text-slate-400">No image available</p>
                  </div>
                </div>
              )}

              {/* Audio Player */}
              {audio.audio_file && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-cyan-400" />
                      Audio Player
                    </h3>
                    <button
                      onClick={handlePlay}
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                    >
                      {playing ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-1" />
                      )}
                    </button>
                  </div>

                  <audio
                    ref={audioRef}
                    src={audio.audio_file}
                    onLoadedMetadata={() => {
                      if (audioRef.current) {
                        setDuration(audioRef.current.duration)
                      }
                    }}
                    onTimeUpdate={() => {
                      if (audioRef.current) {
                        setCurrentTime(audioRef.current.currentTime)
                      }
                    }}
                    onEnded={() => {
                      setPlaying(false)
                      setCurrentTime(0)
                    }}
                    onPause={() => setPlaying(false)}
                    preload="metadata"
                    className="hidden"
                  />

                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div
                      className="relative w-full h-3 bg-slate-700/50 rounded-full overflow-hidden cursor-pointer group"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const percent = (e.clientX - rect.left) / rect.width
                        handleSeek(percent * duration)
                      }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                        style={{
                          width: duration ? `${(currentTime / duration) * 100}%` : '0%'
                        }}
                      />
                      {playing && (
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            left: duration ? `${(currentTime / duration) * 100}%` : '0%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{formatDuration(currentTime)}</span>
                      <span>{formatDuration(duration)}</span>
                    </div>
                  </div>

                  {/* Direct Download Link */}
                  <a
                    href={audio.audio_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Open Audio File</span>
                  </a>
                </div>
              )}

              {/* Video Display */}
              {audio.video && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Video className="w-6 h-6 text-cyan-400" />
                    Video
                  </h3>
                  <div className="relative rounded-xl overflow-hidden border border-cyan-400/20 bg-slate-900/50">
                    {audio.video.includes('youtube.com') || audio.video.includes('youtu.be') ? (
                      <iframe
                        src={audio.video.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={audio.title}
                      />
                    ) : audio.video.includes('vimeo.com') ? (
                      <iframe
                        src={audio.video.replace('vimeo.com/', 'player.vimeo.com/video/')}
                        className="w-full aspect-video"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={audio.title}
                      />
                    ) : (
                      <video
                        src={audio.video}
                        controls
                        className="w-full aspect-video"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                  <a
                    href={audio.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                  >
                    <Video className="w-4 h-4" />
                    <span>Open Video in New Tab</span>
                  </a>
                </div>
              )}
            </motion.div>

            {/* Right Side - Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Title and Category */}
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {audio.title}
                </h1>
                
                {category && (
                  <div className="flex items-center gap-2 mb-4">
                    <FolderOpen className="w-5 h-5 text-cyan-400" />
                    <span className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium border border-cyan-400/30">
                      {category.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {audio.description && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20">
                  <h2 className="text-xl font-bold text-white mb-3">Description</h2>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                    {audio.description}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-cyan-400/20">
                  <div className="flex items-center gap-2 text-cyan-400 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Created</span>
                  </div>
                  <p className="text-white">
                    {new Date(audio.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {audio.updated_at && (
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-cyan-400/20">
                    <div className="flex items-center gap-2 text-cyan-400 mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm font-semibold uppercase tracking-wide">Updated</span>
                    </div>
                    <p className="text-white">
                      {new Date(audio.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
