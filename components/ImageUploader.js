'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { Upload, X, Loader2 } from 'lucide-react'

export default function SimpleImageUploader({ onUploadComplete, userId }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return
    
    const file = acceptedFiles[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }
    
    setUploading(true)
    setError('')
    setUploadProgress(0)
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId || 'anonymous'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      console.log('Uploading to:', fileName)
      
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }
      
      console.log('Upload success:', data)
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(fileName)
      
      const imageData = {
        path: fileName,
        url: publicUrl,
        name: file.name,
        size: file.size
      }
      
      setUploadedImage(imageData)
      onUploadComplete?.(imageData)
      setUploadProgress(100)
      
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }, [userId, onUploadComplete])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
  })
  
  const removeImage = () => {
    setUploadedImage(null)
    onUploadComplete?.(null)
  }
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}
      
      {!uploadedImage ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
            ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'}
            ${uploading ? 'opacity-50 cursor-wait' : ''}`}
        >
          <input {...getInputProps()} disabled={uploading} />
          {uploading ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 text-red-500 animate-spin" />
              <p className="mt-2 text-sm text-gray-600">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag & drop an image here, or click to select
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max 5MB. Supports: JPEG, PNG, GIF, WebP
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="relative group border rounded-lg overflow-hidden bg-gray-100">
          {/* Use regular img tag instead of Next.js Image */}
          <div className="relative h-48">
            <img 
              src={uploadedImage.url} 
              alt={uploadedImage.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', uploadedImage.url)
                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Failed'
              }}
            />
          </div>
          <div className="p-3 bg-white">
            <p className="text-sm font-medium truncate">{uploadedImage.name}</p>
            <p className="text-xs text-gray-500">
              {(uploadedImage.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}