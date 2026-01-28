'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sanitizeError, logError } from '@/lib/utils/error-handler'
import { User, Mail, Save, Loader2, FolderOpen, Music, Award, Briefcase, Share2, BarChart3, Lock, Eye, EyeOff } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type Admin = Database['public']['Tables']['admin']['Row']

interface Stats {
  categories: number
  audio: number
  certifications: number
  works: number
  socials: number
}

export default function ProfilePage() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<Stats>({
    categories: 0,
    audio: 0,
    certifications: 0,
    works: 0,
    socials: 0,
  })
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })
  const supabase = createClient()

  useEffect(() => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setLoading(false)
      return
    }
    loadProfile()
    loadStats()
  }, [])

  const loadProfile = async () => {
    try {
      // In a real app, you'd get the admin ID from the session
      // For now, we'll fetch the first admin (you should replace this with actual auth)
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .limit(1)
        .single()

      if (error) throw error

      if (data) {
        setAdmin(data)
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const [categoriesRes, audioRes, certsRes, worksRes, socialsRes] = await Promise.all([
        supabase.from('category').select('*', { count: 'exact', head: true }),
        supabase.from('audio').select('*', { count: 'exact', head: true }),
        supabase.from('certification').select('*', { count: 'exact', head: true }),
        supabase.from('work').select('*', { count: 'exact', head: true }),
        supabase.from('reseaux_sociaux').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        categories: categoriesRes.count || 0,
        audio: audioRes.count || 0,
        certifications: certsRes.count || 0,
        works: worksRes.count || 0,
        socials: socialsRes.count || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('admin')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        })
        .eq('id', admin.id)

      if (error) throw error

      await loadProfile()
      alert('Profile updated successfully!')
    } catch (error: any) {
      logError('ProfilePage.handleSubmit', error)
      alert(sanitizeError(error))
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admin) return

    setChangingPassword(true)
    try {
      const response = await fetch('/api/auth/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      // Reset form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setShowPasswordForm(false)
      alert('Password changed successfully!')
    } catch (error: any) {
      logError('ProfilePage.handlePasswordChange', error)
      alert(sanitizeError(error))
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="modern-card dark:modern-card-dark rounded-2xl p-8 shadow-xl border-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl group-hover:scale-105 transition-transform duration-300">
                {admin?.first_name?.[0]}{admin?.last_name?.[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 shadow-lg"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {admin?.first_name} {admin?.last_name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Mail size={18} className="text-blue-500" />
                {admin?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats - Tableau de Bord */}
      <div className="modern-card dark:modern-card-dark rounded-2xl p-6 shadow-xl border-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <BarChart3 size={22} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Tableau de Bord
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500 text-white">
                <FolderOpen size={18} />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Categories</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.categories}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-purple-50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-800/10 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500 text-white">
                <Music size={18} />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Audio Files</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.audio}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-yellow-50 to-orange-100/50 dark:from-yellow-900/20 dark:to-orange-800/10 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500 text-white">
                <Award size={18} />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Certifications</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.certifications}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-800/10 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500 text-white">
                <Briefcase size={18} />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Works</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.works}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-cyan-50 to-blue-100/50 dark:from-cyan-900/20 dark:to-blue-800/10 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500 text-white">
                <Share2 size={18} />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Social Networks</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.socials}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="modern-card dark:modern-card-dark rounded-2xl p-8 shadow-xl border-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <User size={22} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Edit Profile
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="group w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={20} className="group-hover:scale-110 transition-transform" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="modern-card dark:modern-card-dark rounded-2xl p-8 shadow-xl border-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
              <Lock size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Change Password
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Update your account password
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowPasswordForm(!showPasswordForm)
              if (showPasswordForm) {
                setPasswordData({
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                })
              }
            }}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 text-sm font-medium"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-6 animate-slide-down">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-red-500 transition-colors" size={20} />
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-300 group-hover:border-red-300 dark:group-hover:border-red-600"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-red-500 transition-colors" size={20} />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-300 group-hover:border-red-300 dark:group-hover:border-red-600"
                    placeholder="Enter new password (min. 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-red-500 transition-colors" size={20} />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-400 transition-all duration-300 group-hover:border-red-300 dark:group-hover:border-red-600"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Password Requirements:</strong> At least 6 characters long. Make sure your new password is different from your current password.
              </p>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="group w-full md:w-auto px-8 py-4 bg-gradient-to-r from-red-500 via-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-red-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock size={20} className="group-hover:scale-110 transition-transform" />
                  Change Password
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
