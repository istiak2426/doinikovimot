'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

// ========== Helper Functions ==========

// Convert image file to WebP blob
async function convertToWebP(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('WebP conversion failed'))
        }, 'image/webp', 0.8)
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

// Upload image (original + WebP), return WebP URL
async function uploadImage(file) {
  const timestamp = Date.now()
  const baseName = file.name.split('.')[0].replace(/[^a-z0-9]/gi, '-')
  
  // Upload original
  const originalExt = file.name.split('.').pop()
  const originalPath = `temp-user/original/${timestamp}-${baseName}.${originalExt}`
  const { error: originalError } = await supabase.storage
    .from('article-images')
    .upload(originalPath, file, { cacheControl: '3600', contentType: file.type })
  if (originalError) throw originalError

  // Upload WebP
  const webpBlob = await convertToWebP(file)
  const webpPath = `temp-user/webp/${timestamp}-${baseName}.webp`
  const { error: webpError } = await supabase.storage
    .from('article-images')
    .upload(webpPath, webpBlob, { cacheControl: '3600', contentType: 'image/webp' })
  if (webpError) throw webpError

  // Return WebP public URL
  const { data: { publicUrl } } = supabase.storage
    .from('article-images')
    .getPublicUrl(webpPath)
  return publicUrl
}

// Upload video (original only, no conversion) - with size limit
async function uploadVideo(file) {
  const MAX_VIDEO_SIZE_MB = 50
  const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error(`Video file too large. Max size is ${MAX_VIDEO_SIZE_MB}MB.`)
  }

  const timestamp = Date.now()
  const baseName = file.name.split('.')[0].replace(/[^a-z0-9]/gi, '-')
  const ext = file.name.split('.').pop()
  const fileName = `${timestamp}-${baseName}.${ext}`
  const filePath = `temp-user/videos/${fileName}`

  const { error } = await supabase.storage
    .from('article-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      contentType: file.type,
    })
  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('article-images')
    .getPublicUrl(filePath)
  return publicUrl
}

// External video embed helpers
function youtubeUrlToEmbed(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) {
    return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${match[2]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="my-4"></iframe>`
  }
  return null
}

function vimeoUrlToEmbed(url) {
  const regExp = /vimeo\.com\/(\d+)/
  const match = url.match(regExp)
  if (match && match[1]) {
    return `<iframe src="https://player.vimeo.com/video/${match[1]}" width="560" height="315" frameborder="0" allowfullscreen class="my-4"></iframe>`
  }
  return null
}

async function facebookUrlToEmbed(url) {
  try {
    // Facebook embed (works for public videos)
    return `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560" width="560" height="315" frameborder="0" allowfullscreen class="my-4"></iframe>`
  } catch (error) {
    console.error('Facebook embed error:', error)
    return null
  }
}

async function tiktokUrlToEmbed(url) {
  try {
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)
    const data = await response.json()
    return data.html || null
  } catch (error) {
    console.error('TikTok embed error:', error)
    return null
  }
}

// ========== Main Component ==========

