'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Save, Loader2, Edit2, X } from 'lucide-react'
import { sanitizeError, logError } from '@/lib/utils/error-handler'
import type { Database } from '@/lib/supabase/types'

type Admin = Database['public']['Tables']['admin']['Row']

interface ProfileEditSectionProps {
  admin: Admin | null
}

export default function ProfileEditSection({ admin }: ProfileEditSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })
  const supabase = createClient()

  useEffect(() => {
    if (admin) {
      setFormData({
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        email: admin.email || '',
      })
    }
  }, [admin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Check if user is authenticated (has admin_session cookie)
      const response = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: admin.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess(true)
      setIsEditing(false)
      // Reload the page to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      logError('ProfileEditSection.handleSubmit', err)
      setError(sanitizeError(err))
    } finally {
      setSaving(false)
    }
  }

  if (!admin) return null

  return (
    <section id="profile-edit" className="relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-indigo-900/50 backdrop-blur-sm" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-cyan-400/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Edit Profile</h2>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
              >
                <Edit2 size={18} />
                Edit
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false)
                  setError(null)
                  setSuccess(false)
                  // Reset form data
                  if (admin) {
                    setFormData({
                      first_name: admin.first_name || '',
                      last_name: admin.last_name || '',
                      email: admin.email || '',
                    })
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all duration-200"
              >
                <X size={18} />
                Cancel
              </button>
            )}
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-green-500/20 border border-green-400/50 rounded-xl text-green-300"
            >
              Profile updated successfully! Refreshing...
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-red-300"
            >
              {error}
            </motion.div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-cyan-400/20 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-cyan-400/20 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-cyan-400/20 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {admin.first_name?.[0]}{admin.last_name?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {admin.first_name} {admin.last_name}
                  </h3>
                  <p className="text-slate-300 flex items-center gap-2 mt-1">
                    <Mail size={16} />
                    {admin.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
