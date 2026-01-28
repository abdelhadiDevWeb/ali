'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import type { Database } from '@/lib/supabase/types'

type Admin = Database['public']['Tables']['admin']['Row']

interface AboutSectionProps {
  admin: Admin | null
}

export default function AboutSection({ admin }: AboutSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const firstName = admin?.first_name || 'Ali'
  const lastName = admin?.last_name || 'Kermiche'
  const email = admin?.email || 'contact@example.com'

  return (
    <section id="about" ref={ref} className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-gradient-to-br from-white/10 via-blue-500/5 to-purple-500/5 dark:from-slate-900/50 dark:via-blue-950/30 dark:to-purple-950/30 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-cyan-400/20 dark:border-cyan-500/20 overflow-hidden"
        >
          {/* Futuristic grid overlay */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          
          {/* Animated corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400/50" />
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-400/50" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-cyan-400/50" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-400/50" />
          
          <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            About Me
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6 text-lg leading-relaxed text-white"
          >
            <p>
              I'm <span className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{firstName} {lastName}</span>, a professional voice over and dubbing artist with a passion for bringing narratives to life through the power of voice.
            </p>
            
            <p>
              With years of experience in the industry, I specialize in creating authentic, engaging voice performances across multiple languages and genres. Whether it's a commercial that needs to capture attention, a documentary that requires gravitas, or a character that needs personality, I bring dedication and expertise to every project.
            </p>

            <p>
              My approach is simple: understand the message, connect with the audience, and deliver with precision and emotion. I believe that every voice has a story to tell, and I'm here to help you tell yours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 pt-8 border-t border-cyan-400/20 dark:border-cyan-500/20"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Email</span>
                <p className="text-lg text-white mt-1">{email}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Location</span>
                <p className="text-lg text-white mt-1">Available Worldwide</p>
              </div>
            </div>
          </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
