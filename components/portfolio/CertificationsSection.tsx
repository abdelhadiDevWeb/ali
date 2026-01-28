'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Calendar, Download, FileText, Image as ImageIcon } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Certification = Database['public']['Tables']['certification']['Row']

interface CertificationsSectionProps {
  certifications: Certification[]
}

export default function CertificationsSection({ certifications }: CertificationsSectionProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})

  const handleImageError = (certId: string) => {
    setImageErrors(prev => ({ ...prev, [certId]: true }))
  }

  const isImageUrl = (url: string) => {
    const clean = url.split('?')[0].toLowerCase()
    return (
      clean.endsWith('.png') ||
      clean.endsWith('.jpg') ||
      clean.endsWith('.jpeg') ||
      clean.endsWith('.webp') ||
      clean.endsWith('.gif') ||
      clean.endsWith('.avif') ||
      clean.includes('/image/') ||
      clean.includes('/images/')
    )
  }

  const isPdfUrl = (url: string) => {
    const clean = url.split('?')[0].toLowerCase()
    return clean.endsWith('.pdf') || clean.includes('/pdf/')
  }

  return (
    <section id="certifications" className="relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Futuristic background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-indigo-950/30 to-blue-950/20 dark:from-purple-950/40 dark:via-indigo-950/50 dark:to-blue-950/40" />
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '45px 45px',
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
          Certifications
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-slate-200 text-lg mb-12"
        >
          Professional certifications and achievements
        </motion.p>

        {certifications.length === 0 ? (
          <div className="text-center py-20 text-slate-300">
            <p className="text-lg">No certifications available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 border border-purple-400/20 dark:border-purple-500/20 hover:border-purple-400/50 dark:hover:border-purple-500/50 overflow-hidden"
              >
                {/* Holographic glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-indigo-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:via-indigo-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
                <div className="relative z-10">
                {/* Certificate Preview (Image or PDF) */}
                {cert.image && isImageUrl(cert.image) && !imageErrors[cert.id] ? (
                  <div className="mb-4 rounded-lg overflow-hidden bg-slate-800/50 border border-purple-400/20 shadow-lg relative">
                    <img
                      src={cert.image}
                      alt="Certification image"
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={() => handleImageError(cert.id)}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <a
                        href={cert.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/25 text-purple-100 border border-purple-400/30 hover:bg-purple-500/35 hover:border-purple-400/50 transition-colors backdrop-blur"
                        title="Open certificate"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">Open</span>
                      </a>
                    </div>
                  </div>
                ) : cert.image && isPdfUrl(cert.image) ? (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-400/20 h-64 flex flex-col items-center justify-center p-6 text-center">
                    <FileText className="w-16 h-16 text-purple-400/40 mb-3" />
                    <p className="text-white font-semibold">Certificate PDF</p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <a
                        href={cert.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-slate-200 border border-white/10 hover:bg-white/15 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Open</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-400/20 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 text-purple-400/30 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No preview available</p>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    {/* Title intentionally hidden per request */}
                    {cert.description && (
                      <p className="text-sm text-slate-200 line-clamp-2">
                        {cert.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                </div>
                </div>
              </motion.div>
            ))}
        </div>
        )}
      </div>
      </div>
    </section>
  )
}
