'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sanitizeError, logError } from '@/lib/utils/error-handler'
import { Plus, Trash2, Edit2, Loader2, Share2, Link as LinkIcon } from 'lucide-react'
import type { Database } from '@/lib/supabase/types'

type ReseauxSociaux = Database['public']['Tables']['reseaux_sociaux']['Row']

export default function ReseauxSociauxPage() {
  const [socials, setSocials] = useState<ReseauxSociaux[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadSocials()
  }, [])

  const loadSocials = async () => {
    try {
      const { data, error } = await supabase
        .from('reseaux_sociaux')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSocials(data || [])
    } catch (error) {
      logError('ReseauxSociauxPage.loadSocials', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const dataToSubmit = {
        name: formData.name,
        url: formData.url,
        icon: formData.icon || null,
      }

      if (editingId) {
        const { error } = await supabase
          .from('reseaux_sociaux')
          .update(dataToSubmit)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('reseaux_sociaux')
          .insert([dataToSubmit])

        if (error) throw error
      }

      resetForm()
      await loadSocials()
    } catch (error: any) {
      logError('ReseauxSociauxPage.handleSubmit', error)
      alert(sanitizeError(error))
    }
  }

  const handleEdit = (social: ReseauxSociaux) => {
    setFormData({
      name: social.name,
      url: social.url,
      icon: social.icon || '',
    })
    setEditingId(social.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social network?')) return

    try {
      const { error } = await supabase
        .from('reseaux_sociaux')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadSocials()
    } catch (error: any) {
      logError('ReseauxSociauxPage.handleDelete', error)
      alert(sanitizeError(error))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      icon: '',
    })
    setShowAddForm(false)
    setEditingId(null)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
              <Share2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Social Networks
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Manage your social media links
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
          className="group px-6 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Add Social Network
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="modern-card dark:modern-card-dark rounded-2xl shadow-xl p-6 border-0 animate-slide-down">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
            {editingId ? 'Edit Social Network' : 'Add New Social Network'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Platform Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all duration-300 group-hover:border-cyan-300 dark:group-hover:border-cyan-600"
                placeholder="e.g., Facebook, Twitter, LinkedIn"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <LinkIcon size={16} />
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all duration-300 group-hover:border-cyan-300 dark:group-hover:border-cyan-600"
                placeholder="https://..."
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Icon Name (Optional)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all duration-300 group-hover:border-cyan-300 dark:group-hover:border-cyan-600"
                placeholder="e.g., facebook, twitter, linkedin"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105 transition-all duration-300"
              >
                {editingId ? 'Update' : 'Create'} Social Network
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Social Networks List */}
      <div className="modern-card dark:modern-card-dark rounded-2xl shadow-xl border-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              All Social Networks
            </h2>
            <span className="px-3 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-semibold">
              {socials.length}
            </span>
          </div>

          {socials.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Share2 size={40} className="opacity-50" />
              </div>
              <p className="text-lg font-medium">No social networks yet</p>
              <p className="text-sm mt-1">Add your first social network link</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socials.map((social, index) => (
                <div
                  key={social.id}
                  className="group p-5 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                        <Share2 size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {social.name}
                        </h3>
                        {social.icon && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Icon: {social.icon}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(social)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(social.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                  >
                    <LinkIcon size={14} />
                    <span className="truncate">{social.url}</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
