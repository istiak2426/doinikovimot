'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function EditArticle({ params: { lang } }) {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    title_bn: '',
    excerpt: '',
    excerpt_bn: '',
    content: '',
    content_bn: '',
    category: '',
    author: '',
    status: 'published'
  })
  
  useEffect(() => {
    if (id) fetchArticle()
  }, [id])
  
  async function fetchArticle() {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) setFormData(data)
    setLoading(false)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    const { error } = await supabase
      .from('articles')
      .update(formData)
      .eq('id', id)
    
    if (error) {
      alert('Failed to update article')
    } else {
      router.push(`/${lang}/admin`)
    }
    
    setSaving(false)
  }
  
  if (loading) return <LoadingSpinner />
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        {lang === 'bn' ? 'আর্টিকেল সম্পাদনা' : 'Edit Article'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title (English)</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Title (Bangla)</label>
          <input
            type="text"
            value={formData.title_bn}
            onChange={(e) => setFormData({...formData, title_bn: e.target.value})}
            className="w-full px-3 py-2 border rounded-md font-bangla"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Content (English)</label>
          <textarea
            rows="10"
            required
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Content (Bangla)</label>
          <textarea
            rows="10"
            value={formData.content_bn}
            onChange={(e) => setFormData({...formData, content_bn: e.target.value})}
            className="w-full px-3 py-2 border rounded-md font-bangla"
          />
        </div>
        
        <div className="flex gap-4">
          <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700" disabled={saving}>
            {saving ? 'Saving...' : (lang === 'bn' ? 'সেভ করুন' : 'Save')}
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  )
}