'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  slugifyCategory,
} from '@/lib/categories'

const emptyForm = {
  id: null,
  slug: '',
  name_bn: '',
  name_en: '',
}

export default function AdminCategoriesPage() {
  const { lang } = useParams()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchAllCategories()
      setCategories(data)
    } catch (e) {
      setMsg('❌ লোড ব্যর্থ: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const reset = () => setForm(emptyForm)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      if (form.id) {
        await updateCategory(form.id, form)
        setMsg('✅ আপডেট হয়েছে')
      } else {
        await createCategory(form)
        setMsg('✅ নতুন ক্যাটাগরি যোগ হয়েছে')
      }
      reset()
      await load()
    } catch (err) {
      setMsg('❌ ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (cat) => {
    setForm({
      id: cat.id,
      slug: cat.slug,
      name_bn: cat.name_bn || '',
      name_en: cat.name_en || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onDelete = async (cat) => {
    if (!confirm(`"${cat.name_bn}" ডিলিট করবেন?`)) return
    try {
      await deleteCategory(cat.id)
      setMsg('🗑️ ডিলিট হয়েছে')
      await load()
    } catch (err) {
      setMsg('❌ ' + err.message)
    }
  }

  return (
    <div className="container-custom py-8 max-w-3xl">
      <h1 className={`text-3xl font-bold mb-6 ${lang === 'bn' ? 'font-bangla' : ''}`}>
        ক্যাটাগরি ম্যানেজমেন্ট
      </h1>

      {/* ফর্ম */}
      <form onSubmit={onSubmit} className="bg-white shadow rounded-lg p-5 mb-8 space-y-3">
        <h2 className={`text-xl font-semibold ${lang === 'bn' ? 'font-bangla' : ''}`}>
          {form.id ? 'ক্যাটাগরি এডিট' : 'নতুন ক্যাটাগরি'}
        </h2>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Slug (national) — খালি রাখলে নাম_en থেকে হবে"
            value={form.slug}
            onChange={(e) =>
              setForm({ ...form, slug: slugifyCategory(e.target.value) })
            }
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="ইংরেজি নাম (National) *"
            value={form.name_en}
            required
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
          />
          <input
            className={`border rounded px-3 py-2 md:col-span-2 ${
              lang === 'bn' ? 'font-bangla' : ''
            }`}
            placeholder="বাংলা নাম (জাতীয়) *"
            value={form.name_bn}
            required
            onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className={`bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 ${
              lang === 'bn' ? 'font-bangla' : ''
            }`}
          >
            {saving
              ? 'সেভ হচ্ছে...'
              : form.id
              ? 'আপডেট করুন'
              : 'যোগ করুন'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={reset}
              className={`px-4 py-2 border rounded ${lang === 'bn' ? 'font-bangla' : ''}`}
            >
              বাতিল
            </button>
          )}
        </div>

        {msg && (
          <p className={`text-sm ${lang === 'bn' ? 'font-bangla' : ''}`}>{msg}</p>
        )}
      </form>

      {/* লিস্ট */}
      <div className="bg-white shadow rounded-lg divide-y">
        {loading ? (
          <p className="p-4">লোড হচ্ছে...</p>
        ) : categories.length === 0 ? (
          <p className="p-4 text-gray-500">কোনো ক্যাটাগরি নেই</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 flex justify-between items-center gap-4"
            >
              <div>
                <p className={`font-semibold ${lang === 'bn' ? 'font-bangla' : ''}`}>
                  {cat.name_bn}{' '}
                  <span className="text-gray-500">/ {cat.name_en}</span>
                </p>
                <p className="text-xs text-gray-500">slug: {cat.slug}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onEdit(cat)}
                  className={`px-3 py-1 border rounded text-sm hover:bg-gray-50 ${
                    lang === 'bn' ? 'font-bangla' : ''
                  }`}
                >
                  এডিট
                </button>
                <button
                  onClick={() => onDelete(cat)}
                  className={`px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 ${
                    lang === 'bn' ? 'font-bangla' : ''
                  }`}
                >
                  ডিলিট
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}