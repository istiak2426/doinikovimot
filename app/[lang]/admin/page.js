'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FileText, Eye, Plus, Edit, Trash2 } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AdminDashboard() {
  const params = useParams()
  const router = useRouter()
  const lang = params?.lang || 'bn'
  
  const [articles, setArticles] = useState([])
  const [stats, setStats] = useState({ total: 0, published: 0, views: 0 })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    checkAuth()
    fetchArticles()
    fetchStats()
  }, [])
  
  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/${lang}/auth`)
    } else {
      setUser(user)
    }
  }
  
  async function fetchArticles() {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (data) setArticles(data)
  }
  
  async function fetchStats() {
    const { count: total } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
    
    const { count: published } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
    
    const { data: viewsData } = await supabase
      .from('articles')
      .select('views')
    
    const totalViews = viewsData?.reduce((sum, a) => sum + (a.views || 0), 0) || 0
    
    setStats({ 
      total: total || 0, 
      published: published || 0, 
      views: totalViews 
    })
    setLoading(false)
  }
  
  async function deleteArticle(id) {
    if (confirm(lang === 'bn' ? 'আর্টিকেলটি মুছতে চান?' : 'Delete this article?')) {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)
      
      if (!error) {
        setArticles(articles.filter(a => a.id !== id))
        fetchStats()
      }
    }
  }
  
  if (loading) return <LoadingSpinner />
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Please login to access admin panel</p>
        <Link href={`/${lang}/auth`} className="btn-primary mt-4 inline-block">
          Go to Login
        </Link>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">
          {lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
        </h1>
        <Link 
          href={`/${lang}/admin/new-article`} 
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          {lang === 'bn' ? 'নতুন আর্টিকেল' : 'New Article'}
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                {lang === 'bn' ? 'মোট আর্টিকেল' : 'Total Articles'}
              </p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <FileText className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                {lang === 'bn' ? 'প্রকাশিত' : 'Published'}
              </p>
              <p className="text-3xl font-bold">{stats.published}</p>
            </div>
            <Eye className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                {lang === 'bn' ? 'মোট দর্শন' : 'Total Views'}
              </p>
              <p className="text-3xl font-bold">{stats.views.toLocaleString()}</p>
            </div>
            <Eye className="text-purple-500" size={32} />
          </div>
        </div>
      </div>
      
      {/* Articles List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-semibold">
            {lang === 'bn' ? 'সর্বশেষ আর্টিকেল' : 'Recent Articles'}
          </h2>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>{lang === 'bn' ? 'কোনো আর্টিকেল নেই' : 'No articles found'}</p>
            <Link href={`/${lang}/admin/new-article`} className="text-red-600 hover:underline mt-2 inline-block">
              {lang === 'bn' ? 'প্রথম আর্টিকেল তৈরি করুন' : 'Create your first article'}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {lang === 'bn' ? 'শিরোনাম' : 'Title'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {lang === 'bn' ? 'বিভাগ' : 'Category'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {lang === 'bn' ? 'দর্শন' : 'Views'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {lang === 'bn' ? 'অ্যাকশন' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles.map(article => (
                  <tr key={article.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {lang === 'bn' && article.title_bn ? article.title_bn : article.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{article.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{article.views || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        article.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status === 'published' 
                          ? (lang === 'bn' ? 'প্রকাশিত' : 'Published')
                          : (lang === 'bn' ? 'খসড়া' : 'Draft')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link 
                          href={`/${lang}/article/${article.id}`} 
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          href={`/${lang}/admin/edit-article/${article.id}`}
                          className="text-green-600 hover:text-green-800 transition"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => deleteArticle(article.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}