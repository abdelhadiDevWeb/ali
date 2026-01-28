'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Admin = Database['public']['Tables']['admin']['Row']
type Audio = Database['public']['Tables']['audio']['Row']

interface HeroSectionProps {
  admin: Admin | null
}

export default function HeroSection({ admin }: HeroSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [demoAudio, setDemoAudio] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch first audio file for demo
    const loadDemoAudio = async () => {
      try {
        const { data } = await supabase
          .from('audio')
          .select('audio_file')
          .not('audio_file', 'is', null)
          .limit(1)
          .single()
        
        if (data?.audio_file) {
          setDemoAudio(data.audio_file)
        }
      } catch (error) {
        // Silently fail - don't show error for loading
      }
    }
    
    loadDemoAudio()
  }, [])

  // Get first audio as demo (you can customize this logic)
  const handlePlayDemo = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        try {
          await audioRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          // If no demo audio is set, show a message
          if (!demoAudio) {
            alert('Demo audio not available. Please add audio files in the dashboard.')
          }
        }
      }
    }
  }

  const firstName = admin?.first_name || 'Ali'
  const lastName = admin?.last_name || 'Kermiche'
  const fullName = `${firstName} ${lastName}`
  const yearsOfExperience = 2 // You can add this to admin table or calculate

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden pt-32">
      {/* Futuristic glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-blue-500/5 to-purple-500/5 dark:from-white/5 dark:via-blue-500/5 dark:to-purple-500/5 backdrop-blur-[1px]" />
      
      {/* Animated neon grid */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating holographic orbs */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-indigo-500/30 rounded-full blur-3xl"
        animate={{
          x: [0, 150, -80, 0],
          y: [0, -100, 80, 0],
          scale: [1, 1.3, 0.7, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 via-pink-500/30 to-rose-500/30 rounded-full blur-3xl"
        animate={{
          x: [0, -150, 100, 0],
          y: [0, 100, -60, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Holographic beam effects */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <motion.path
          d="M 0,0 Q 50%,50% 100%,100%"
          stroke="url(#beamGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
        />
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 lg:space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                {fullName}
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                Voice Over Artist / Dubbing Artist
              </h2>
              
              <p className="text-lg sm:text-xl text-slate-200 leading-relaxed max-w-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                Professional voice talent specializing in commercial, documentary, and multilingual dubbing projects. 
                Bringing stories to life with clarity, emotion, and precision.
              </p>

              <div className="flex items-center gap-2 pt-4">
                <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{yearsOfExperience}+</span>
                <span className="text-lg text-slate-300">Years of Experience</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Profile Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center space-y-8"
          >
            {/* Circular Profile Image with Animation */}
            <motion.div
              className="relative"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Futuristic neon glow effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 via-indigo-500 to-purple-500 rounded-full blur-3xl opacity-40"
                animate={isPlaying ? {
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.15, 1],
                } : {
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: isPlaying ? 1.5 : 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Holographic ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-cyan-400/50"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Extra ring pulse while playing */}
              {isPlaying && (
                <>
                  <motion.div
                    className="absolute -inset-4 rounded-full border-2 border-cyan-400/70 blur-[1px]"
                    initial={{ opacity: 0.3, scale: 1 }}
                    animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.08, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute -inset-6 rounded-full border border-blue-400/60 blur-[1px]"
                    initial={{ opacity: 0.2, scale: 1 }}
                    animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  />
                  <motion.div
                    className="absolute -inset-8 rounded-full border border-purple-400/50 blur-[1px]"
                    initial={{ opacity: 0.15, scale: 1 }}
                    animate={{ opacity: [0.15, 0.5, 0.15], scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  />
                  {/* Rotating rings */}
                  <motion.div
                    className="absolute -inset-5 rounded-full border-2 border-transparent border-t-cyan-400/80 border-r-blue-400/60"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute -inset-7 rounded-full border-2 border-transparent border-b-purple-400/80 border-l-pink-400/60"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                </>
              )}
              
              {/* Profile image container with glassmorphism */}
              <motion.div 
                className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden shadow-2xl border-4 border-white/20 dark:border-slate-800/50 backdrop-blur-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-600/20"
                animate={isPlaying ? {
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: isPlaying ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-blue-500/30 via-indigo-500/30 to-purple-600/30" />
                <div className="absolute inset-0 z-10">
                  <Image
                    src="/ali.jpeg"
                    alt={fullName}
                    fill
                    priority
                    className="object-cover"
                  />
                  {/* subtle cinematic overlay for readability + mood */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/10" />
                </div>
                {/* Animated scan line effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"
                  animate={{
                    y: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: isPlaying ? 1.5 : 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                {/* Stronger glow while playing */}
                {isPlaying && (
                  <>
                    <motion.div
                      className="absolute inset-0 z-20 bg-cyan-400/20"
                      animate={{ opacity: [0.15, 0.4, 0.15] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute -inset-8 z-10 rounded-full bg-gradient-to-r from-cyan-400/30 via-blue-500/30 to-purple-500/30 blur-2xl"
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute -inset-12 z-0 rounded-full bg-gradient-to-r from-purple-400/20 via-pink-500/20 to-rose-500/20 blur-3xl"
                      animate={{ 
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Futuristic Play Demo Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              onClick={handlePlayDemo}
              disabled={!demoAudio}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 via-indigo-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300 hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden border border-cyan-400/50"
            >
              {/* Animated gradient overlay */}
              <motion.span 
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  backgroundPosition: ['0%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              {/* Neon glow effect */}
              <motion.div
                className="absolute inset-0 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="relative z-10 flex items-center gap-3">
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause Demo
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Play Demo
                  </>
                )}
              </span>
            </motion.button>

            {/* Hidden audio element */}
            {demoAudio && (
              <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                className="hidden"
              >
                <source src={demoAudio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
