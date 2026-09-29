import { supabase } from '@/lib/supabase'

export function slugifyCategory(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/* ---------- অ্যাডমিন CRUD ---------- */

export async function fetchAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name_en', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createCategory(payload) {
  const body = {
    slug: slugifyCategory(payload.slug || payload.name_en),
    name_bn: payload.name_bn?.trim(),
    name_en: payload.name_en?.trim(),
  }

  if (!body.slug || !body.name_bn || !body.name_en) {
    throw new Error('slug, বাংলা নাম ও ইংরেজি নাম আবশ্যক')
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(body)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCategory(id, payload) {
  const body = {
    slug: slugifyCategory(payload.slug || payload.name_en),
    name_bn: payload.name_bn?.trim(),
    name_en: payload.name_en?.trim(),
  }

  if (!body.slug || !body.name_bn || !body.name_en) {
    throw new Error('slug, বাংলা নাম ও ইংরেজি নাম আবশ্যক')
  }

  const { data, error } = await supabase
    .from('categories')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}