'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

// ==================== HELPERS ====================

// Convert image to WebP blob (for frontend delivery)
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

// Upload image: store original + WebP, return WebP URL
async function uploadImage(file) {
  const timestamp = Date.now()
  const baseName = file.name.split('.')[0].replace(/[^a-z0-9]/gi, '-')
  const ext = file.name.split('.').pop()

  // Original
  const originalPath = `temp-user/original/${timestamp}-${baseName}.${ext}`
  const { error: err1 } = await supabase.storage
    .from('article-images')
    .upload(originalPath, file, { cacheControl: '3600', contentType: file.type })
  if (err1) throw err1

  // WebP
  const webpBlob = await convertToWebP(file)
  const webpPath = `temp-user/webp/${timestamp}-${baseName}.webp`
  const { error: err2 } = await supabase.storage
    .from('article-images')
    .upload(webpPath, webpBlob, { cacheControl: '3600', contentType: 'image/webp' })
  if (err2) throw err2

  const { data: { publicUrl } } = supabase.storage
    .from('article-images')
    .getPublicUrl(webpPath)
  return publicUrl
}

// Upload video (original, max 50MB)
async function uploadVideo(file) {
  const MAX_MB = 50
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`Video too large. Max ${MAX_MB}MB.`)
  }
  const timestamp = Date.now()
  const baseName = file.name.split('.')[0].replace(/[^a-z0-9]/gi, '-')
  const ext = file.name.split('.').pop()
  const filePath = `temp-user/videos/${timestamp}-${baseName}.${ext}`

  const { error } = await supabase.storage
    .from('article-images')
    .upload(filePath, file, { cacheControl: '3600', contentType: file.type })
  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('article-images')
    .getPublicUrl(filePath)
  return publicUrl
}

// External video embed generators (wrapped with centering)
function wrapWithCenter(html) {
  return `<div class="flex justify-center my-4">${html}</div>`
}

function youtubeEmbed(url) {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)
  if (match && match[2].length === 11) {
    const iframe = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${match[2]}" frameborder="0" allowfullscreen style="max-width:100%;"></iframe>`
    return wrapWithCenter(iframe)
  }
  return null
}

function vimeoEmbed(url) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  if (match && match[1]) {
    const iframe = `<iframe src="https://player.vimeo.com/video/${match[1]}" width="560" height="315" frameborder="0" allowfullscreen style="max-width:100%;"></iframe>`
    return wrapWithCenter(iframe)
  }
  return null
}

function facebookEmbed(url) {
  const iframe = `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560" width="560" height="315" frameborder="0" allowfullscreen style="max-width:100%;"></iframe>`
  return wrapWithCenter(iframe)
}

async function tiktokEmbed(url) {
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)
    const data = await res.json()
    if (data.html) {
      // TikTok's HTML already includes a div, but we'll wrap it again to ensure centering
      return wrapWithCenter(data.html)
    }
    return null
  } catch {
    return null
  }
}

// ==================== MAIN COMPONENT ====================

