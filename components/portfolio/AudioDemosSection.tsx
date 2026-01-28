'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, Music2, Waves, Clock } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Audio = Database['public']['Tables']['audio']['Row']
type Category = Database['public']['Tables']['category']['Row']

interface AudioDemosSectionProps {
  audios: Audio[]
  categories: Category[]
}

export default function AudioDemosSection({ audios, categories }: AudioDemosSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [durations, setDurations] = useState<{ [key: string]: number }>({})
  const [currentTimes, setCurrentTimes] = useState<{ [key: string]: number }>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})

  // Show all audios - filter by category if selected
  const filteredAudios = selectedCategory
    ? audios.filter(audio => audio.category_id === selectedCategory)
    : audios

  const handlePlay = async (id: string, audioUrl: string | null) => {
    if (!audioUrl) {
      alert('Audio file not available')
      return
    }

    // Stop all other audios
    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (audio && key !== id) {
        audio.pause()
        audio.currentTime = 0
        setPlayingId(null)
      }
    })

    const audio = audioRefs.current[id]
    if (audio) {
      try {
        if (playingId === id) {
          audio.pause()
          setPlayingId(null)
          setIsPlaying(false)
        } else {
          await audio.play()
          setPlayingId(id)
          setIsPlaying(true)
        }
      } catch (error) {
        alert('Unable to play audio. Please check if the audio file is accessible.')
      }
    }
  }

  const handleTimeUpdate = (id: string, currentTime: number) => {
    setCurrentTimes(prev => ({ ...prev, [id]: currentTime }))
  }

  const handleLoadedMetadata = (id: string, duration: number) => {
    setDurations(prev => ({ ...prev, [id]: duration }))
  }

  const handleSeek = (id: string, newTime: number) => {
    const audio = audioRefs.current[id]
    if (audio) {
      audio.currentTime = newTime
      setCurrentTimes(prev => ({ ...prev, [id]: newTime }))
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <section id="audio" className="relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Futuristic background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-indigo-950/30 to-purple-950/20 dark:from-blue-950/40 dark:via-indigo-950/50 dark:to-purple-950/40" />
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Audio Demos
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-slate-200 text-lg mb-12"
        >
          Explore my work across different categories
        </motion.p>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-white/10 backdrop-blur-xl text-slate-200 hover:text-white hover:bg-white/20 border border-cyan-400/30'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-white/10 backdrop-blur-xl text-slate-200 hover:text-white hover:bg-white/20 border border-cyan-400/30'
                }`}
              >
                {category.name}
              </button>
            ))}
        </motion.div>

        {/* Audio Grid */}
        <AnimatePresence mode="wait">
          {filteredAudios.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-slate-300"
            >
              <p className="text-lg">No audio demos found in this category.</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedCategory || 'all'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAudios.map((audio, index) => {
                const category = categories.find(c => c.id === audio.category_id)
                return (
                  <motion.div
                    key={audio.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300 border border-cyan-400/20 dark:border-cyan-500/20 hover:border-cyan-400/50 dark:hover:border-cyan-500/50"
                  >

                    {/* Holographic effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:via-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none" />
                    
                    {/* Animated background when playing */}
                    {playingId === audio.id && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    
                    <div className="relative z-10 p-6">
                    {/* Category Badge */}
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-medium border border-cyan-400/30 inline-block">
                        {category?.name || 'Uncategorized'}
                      </span>
                    </div>

                    {/* Modern Audio Player */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Play Button with Animation */}
                        <motion.button
                          onClick={() => handlePlay(audio.id, audio.audio_file)}
                          disabled={!audio.audio_file}
                          className={`relative w-16 h-16 rounded-2xl text-white flex items-center justify-center transition-all duration-300 shadow-2xl ${
                            audio.audio_file
                              ? playingId === audio.id
                                ? 'bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600'
                                : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500'
                              : 'bg-slate-600 cursor-not-allowed opacity-50'
                          }`}
                          whileHover={audio.audio_file && playingId !== audio.id ? { scale: 1.1 } : {}}
                          whileTap={audio.audio_file ? { scale: 0.95 } : {}}
                        >
                          {playingId === audio.id ? (
                            <>
                              <Pause className="w-6 h-6" />
                              {/* Pulsing ring animation */}
                              <motion.div
                                className="absolute inset-0 rounded-2xl border-2 border-cyan-400"
                                animate={{
                                  scale: [1, 1.3, 1],
                                  opacity: [0.8, 0, 0.8],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                            </>
                          ) : (
                            <Play className="w-6 h-6 ml-1" />
                          )}
                        </motion.button>

                        {/* Audio Info */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {audio.title}
                          </h3>
                          {audio.description && (
                            <p className="text-sm text-slate-300 line-clamp-1">
                              {audio.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Audio Element */}
                      {audio.audio_file && (
                        <audio
                          ref={(el) => {
                            if (el) {
                              audioRefs.current[audio.id] = el
                              el.addEventListener('loadedmetadata', () => {
                                handleLoadedMetadata(audio.id, el.duration)
                              })
                              el.addEventListener('timeupdate', () => {
                                handleTimeUpdate(audio.id, el.currentTime)
                              })
                            }
                          }}
                          src={audio.audio_file}
                          onEnded={() => {
                            setPlayingId(null)
                            setIsPlaying(false)
                            setCurrentTimes(prev => ({ ...prev, [audio.id]: 0 }))
                          }}
                          onPause={() => {
                            setPlayingId(null)
                            setIsPlaying(false)
                          }}
                          onPlay={() => {
                            setPlayingId(audio.id)
                            setIsPlaying(true)
                          }}
                          preload="metadata"
                          className="hidden"
                        />
                      )}

                      {/* Audio Controls and Progress */}
                      {audio.audio_file && (
                        <div className="space-y-3">
                          {/* Animated Waveform when playing */}
                          {playingId === audio.id && (
                            <motion.div
                              className="flex items-center justify-center gap-1 h-8 mb-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="w-1 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full"
                                  animate={{
                                    height: [8, 24, 8],
                                  }}
                                  transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                    ease: "easeInOut",
                                  }}
                                />
                              ))}
                            </motion.div>
                          )}

                          {/* Progress Bar */}
                          <div className="relative w-full h-2 bg-slate-700/50 rounded-full overflow-hidden cursor-pointer group"
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              const percent = (e.clientX - rect.left) / rect.width
                              const duration = durations[audio.id] || 0
                              handleSeek(audio.id, percent * duration)
                            }}
                          >
                            <motion.div
                              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full relative overflow-hidden"
                              style={{
                                width: durations[audio.id]
                                  ? `${(currentTimes[audio.id] || 0) / durations[audio.id] * 100}%`
                                  : '0%'
                              }}
                            >
                              {/* Shimmer effect when playing */}
                              {playingId === audio.id && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                  animate={{
                                    x: ['-100%', '100%'],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                />
                              )}
                            </motion.div>
                            {playingId === audio.id && (
                              <motion.div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                  left: durations[audio.id]
                                    ? `${(currentTimes[audio.id] || 0) / durations[audio.id] * 100}%`
                                    : '0%',
                                  transform: 'translate(-50%, -50%)'
                                }}
                                animate={{
                                  scale: [1, 1.2, 1],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                }}
                              />
                            )}
                          </div>

                          {/* Time Display */}
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {durations[audio.id]
                                  ? formatDuration(currentTimes[audio.id] || 0)
                                  : '0:00'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Music2 className="w-3 h-3" />
                              <span>
                                {durations[audio.id]
                                  ? formatDuration(durations[audio.id])
                                  : '--:--'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {!audio.audio_file && (
                        <div className="text-xs text-slate-400 italic text-center py-4">
                          Audio file not available
                        </div>
                      )}
                    </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </section>
  )
}
