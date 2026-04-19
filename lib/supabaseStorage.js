import { supabase } from './supabase.js'

export const STORAGE_CONFIG = {
  articleImages: {
    bucket: 'article-images',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  videos: {
    bucket: 'video-gallery',
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['video/mp4', 'video/webm'],
  },
}

export async function uploadFile(file, bucket, userId) {
  if (!supabase.storage) {
    // Mock upload for development
    return {
      path: `mock-path-${Date.now()}`,
      url: 'https://placehold.co/600x400'
    }
  }
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)
  
  return { path: fileName, url: publicUrl }
}

export async function deleteFile(bucket, path) {
  if (!supabase.storage) return true
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
  return true
}