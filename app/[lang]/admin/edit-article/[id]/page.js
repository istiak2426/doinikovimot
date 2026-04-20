'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import Image from 'next/image'

export default function EditArticle({ params: { lang } }) {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    title_bn: '',
    excerpt: '',
    excerpt_bn: '',
    content: '',
    content_bn: '',
    category: '',
    author: '',
    status: 'published',
    featured_image: ''
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
    
    if (data) {
      setFormData(data)
      if (data.featured_image) setImagePreview(data.featured_image)
    }
    setLoading(false)
  }
  
  // Upload image to Supabase Storage
  async function uploadImage(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `articles/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('article-images') // Make sure this bucket exists
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(filePath)
    
    return publicUrl
  }
  
  // Delete old image from storage
  async function deleteOldImage(imageUrl) {
    if (!imageUrl) return
    // Extract path from URL (assuming bucket is 'article-images')
    const urlParts = imageUrl.split('/')
    const filePath = urlParts.slice(urlParts.indexOf('article-images') + 1).join('/')
    if (filePath) {
      await supabase.storage
        .from('article-images')
        .remove([filePath])
    }
  }
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type and size (optional)
    if (!file.type.startsWith('image/')) {
      alert(lang === 'bn' ? 'শুধু ছবি ফাইল অনুমোদিত' : 'Only image files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'bn' ? 'ছবির সাইজ ৫MB এর কম হতে হবে' : 'Image size must be less than 5MB')
      return
    }
    
    setUploadingImage(true)
    try {
      // If there's an existing image, delete it from storage
      if (formData.featured_image) {
        await deleteOldImage(formData.featured_image)
      }
      
      const publicUrl = await uploadImage(file)
      setFormData({ ...formData, featured_image: publicUrl })
      setImagePreview(publicUrl)
      setImageFile(null)
    } catch (error) {
      console.error('Upload error:', error)
      alert(lang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }
  
  const handleRemoveImage = async () => {
    if (formData.featured_image) {
      await deleteOldImage(formData.featured_image)
    }
    setFormData({ ...formData, featured_image: '' })
    setImagePreview(null)
    setImageFile(null)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    // If there's still a pending file (not uploaded), upload it now
    if (imageFile) {
      setUploadingImage(true)
      try {
        const publicUrl = await uploadImage(imageFile)
        formData.featured_image = publicUrl
        setImagePreview(publicUrl)
      } catch (error) {
        alert(lang === 'bn' ? 'ছবি আপলোড করতে ব্যর্থ হয়েছে' : 'Failed to upload image')
        setSaving(false)
        setUploadingImage(false)
        return
      } finally {
        setUploadingImage(false)
      }
    }
    
    const { error } = await supabase
      .from('articles')
      .update(formData)
      .eq('id', id)
    
    if (error) {
      console.error(error)
      alert(lang === 'bn' ? 'আপডেট ব্যর্থ হয়েছে' : 'Failed to update article')
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
        {/* Featured Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {lang === 'bn' ? 'ফিচার্ড ইমেজ' : 'Featured Image'}
          </label>
          {imagePreview && (
            <div className="relative w-48 h-32 mb-3 rounded overflow-hidden bg-gray-100">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="text-sm"
            />
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-600 text-sm hover:underline"
                disabled={uploadingImage}
              >
                {lang === 'bn' ? 'ইমেজ সরান' : 'Remove image'}
              </button>
            )}
          </div>
          {uploadingImage && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
        </div>
        
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
          <label className="block text-sm font-medium mb-2">Excerpt (English)</label>
          <textarea
            rows="3"
            value={formData.excerpt}
            onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Excerpt (Bangla)</label>
          <textarea
            rows="3"
            value={formData.excerpt_bn}
            onChange={(e) => setFormData({...formData, excerpt_bn: e.target.value})}
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
        
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">Select category</option>
            <option value="Politics">Politics</option>
            <option value="Business">Business</option>
            <option value="Sports">Sports</option>
            <option value="Entertainment">Entertainment</option>
            <option value="International">International</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Author</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        
        <div className="flex gap-4">
          <button 
            type="submit" 
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700" 
            disabled={saving || uploadingImage}
          >
            {saving ? 'Saving...' : (lang === 'bn' ? 'সেভ করুন' : 'Save')}
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