export default function NewArticle({ params: { lang } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
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

  const contentRef = useRef(null)
  const contentBnRef = useRef(null)

  const categories = ['Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Health', 'International','Satire']

  // Insert media at cursor position
  const insertAtCursor = (field, html) => {
    const textarea = field === 'content' ? contentRef.current : contentBnRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const current = formData[field]
      const newContent = current.substring(0, start) + html + current.substring(end)
      setFormData({ ...formData, [field]: newContent })
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + html.length, start + html.length)
      }, 10)
    } else {
      // fallback: append
      setFormData({ ...formData, [field]: formData[field] + '\n\n' + html + '\n\n' })
    }
  }

  // Image upload (inline) - centered
  const handleInlineImage = async (field) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      setUploadingImage(true)
      try {
        const url = await uploadImage(file)
        const imgTag = `<div class="flex justify-center my-4"><img src="${url}" alt="Image" class="max-w-full h-auto" /></div>`
        insertAtCursor(field, imgTag)
        setSuccess('Image inserted!')
        setTimeout(() => setSuccess(''), 2000)
      } catch (err) {
        setError(`Image failed: ${err.message}`)
      } finally {
        setUploadingImage(false)
      }
    }
    input.click()
  }

  // Video file upload (centered)
  const handleInlineVideo = async (field) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      setUploadingVideo(true)
      try {
        const url = await uploadVideo(file)
        const videoTag = `<div class="flex justify-center my-4"><video controls class="w-full max-w-2xl"><source src="${url}" type="${file.type}">Your browser does not support video.</video></div>`
        insertAtCursor(field, videoTag)
        setSuccess('Video uploaded & inserted!')
        setTimeout(() => setSuccess(''), 2000)
      } catch (err) {
        setError(`Video failed: ${err.message}`)
      } finally {
        setUploadingVideo(false)
      }
    }
    input.click()
  }

  // External video link (centered)
  const handleExternalVideo = async (field) => {
    const url = prompt('Enter video URL (YouTube, TikTok, Facebook Reel, Vimeo) or paste iframe code:')
    if (!url) return

    let embed = null
    if (url.includes('youtube.com') || url.includes('youtu.be')) embed = youtubeEmbed(url)
    else if (url.includes('vimeo.com')) embed = vimeoEmbed(url)
    else if (url.includes('facebook.com') || url.includes('fb.com')) embed = facebookEmbed(url)
    else if (url.includes('tiktok.com')) embed = await tiktokEmbed(url)
    else if (url.trim().startsWith('<iframe')) {
      // Wrap raw iframe with centering
      embed = `<div class="flex justify-center my-4">${url}</div>`
    }
    else {
      // Assume direct video URL – wrap in video tag and center
      embed = `<div class="flex justify-center my-4"><video controls class="w-full max-w-2xl"><source src="${url}" type="video/mp4">Your browser does not support video.</video></div>`
    }

    if (embed) {
      insertAtCursor(field, embed)
      setSuccess('Video embed inserted!')
      setTimeout(() => setSuccess(''), 2000)
    } else {
      setError('Could not generate embed code.')
      setTimeout(() => setError(''), 3000)
    }
  }

  // Featured image upload (separate, not centered here because it's a preview)
  const handleFeaturedImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const url = await uploadImage(file)
      setFormData({ ...formData, featured_image: url })
      setSuccess('Featured image ready!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(`Featured image failed: ${err.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  // Submit article
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!formData.title || !formData.content || !formData.category || !formData.author) {
      setError('Title, Content, Category and Author are required.')
      setLoading(false)
      return
    }

    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const article = {
      title: formData.title,
      title_bn: formData.title_bn || null,
      slug,
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

    try {
      const { error } = await supabase.from('articles').insert([article])
      if (error) throw error
      setSuccess('Article published! Redirecting...')
      setTimeout(() => router.push(`/${lang}/admin`), 2000)
    } catch (err) {
      setError(`Database error: ${err.message}`)
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        {lang === 'bn' ? 'নতুন আর্টিকেল' : 'Create New Article'}
      </h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">❌ {error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">✅ {success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titles */}
        <div>
          <label className="block text-sm font-medium mb-2">Title (English) *</label>
          <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Title (Bangla)</label>
          <input type="text" value={formData.title_bn} onChange={(e) => setFormData({...formData, title_bn: e.target.value})} className="w-full px-3 py-2 border rounded-md font-bangla" />
        </div>

        {/* Excerpts */}
        <div>
          <label className="block text-sm font-medium mb-2">Excerpt (English)</label>
          <textarea rows="2" value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Excerpt (Bangla)</label>
          <textarea rows="2" value={formData.excerpt_bn} onChange={(e) => setFormData({...formData, excerpt_bn: e.target.value})} className="w-full px-3 py-2 border rounded-md font-bangla" />
        </div>

        {/* Content (English) with media buttons */}
        <div>
          <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
            <label className="text-sm font-medium">Content (English) *</label>
            <div className="space-x-2">
              <button type="button" onClick={() => handleInlineImage('content')} disabled={uploadingImage} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50">
                📷 Upload Image
              </button>
              <button type="button" onClick={() => handleInlineVideo('content')} disabled={uploadingVideo} className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700 disabled:opacity-50">
                🎬 Upload Video
              </button>
              <button type="button" onClick={() => handleExternalVideo('content')} className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700">
                🔗 External Video Link
              </button>
            </div>
          </div>
          <textarea
            ref={contentRef}
            rows="12"
            required
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full px-3 py-2 border rounded-md font-mono"
            placeholder="Write your article here. Position your cursor and click one of the buttons above to insert images or videos at that exact spot. All media will be centered automatically."
          />
          <p className="text-xs text-gray-500 mt-1">HTML supported. Insert as many images/videos as you like – they will be centered.</p>
        </div>

        {/* Content (Bangla) with same buttons */}
        <div>
          <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
            <label className="text-sm font-medium">Content (Bangla)</label>
            <div className="space-x-2">
              <button type="button" onClick={() => handleInlineImage('content_bn')} disabled={uploadingImage} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50">
                📷 Upload Image
              </button>
              <button type="button" onClick={() => handleInlineVideo('content_bn')} disabled={uploadingVideo} className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700 disabled:opacity-50">
                🎬 Upload Video
              </button>
              <button type="button" onClick={() => handleExternalVideo('content_bn')} className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700">
                🔗 External Video Link
              </button>
            </div>
          </div>
          <textarea
            ref={contentBnRef}
            rows="10"
            value={formData.content_bn}
            onChange={(e) => setFormData({...formData, content_bn: e.target.value})}
            className="w-full px-3 py-2 border rounded-md font-bangla"
            placeholder="বাংলা কন্টেন্ট (একইভাবে ছবি ও ভিডিও বসাতে পারেন, স্বয়ংক্রিয়ভাবে মাঝখানে থাকবে)"
          />
        </div>

        {/* Category & Author */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-md">
              <option value="">Select</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Author *</label>
            <input type="text" required value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium mb-2">Featured Image (for card / hero)</label>
          <input type="file" accept="image/*" onChange={handleFeaturedImage} disabled={uploadingImage} className="w-full px-3 py-2 border rounded-md" />
          {uploadingImage && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
          {formData.featured_image && (
            <div className="mt-2">
              <img src={formData.featured_image} alt="Featured" className="h-32 w-auto object-cover rounded border" />
              <p className="text-xs text-green-600 mt-1">✓ Featured image ready (WebP)</p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50" disabled={loading || uploadingImage || uploadingVideo}>
            {loading ? 'Publishing...' : (lang === 'bn' ? 'প্রকাশ করুন' : 'Publish Article')}
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
