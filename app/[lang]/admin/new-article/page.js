'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SimpleImageUploader from '@/components/ImageUploader'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function NewArticle({ params: { lang } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    title_bn: '',
    excerpt: '',
    excerpt_bn: '',
    content: '',
    content_bn: '',
    category: '',
    author: '',
    featured_image: '',
    status: 'published'
  })
  
  const categories = ['Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Health', 'International']
  
  const handleImageUpload = (imageData) => {
    if (imageData) {
      setFormData({...formData, featured_image: imageData.url})
      setSuccess('Image uploaded successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setFormData({...formData, featured_image: ''})
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    // Validate required fields
    if (!formData.title || !formData.content || !formData.category || !formData.author) {
      setError('Please fill in all required fields (Title, Content, Category, Author)')
      setLoading(false)
      return
    }
    
    // Generate slug from title
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    try {
      const articleData = {
        title: formData.title,
        title_bn: formData.title_bn || null,
        slug: slug,
        excerpt: formData.excerpt || null,
        excerpt_bn: formData.excerpt_bn || null,
        content: formData.content,
        content_bn: formData.content_bn || null,
        category: formData.category,
        author: formData.author,
        featured_image: formData.featured_image || null,
        status: formData.status,
        published_at: new Date().toISOString(),
        views: 0,
        is_featured: false
      }
      
      console.log('Submitting article:', articleData)
      
      const { data, error: insertError } = await supabase
        .from('articles')
        .insert([articleData])
        .select()
      
      if (insertError) {
        console.error('Insert error:', insertError)
        setError(`Database error: ${insertError.message}`)
        setLoading(false)
        return
      }
      
      console.log('Article created:', data)
      setSuccess('Article created successfully! Redirecting...')
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/${lang}/admin`)
      }, 2000)
      
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(`Unexpected error: ${err.message}`)
      setLoading(false)
    }
  }
  
  if (loading) return <LoadingSpinner />
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        {lang === 'bn' ? 'নতুন আর্টিকেল' : 'Create New Article'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong> {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Title (English) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500"
            placeholder="Enter article title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Title (Bangla)</label>
          <input
            type="text"
            value={formData.title_bn}
            onChange={(e) => setFormData({...formData, title_bn: e.target.value})}
            className="w-full px-3 py-2 border rounded-md font-bangla"
            placeholder="বাংলা শিরোনাম"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Excerpt (English)</label>
          <textarea
            rows="2"
            value={formData.excerpt}
            onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Short summary"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Excerpt (Bangla)</label>
          <textarea
            rows="2"
            value={formData.excerpt_bn}
            onChange={(e) => setFormData({...formData, excerpt_bn: e.target.value})}
            className="w-full px-3 py-2 border rounded-md font-bangla"
            placeholder="বাংলা সারাংশ"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Content (English) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="8"
            required
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Full article content (HTML supported)"
          />
          <p className="text-xs text-gray-500 mt-1">You can use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, etc.</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Content (Bangla)</label>
          <textarea
            rows="8"
            value={formData.content_bn}
            onChange={(e) => setFormData({...formData, content_bn: e.target.value})}
            className="w-full px-3 py-2 border rounded-md font-bangla"
            placeholder="বাংলা কন্টেন্ট"
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Author name"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Featured Image</label>
          <SimpleImageUploader
            onUploadComplete={handleImageUpload}
            userId="temp-user"
          />
          {formData.featured_image && (
            <p className="text-xs text-green-600 mt-2">
              ✓ Image uploaded successfully!
            </p>
          )}
        </div>
        
        <div className="flex gap-4">
          <button 
            type="submit" 
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : (lang === 'bn' ? 'প্রকাশ করুন' : 'Publish Article')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  )
}