'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Loader2, Award, FileText, Upload, X } from 'lucide-react'
import { sanitizeError, logError } from '@/lib/utils/error-handler'
import type { Database } from '@/lib/supabase/types'

type Certification = Database['public']['Tables']['certification']['Row']

export default function CertificationPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '', // This field stores the PDF URL
    date: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadCertifications()
  }, [])

  const loadCertifications = async () => {
    try {
      const { data, error } = await supabase
        .from('certification')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setCertifications(data || [])
    } catch (error) {
      logError('CertificationPage.loadCertifications', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate PDF
    if (file.type !== 'application/pdf' && !file.name.match(/\.pdf$/i)) {
      alert('Please upload a PDF file only')
      return
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB')
      return
    }

    setSelectedFile(file)
  }

  const handlePdfUpload = async () => {
    const file = selectedFile
    if (!file) return

    setUploading(true)
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `pdf/${fileName}`

      // Upload file to Supabase Storage in media bucket
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, image: urlData.publicUrl }))
      setSelectedFile(null)
    } catch (error: any) {
      logError('CertificationPage.handleUpload', error)
      alert(`Unable to upload PDF. ${sanitizeError(error)}`)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFormData((prev) => ({ ...prev, image: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const dataToSubmit = {
        title: formData.title,
        description: formData.description || null,
        image: formData.image || null,
        date: formData.date,
      }

      if (editingId) {
        const { error } = await supabase
          .from('certification')
          .update(dataToSubmit)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('certification')
          .insert([dataToSubmit])

        if (error) throw error
      }

      resetForm()
      await loadCertifications()
    } catch (error: any) {
      logError('CertificationPage.handleSubmit', error)
      alert(sanitizeError(error))
    }
  }

  const handleEdit = (cert: Certification) => {
    setFormData({
      title: cert.title,
      description: cert.description || '',
      image: cert.image || '', // PDF URL stored in image field
      date: cert.date,
    })
    setEditingId(cert.id)
    setShowAddForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      date: '',
    })
    setSelectedFile(null)
    setShowAddForm(false)
    setEditingId(null)
    if (pdfInputRef.current) {
      pdfInputRef.current.value = ''
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
              <Award size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Certifications
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Manage achievements
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
          className="group px-6 py-3.5 bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Add Certification
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="modern-card dark:modern-card-dark rounded-2xl shadow-xl p-6 border-0 animate-slide-down">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
            {editingId ? 'Edit Certification' : 'Add New Certification'}
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

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                required
              />
            </div>

            {/* PDF Upload */}
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <FileText size={16} />
                PDF File *
              </label>
              <div className="space-y-3">
                {formData.image ? (
                  <div className="p-4 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-green-600 dark:text-green-400" size={20} />
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">PDF uploaded</p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          File ready
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={formData.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View PDF"
                      >
                        <FileText size={18} />
                      </a>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        ref={pdfInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handlePdfSelect}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className={`
                          w-full px-5 py-4 rounded-xl border-2 border-dashed 
                          flex items-center justify-center gap-3 cursor-pointer
                          transition-all duration-200
                          ${selectedFile
                            ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-slate-300 dark:border-slate-600 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          }
                        `}
                      >
                        <Upload size={20} className="text-slate-500" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {selectedFile ? 'PDF file selected' : 'Select PDF File'}
                        </span>
                      </label>
                    </div>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handlePdfUpload}
                        disabled={uploading}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            Upload PDF
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              >
                {editingId ? 'Update' : 'Create'} Certification
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

      {/* Certifications List */}
      <div className="modern-card dark:modern-card-dark rounded-2xl shadow-xl border-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              All Certifications
            </h2>
            <span className="px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-semibold">
              {certifications.length}
            </span>
          </div>

          {certifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Award size={40} className="opacity-50" />
              </div>
              <p className="text-lg font-medium">No certifications yet</p>
              <p className="text-sm mt-1">Add your first certification to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <div
                  key={cert.id}
                  className="p-6 rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm hover:border-yellow-300 dark:hover:border-yellow-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                      onClick={() => handleEdit(cert)}
                      className="p-2 m-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-110"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                      <Award className="text-white" size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex-1">
                      {cert.title}
                    </h3>
                  </div>

                  {cert.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {cert.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">
                      {new Date(cert.date).toLocaleDateString()}
                    </span>
                    {cert.image && (
                      <a
                        href={cert.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 font-medium"
                        title="View PDF"
                      >
                        <FileText size={12} />
                        View PDF
                      </a>
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
