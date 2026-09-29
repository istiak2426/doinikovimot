import { supabase } from '@/lib/supabase'

let cache = null

export function slugifyCategory(value = '') {
  return value.toString().trim().toLowerCase().replace(/\s+/g, '-')
}

export async function fetchCategories({ force = false } = {}) {
  if (cache && !force) return cache

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name_en', { ascending: true })

  if (error) {
    console.warn('categories fetch failed:', error.message)
    return []
  }

  cache = data || []
  return cache
}

export async function fetchAllCategoriesAdmin() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data || []
}

export function findCategory(categories, slug) {
  const normalized = slugifyCategory(slug)
  return categories.find((c) => slugifyCategory(c.slug) === normalized) || null
}

export function getCategoryName(category, lang) {
  if (!category) return ''
  return lang === 'bn'
    ? category.name_bn || category.name_en
    : category.name_en || category.name_bn
}

export function getCategoryDescription(category, lang) {
  if (!category) return ''
  return lang === 'bn'
    ? category.description_bn || category.description_en
    : category.description_en || category.description_bn
}

/* ---------- Mutations (Admin UI থেকে কল হবে) ---------- */

export async function createCategory(payload) {
  const body = {
    slug: slugifyCategory(payload.slug || payload.name_en),
    name_bn: payload.name_bn?.trim(),
    name_en: payload.name_en?.trim(),
    description_bn: payload.description_bn?.trim() || null,
    description_en: payload.description_en?.trim() || null,
    sort_order: Number(payload.sort_order) || 0,
    is_active: payload.is_active ?? true,
  }

  if (!body.slug || !body.name_bn || !body.name_en) {
    throw new Error('slug, name_bn, name_en আবশ্যক')
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(body)
    .select()
    .single()

  if (error) throw error
  cache = null
  return data
}

export async function updateCategory(id, payload) {
  const body = {
    ...payload,
    slug: payload.slug ? slugifyCategory(payload.slug) : undefined,
    sort_order: payload.sort_order != null ? Number(payload.sort_order) : undefined,
    updated_at: new Date().toISOString(),
  }

  Object.keys(body).forEach((k) => body[k] === undefined && delete body[k])

  const { data, error } = await supabase
    .from('categories')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  cache = null
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
  cache = null
}
