'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronDown, Globe } from 'lucide-react'

const languages = {
  bn: { name: 'বাংলা', flag: '🇧🇩', label: 'Bangla' },
  en: { name: 'English', flag: '🇬🇧', label: 'English' }
}

export default function LanguageSwitcher({ currentLang }) {
  const router = useRouter()
  const params = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const switchLanguage = (langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false)
      return
    }

    // Get current path and replace the language segment
    const pathSegments = window.location.pathname.split('/')
    if (pathSegments.length > 1 && ['bn', 'en'].includes(pathSegments[1])) {
      pathSegments[1] = langCode
    } else {
      pathSegments.splice(1, 0, langCode)
    }
    
    const newPath = pathSegments.join('/') || '/'
    router.push(newPath)
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors tap-target"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe size={18} />

        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu - Fixed positioning to prevent gap issues */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
          {Object.entries(languages).map(([code, { name, flag, label }]) => (
            <button
              key={code}
              onClick={() => switchLanguage(code)}
              className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                currentLang === code ? 'bg-red-50 text-red-600' : 'text-gray-700'
              }`}
            >

              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>

              </div>
              {currentLang === code && (
                <span className="ml-auto text-red-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}