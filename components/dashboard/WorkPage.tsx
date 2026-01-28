'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sanitizeError, logError } from '@/lib/utils/error-handler'
import { Plus, Trash2, Edit2, Loader2, Briefcase, Video, Upload, X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Database } from '@/lib/supabase/types'

type Work = Database['public']['Tables']['work']['Row']

export default function WorkPage() {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video: '',
  })
  const [uploading, setUploading] = useState({
    video: false,
  })
  const [uploadProgress, setUploadProgress] = useState({
    video: 0,
  })
  const [selectedFiles, setSelectedFiles] = useState({
    video: null as File | null,
  })
  const supabase = createClient()

  useEffect(() => {
    loadWorks()
  }, [])

  const loadWorks = async () => {
    try {
      const { data, error } = await supabase
        .from('work')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorks(data || [])
    } catch (error) {
      logError('WorkPage.loadWorks', error)
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
        video: formData.video || null,
      }

      if (editingId) {
        const { error } = await supabase
          .from('work')
          .update(dataToSubmit)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('work')
          .insert([dataToSubmit])

        if (error) throw error
      }

      resetForm()
      await loadWorks()
    } catch (error: any) {
      logError('WorkPage.handleSubmit', error)
      alert(sanitizeError(error))
    }
  }

  const handleEdit = (work: Work) => {
    setFormData({
      title: work.title,
      description: work.description || '',
      video: work.video || '',
    })
    setEditingId(work.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work?')) return

    try {
      const { error } = await supabase
        .from('work')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadWorks()
    } catch (error: any) {
      logError('WorkPage.handleDelete', error)
      alert(sanitizeError(error))
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video: '',
    })
    setSelectedFiles({
      video: null,
    })
    setUploadProgress({
      video: 0,
    })
    setShowAddForm(false)
    setEditingId(null)
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploading((prev) => ({ ...prev, video: true }))
      setUploadProgress({ video: 10 })

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `vd/${fileName}`

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => ({
          video: Math.min(prev.video + 10, 90),
        }))
      }, 200)

      // Upload file to Supabase Storage in media bucket
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      clearInterval(progressInterval)

      if (uploadError) {
        throw uploadError
      }

      // Complete progress
      setUploadProgress({ video: 100 })

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      // Small delay to show 100%
      await new Promise((resolve) => setTimeout(resolve, 300))

      setUploading((prev) => ({ ...prev, video: false }))
      setUploadProgress({ video: 0 })
      return urlData.publicUrl
    } catch (error: any) {
      logError('WorkPage.uploadFile', error)
      alert(`Unable to upload video. ${sanitizeError(error)}`)
      setUploading((prev) => ({ ...prev, video: false }))
      setUploadProgress({ video: 0 })
      return null
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type - only video
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!videoTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|ogg|mov)$/i)) {
      alert('Please select a valid video file (MP4, WEBM, OGG, MOV)')
      return
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB')
      return
    }

    setSelectedFiles((prev) => ({ ...prev, video: file }))
  }

  const handleFileUpload = async () => {
    const file = selectedFiles.video
    if (!file) return

    const url = await uploadFile(file)
    if (url) {
      setFormData((prev) => ({ ...prev, video: url }))
      setSelectedFiles((prev) => ({ ...prev, video: null }))
      setUploadProgress({ video: 0 })
    }
  }

  const removeFile = () => {
    setSelectedFiles((prev) => ({ ...prev, video: null }))
    setFormData((prev) => ({ ...prev, video: '' }))
    setUploadProgress({ video: 0 })
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <Briefcase size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Portfolio Works
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Manage your portfolio projects
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
          className="group px-6 py-3.5 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Add Work
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="modern-card dark:modern-card-dark rounded-2xl shadow-xl p-6 border-0 animate-slide-down">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
            {editingId ? 'Edit Work' : 'Add New Work'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:focus:border-green-400 transition-all duration-300 group-hover:border-green-300 dark:group-hover:border-green-600"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:focus:border-green-400 transition-all duration-300 group-hover:border-green-300 dark:group-hover:border-green-600"
              />
            </div>

            {/* Video Upload */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Video size={16} />
                Video
              </label>
              <div className="space-y-3">
                {formData.video ? (
                  <div className="p-4 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Video className="text-green-600 dark:text-green-400" size={20} />
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Video uploaded</p>
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
                        accept="video/*,.mp4,.webm,.ogg,.mov"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="work-video-upload"
                      />
                      <label
                        htmlFor="work-video-upload"
                        className={`
                          w-full px-5 py-4 rounded-xl border-2 border-dashed 
                          flex items-center justify-center gap-3 cursor-pointer
                          transition-all duration-200
                          ${selectedFiles.video
                            ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                            : 'border-slate-300 dark:border-slate-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }
                        `}
                      >
                        <Upload size={20} className="text-slate-500" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {selectedFiles.video ? 'Video file selected' : 'Select Video File'}
                        </span>
                      </label>
                    </div>
                    {selectedFiles.video && (
                      <div className="space-y-3">
                        {/* Show video preview only when NOT uploading */}
                        {!uploading.video && (
                          <video
                            src={URL.createObjectURL(selectedFiles.video)}
                            controls
                            className="w-full h-48 object-cover rounded-xl"
                          />
                        )}
                        
                        {/* Uploading Progress Indicator */}
                        {uploading.video ? (
                          <div className="p-6 rounded-xl border-2 border-green-400/50 bg-green-50/50 dark:bg-green-900/20 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Loader2 className="animate-spin text-green-600 dark:text-green-400" size={24} />
                                <span className="text-base font-semibold text-green-700 dark:text-green-300">
                                  Uploading Video...
                                </span>
                              </div>
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {uploadProgress.video}%
                              </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
                              <motion.div
                                className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-full relative overflow-hidden"
                                initial={{ width: '0%' }}
                                animate={{ width: `${uploadProgress.video}%` }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                              >
                                {/* Shimmer effect */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                  animate={{
                                    x: ['-100%', '100%'],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'linear',
                                  }}
                                />
                              </motion.div>
                            </div>
                            
                            <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                              Please wait while your video is being uploaded...
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleFileUpload}
                            disabled={uploading.video}
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Upload size={18} />
                            Upload Video
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 transition-all duration-300"
              >
                {editingId ? 'Update' : 'Create'} Work
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

      {/* Works List */}
      <div className="modern-card dark:modern-card-dark rounded-2xl shadow-xl border-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              All Works
            </h2>
            <span className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold">
              {works.length}
            </span>
          </div>

          {works.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Briefcase size={40} className="opacity-50" />
              </div>
              <p className="text-lg font-medium">No works yet</p>
              <p className="text-sm mt-1">Add your first portfolio work to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {works.map((work, index) => (
                <div
                  key={work.id}
                  className="group p-6 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-fade-in relative overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                        <Briefcase size={18} className="text-white" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        {work.title}
                      </h3>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(work)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(work.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {work.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                      {work.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs">
                    {work.video && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        <Video size={12} />
                        Video
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