export default function NewArticle({ params: { lang } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  
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
  
  const contentTextareaRef = useRef(null)
  const contentBnTextareaRef = useRef(null)
  
  const categories = ['Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Health', 'International']
  
  // Insert image (file upload)
  const insertImageIntoContent = async (fieldName) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      setUploadingInlineImage(true)
      try {
        const publicUrl = await uploadImage(file)
        const imgTag = `<img src="${publicUrl}" alt="Image" class="my-4 max-w-full h-auto" />`
        
        const textarea = fieldName === 'content' ? contentTextareaRef.current : contentBnTextareaRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const currentContent = formData[fieldName]
          const newContent = currentContent.substring(0, start) + imgTag + currentContent.substring(end)
          setFormData({ ...formData, [fieldName]: newContent })
          setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + imgTag.length, start + imgTag.length)
          }, 10)
        } else {
          setFormData({
            ...formData,
            [fieldName]: formData[fieldName] + '\n\n' + imgTag + '\n\n'
          })
        }
        setSuccess('Image inserted!')
        setTimeout(() => setSuccess(''), 2000)
      } catch (err) {
        setError(`Image upload failed: ${err.message}`)
      } finally {
        setUploadingInlineImage(false)
      }
    }
    input.click()
  }
  
  // Insert video file (upload)
  const insertVideoFile = async (fieldName) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      setUploadingVideo(true)
      try {
        const publicUrl = await uploadVideo(file)
        const videoTag = `<video controls width="100%" class="my-4"><source src="${publicUrl}" type="${file.type}">Your browser does not support the video tag.</video>`
        
        const textarea = fieldName === 'content' ? contentTextareaRef.current : contentBnTextareaRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const currentContent = formData[fieldName]
          const newContent = currentContent.substring(0, start) + videoTag + currentContent.substring(end)
          setFormData({ ...formData, [fieldName]: newContent })
          setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + videoTag.length, start + videoTag.length)
          }, 10)
        } else {
          setFormData({
            ...formData,
            [fieldName]: formData[fieldName] + '\n\n' + videoTag + '\n\n'
          })
        }
        setSuccess('Video uploaded and inserted!')
        setTimeout(() => setSuccess(''), 2000)
      } catch (err) {
        setError(`Video upload failed: ${err.message}`)
      } finally {
        setUploadingVideo(false)
      }
    }
    input.click()
  }
  
  // Insert external video (link)
  const insertExternalVideo = async (fieldName) => {
    const videoUrl = prompt('Enter YouTube URL, Vimeo URL, Facebook Reel URL, TikTok URL, or paste full iframe embed code:')
    if (!videoUrl) return
    
    let embedCode = ''
    
    const youtubeEmbed = youtubeUrlToEmbed(videoUrl)
    if (youtubeEmbed) embedCode = youtubeEmbed
    else if (vimeoUrlToEmbed(videoUrl)) embedCode = vimeoUrlToEmbed(videoUrl)
    else if (videoUrl.includes('facebook.com') || videoUrl.includes('fb.com')) embedCode = await facebookUrlToEmbed(videoUrl)
    else if (videoUrl.includes('tiktok.com')) embedCode = await tiktokUrlToEmbed(videoUrl)
    else if (videoUrl.trim().startsWith('<iframe')) embedCode = videoUrl
    else embedCode = `<video controls width="100%" class="my-4"><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`
    
    if (embedCode) {
      const textarea = fieldName === 'content' ? contentTextareaRef.current : contentBnTextareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const currentContent = formData[fieldName]
        const newContent = currentContent.substring(0, start) + embedCode + currentContent.substring(end)
        setFormData({ ...formData, [fieldName]: newContent })
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start + embedCode.length, start + embedCode.length)
        }, 10)
      } else {
        setFormData({
          ...formData,
          [fieldName]: formData[fieldName] + '\n\n' + embedCode + '\n\n'
        })
      }
      setSuccess('Video embed inserted!')
      setTimeout(() => setSuccess(''), 2000)
    } else {
      setError('Could not generate embed code for the provided URL.')
      setTimeout(() => setError(''), 3000)
    }
  }
  
  // Featured image upload
  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingImage(true)
    try {
      const publicUrl = await uploadImage(file)
      setFormData({ ...formData, featured_image: publicUrl })
      setSuccess('Featured image uploaded!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(`Featured image upload failed: ${err.message}`)
    } finally {
      setUploadingImage(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    if (!formData.title || !formData.content || !formData.category || !formData.author) {
      setError('Please fill in all required fields (Title, Content, Category, Author)')
      setLoading(false)
      return
    }
    
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
      
      const { error: insertError } = await supabase
        .from('articles')
        .insert([articleData])
      
      if (insertError) throw insertError
      
      setSuccess('Article created successfully! Redirecting...')
      setTimeout(() => router.push(`/${lang}/admin`), 2000)
    } catch (err) {
      setError(`Error: ${err.message}`)
      setLoading(false)
    }
  }
  
  if (loading) return <LoadingSpinner />
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        {lang === 'bn' ? 'নতুন আর্টিকেল' : 'Create New Article'}
      </h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"><strong>Error:</strong> {error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"><strong>Success!</strong> {success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Title (English) <span className="text-red-500">*</span></label>
          <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Title (Bangla)</label>
          <input type="text" value={formData.title_bn} onChange={(e) => setFormData({...formData, title_bn: e.target.value})} className="w-full px-3 py-2 border rounded-md font-bangla" />
        </div>
        
        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium mb-2">Excerpt (English)</label>
          <textarea rows="2" value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Excerpt (Bangla)</label>
          <textarea rows="2" value={formData.excerpt_bn} onChange={(e) => setFormData({...formData, excerpt_bn: e.target.value})} className="w-full px-3 py-2 border rounded-md font-bangla" />
        </div>
        
        {/* Content (English) */}
        <div>
          <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
            <label className="block text-sm font-medium">Content (English) <span className="text-red-500">*</span></label>
            <div className="space-x-2">
              <button type="button" onClick={() => insertImageIntoContent('content')} disabled={uploadingInlineImage} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50">
                {uploadingInlineImage ? 'Uploading...' : '📷 Upload Image'}
              </button>
              <button type="button" onClick={() => insertVideoFile('content')} disabled={uploadingVideo} className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700 disabled:opacity-50">
                {uploadingVideo ? 'Uploading...' : '🎬 Upload Video'}
              </button>
              <button type="button" onClick={() => insertExternalVideo('content')} className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700">
                🔗 External Video Link
              </button>
            </div>
          </div>
          <textarea
            ref={contentTextareaRef}
            rows="10"
            required
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full px-3 py-2 border rounded-md font-mono"
            placeholder="Write your article here. Use buttons to insert images or videos at cursor position."
          />
          <p className="text-xs text-gray-500 mt-1">Supports HTML, images, uploaded videos (max 50MB), YouTube, TikTok, Facebook Reels, Vimeo, and iframe embed codes.</p>
        </div>
        
        {/* Content (Bangla) */}
        <div>
          <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
            <label className="block text-sm font-medium">Content (Bangla)</label>
            <div className="space-x-2">
              <button type="button" onClick={() => insertImageIntoContent('content_bn')} disabled={uploadingInlineImage} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50">
                📷 Upload Image
              </button>
              <button type="button" onClick={() => insertVideoFile('content_bn')} disabled={uploadingVideo} className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700 disabled:opacity-50">
                🎬 Upload Video
              </button>
              <button type="button" onClick={() => insertExternalVideo('content_bn')} className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700">
                🔗 External Video Link
              </button>
            </div>
          </div>
          <textarea
            ref={contentBnTextareaRef}
            rows="8"
            value={formData.content_bn}
            onChange={(e) => setFormData({...formData, content_bn: e.target.value})}
            className="w-full px-3 py-2 border rounded-md font-bangla"
            placeholder="বাংলা কন্টেন্ট"
          />
        </div>
        
        {/* Category & Author */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category <span className="text-red-500">*</span></label>
            <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-md">
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Author <span className="text-red-500">*</span></label>
            <input type="text" required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>
        
        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium mb-2">Featured Image (Hero / Card preview)</label>
          <input type="file" accept="image/*" onChange={handleFeaturedImageUpload} disabled={uploadingImage} className="w-full px-3 py-2 border rounded-md" />
          {uploadingImage && <p className="text-xs text-blue-600 mt-1">Uploading featured image...</p>}
          {formData.featured_image && (
            <div className="mt-2">
              <img src={formData.featured_image} alt="Featured preview" className="h-32 w-auto object-cover rounded border" />
              <p className="text-xs text-green-600 mt-1">✓ Featured image ready</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50" disabled={loading || uploadingImage || uploadingInlineImage || uploadingVideo}>
            {loading ? 'Creating...' : (lang === 'bn' ? 'প্রকাশ করুন' : 'Publish Article')}
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
