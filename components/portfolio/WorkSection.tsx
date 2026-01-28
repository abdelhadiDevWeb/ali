'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Video, ArrowRight, Calendar } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Work = Database['public']['Tables']['work']['Row']

interface WorkSectionProps {
  works: Work[]
}

export default function WorkSection({ works }: WorkSectionProps) {
  return (
    <section id="work" className="relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Futuristic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-blue-950/30 to-indigo-950/30 dark:from-slate-950/80 dark:via-blue-950/60 dark:to-indigo-950/60" />
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Projects & Work
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-slate-200 text-lg mb-12"
        >
          A selection of my recent projects and collaborations
        </motion.p>

        {works.length === 0 ? (
          <div className="text-center py-20 text-slate-300">
            <p className="text-lg">No projects available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {works.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300 border border-cyan-400/20 dark:border-cyan-500/20 hover:border-cyan-400/50 dark:hover:border-cyan-500/50"
              >
                {/* Clickable video preview - navigates to details page */}
                <Link href={`/work/${work.id}`} className="block">
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    {/* Abstract glow / pattern */}
                    <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.35),_transparent_55%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(15,23,42,0.4),_rgba(15,23,42,0.95))]" />

                    {/* Center play badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-xl flex items-center justify-center border border-cyan-300/40 shadow-[0_0_40px_rgba(56,189,248,0.6)]"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Play className="w-9 h-9 text-white ml-1" />
                      </motion.div>
                    </div>

                    {/* Top-right video badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 bg-cyan-500/25 backdrop-blur-md rounded-full border border-cyan-300/40 flex items-center gap-1">
                        <Video className="w-4 h-4 text-cyan-100" />
                        <span className="text-[11px] font-medium text-cyan-50">HD</span>
                      </div>
                    </div>

                    {/* Bottom title overlay for context */}
                    <div className="absolute inset-x-0 bottom-0 p-4 pt-10 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent">
                      <p className="text-sm font-semibold text-white/90 line-clamp-1">
                        {work.title}
                      </p>
                      {work.description && (
                        <p className="mt-1 text-[11px] text-slate-300/80 line-clamp-1">
                          {work.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {work.title}
                  </h3>
                  
                  {work.description && (
                    <p className="text-slate-200 text-sm mb-4 line-clamp-2">
                      {work.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(work.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                    </div>
                    {work.video && (
                      <div className="flex items-center gap-1 text-xs text-cyan-400">
                        <Video className="w-3 h-3" />
                        <span>Video Available</span>
                      </div>
                    )}
                  </div>

                  {/* Show More Button */}
                  <Link href={`/work/${work.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full group/btn flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-400/30 hover:border-cyan-400/50 rounded-lg text-cyan-300 hover:text-white transition-all duration-300 font-medium"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
        )}
      </div>
      </div>
    </section>
  )
}
