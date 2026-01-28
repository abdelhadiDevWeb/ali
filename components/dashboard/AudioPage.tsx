'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit2, Loader2, Music, FileAudio, Upload, X } from 'lucide-react'
import { sanitizeError, logError } from '@/lib/utils/error-handler'
import type { Database } from '@/lib/supabase/types'

type Audio = Database['public']['Tables']['audio']['Row']
type Category = Database['public']['Tables']['category']['Row']

export default function AudioPage() {
  const [audios, setAudios] = useState<Audio[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    audio_file: '',
    category_id: '',
  })
  const [uploading, setUploading] = useState({
    audio: false,
  })
  const [uploadProgress, setUploadProgress] = useState({
    audio: 0,
  })
  const [selectedFiles, setSelectedFiles] = useState({
    audio: null as File | null,
  })
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [audiosRes, categoriesRes] = await Promise.all([
        supabase.from('audio').select('*').order('created_at', { ascending: false }),
        supabase.from('category').select('*').order('name'),
      ])

      if (audiosRes.error) throw audiosRes.error
      if (categoriesRes.error) throw categoriesRes.error

      setAudios(audiosRes.data || [])
      setCategories(categoriesRes.data || [])
    } catch (error) {
      logError('AudioPage.loadData', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const dataToSubmit = {
        title: formData.title,
        description: formData.description || null,
        audio_file: formData.audio_file || null,
        category_id: formData.category_id || null,
      }

      if (editingId) {
        const { error } = await supabase
          .from('audio')
          .update(dataToSubmit)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('audio')
          .insert([dataToSubmit])

        if (error) throw error
      }

      resetForm()
      await loadData()
    } catch (error: any) {
      logError('AudioPage.handleSubmit', error)
      alert(sanitizeError(error))
    }
  }

  const handleEdit = (audio: Audio) => {
    setFormData({
      title: audio.title,
      description: audio.description || '',
      audio_file: audio.audio_file || '',
      category_id: audio.category_id || '',
    })
    setEditingId(audio.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audio?')) return

    try {
      const { error } = await supabase
        .from('audio')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (error: any) {
      logError('AudioPage.handleDelete', error)
      alert(sanitizeError(error))
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      audio_file: '',
      category_id: '',
    })
    setSelectedFiles({
      audio: null,
    })
    setUploadProgress({
      audio: 0,
    })
    setShowAddForm(false)
    setEditingId(null)
  }

  const uploadFile = async (
    file: File,
    type: 'audio'
  ): Promise<string | null> => {
    try {
      setUploading((prev) => ({ ...prev, [type]: true }))
      setUploadProgress((prev) => ({ ...prev, [type]: 0 }))

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      // Upload to audio folder in media bucket
      const folder = 'audio'
      const filePath = `${folder}/${fileName}`

      // Upload file to Supabase Storage in media bucket
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      setUploadProgress((prev) => ({ ...prev, [type]: 100 }))
      setUploading((prev) => ({ ...prev, [type]: false }))

      return urlData.publicUrl
    } catch (error: any) {
      logError(`AudioPage.uploadFile.${type}`, error)
      alert(`Unable to upload file. ${sanitizeError(error)}`)
      setUploading((prev) => ({ ...prev, [type]: false }))
      return null
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type - only audio files
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/m4a']
    if (!audioTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      alert('Please select a valid audio file (MP3, WAV, OGG, M4A)')
      return
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB')
      return
    }

    setSelectedFiles((prev) => ({ ...prev, audio: file }))
  }

  const handleFileUpload = async () => {
    const file = selectedFiles.audio
    if (!file) return

    const url = await uploadFile(file, 'audio')
    if (url) {
      setFormData((prev) => ({ ...prev, audio_file: url }))
      setSelectedFiles((prev) => ({ ...prev, audio: null }))
    }
  }

  const removeFile = () => {
    setSelectedFiles((prev) => ({ ...prev, audio: null }))
    setFormData((prev) => ({ ...prev, audio_file: '' }))
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Music size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Audio Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Manage your audio content
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
          className="group px-6 py-3.5 bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Add Audio
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="modern-card dark:modern-card-dark rounded-2xl shadow-xl p-6 border-0 animate-slide-down">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
            {editingId ? 'Edit Audio' : 'Add New Audio'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
              />
            </div>

            {/* Audio File Upload */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <FileAudio size={16} />
                Audio File
              </label>
              <div className="space-y-3">
                {formData.audio_file ? (
                  <div className="p-4 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileAudio className="text-green-600 dark:text-green-400" size={20} />
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Audio uploaded</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.ogg,.m4a"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="audio-upload"
                      />
                      <label
                        htmlFor="audio-upload"
                        className={`
                          w-full px-5 py-4 rounded-xl border-2 border-dashed 
                          flex items-center justify-center gap-3 cursor-pointer
                          transition-all duration-200
                          ${selectedFiles.audio
                            ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-slate-300 dark:border-slate-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                          }
                        `}
                      >
                        <Upload size={20} className="text-slate-500" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {selectedFiles.audio ? 'Audio file selected' : 'Select Audio File'}
                        </span>
                      </label>
                    </div>
                    {selectedFiles.audio && (
                      <button
                        type="button"
                        onClick={handleFileUpload}
                        disabled={uploading.audio}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {uploading.audio ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Uploading... {uploadProgress.audio}%
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            Upload Audio File
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>


            {/* Category Selection */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 group-hover:border-blue-300 dark:group-hover:border-blue-600"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              >
                {editingId ? 'Update' : 'Create'} Audio
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Audios List */}
      <div className="modern-card dark:modern-card-dark rounded-2xl shadow-xl border-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              All Audio Files
            </h2>
            <span className="px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold">
              {audios.length}
            </span>
          </div>

          {audios.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Music size={40} className="opacity-50" />
              </div>
              <p className="text-lg font-medium">No audio files yet</p>
              <p className="text-sm mt-1">Add your first audio file to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {audios.map((audio, index) => {
                const category = categories.find((c) => c.id === audio.category_id)
                return (
                  <div
                    key={audio.id}
                    className="p-6 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {audio.title}
                              </h3>
                              {category && (
                                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                                  {category.name}
                                </span>
                              )}
                            </div>
                            {audio.description && (
                              <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                                {audio.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleEdit(audio)}
                              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(audio.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Audio Player */}
                        {audio.audio_file && (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-purple-500 text-white">
                                <FileAudio size={18} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Audio Player</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Click play to listen</p>
                              </div>
                              <a
                                href={audio.audio_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                              >
                                Open in new tab
                              </a>
                            </div>
                            <audio
                              controls
                              className="w-full h-14 rounded-lg bg-white/50 dark:bg-slate-800/50"
                              preload="metadata"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                console.error('Audio playback error:', e)
                                const target = e.target as HTMLAudioElement
                                if (target.error) {
                                  console.error('Error code:', target.error.code, 'Message:', target.error.message)
                                }
                              }}
                              onLoadedMetadata={() => {
                                console.log('Audio metadata loaded successfully')
                              }}
                            >
                              <source src={audio.audio_file} type="audio/mpeg" />
                              <source src={audio.audio_file} type="audio/mp3" />
                              <source src={audio.audio_file} type="audio/wav" />
                              <source src={audio.audio_file} type="audio/ogg" />
                              <source src={audio.audio_file} type="audio/m4a" />
                              <source src={audio.audio_file} type="audio/*" />
                              Your browser does not support the audio element.
                              <p className="text-xs text-red-500 mt-2">
                                If audio doesn't play, check the browser console for errors.
                              </p>
                            </audio>
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                              <a
                                href={audio.audio_file}
                                download
                                className="text-purple-600 dark:text-purple-400 hover:underline"
                              >
                                Download audio file
                              </a>
                            </div>
                          </div>
                        )}

                        {/* File Info */}
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                          {audio.audio_file && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                              <FileAudio size={12} />
                              Audio Available
                            </span>
                          )}
                          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            Created {new Date(audio.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
