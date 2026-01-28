'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Instagram,
  Mail,
  MessageCircle,
  Music2,
  Phone,
  Send,
  MapPin,
} from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Admin = Database['public']['Tables']['admin']['Row']

interface FooterProps {
  admin: Admin | null
}

export default function Footer({ admin }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const email = 'mohamedali.kermiche@gmail.com'
  const phoneDisplay = '+213540667301'
  const phoneTel = 'tel:+213540667301'
  // WhatsApp requires country code; this assumes Algeria (+213) and drops leading 0
  const whatsappLink = 'https://wa.me/213540667301'
  const telegramLink = 'https://t.me/+213540667301'
  
  // Hardcoded social media links
  const instagramLink = 'https://www.instagram.com' // Update with actual Instagram URL
  const tiktokLink = 'https://www.tiktok.com' // Update with actual TikTok URL

  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl border-t border-cyan-500/20">
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
      
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Get In Touch</h3>
            <div className="space-y-3">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span>{email}</span>
              </a>
              <a
                href={phoneTel}
                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-cyan-600 rounded-lg group-hover:bg-cyan-500 transition-colors">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span>{phoneDisplay}</span>
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-500 transition-colors">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <span>WhatsApp • {phoneDisplay}</span>
              </a>
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-sky-600 rounded-lg group-hover:bg-sky-500 transition-colors">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <span>Telegram • {phoneDisplay}</span>
              </a>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span>Algeria</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <nav className="space-y-2">
              <a href="#about" className="block text-slate-300 hover:text-white transition-colors">
                About
              </a>
              <a href="#audio" className="block text-slate-300 hover:text-white transition-colors">
                Audio Demos
              </a>
              <a href="#work" className="block text-slate-300 hover:text-white transition-colors">
                Projects
              </a>
              <a href="#certifications" className="block text-slate-300 hover:text-white transition-colors">
                Certifications
              </a>
            </nav>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-800 hover:bg-pink-600 rounded-lg transition-all duration-300 hover:scale-110 group"
                aria-label="Instagram"
                title="Instagram"
              >
                <Instagram className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
              </a>
              <a
                href={tiktokLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-800 hover:bg-black rounded-lg transition-all duration-300 hover:scale-110 group"
                aria-label="TikTok"
                title="TikTok"
              >
                <Music2 className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="pt-8 border-t border-cyan-500/20 text-center"
        >
          <p className="text-slate-400 text-sm">
            © {currentYear} {admin?.first_name} {admin?.last_name}.{' '}
            <Link
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors cursor-pointer"
            >
              All rights reserved.
            </Link>
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Professional Voice Over & Dubbing Services
          </p>
        </motion.div>
      </div>
      </div>
    </footer>
  )
}
