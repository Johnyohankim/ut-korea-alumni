'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from './LanguageProvider'

export default function NoticeBanner() {
  const { locale } = useLanguage()
  const [notice, setNotice] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [height, setHeight] = useState(0)
  const bannerRef = useRef(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          const en = d.settings.notice || ''
          const ko = d.settings.notice_ko || ''
          if (en || ko) setNotice({ en, ko })
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (bannerRef.current) {
      setHeight(bannerRef.current.offsetHeight)
    }
  }, [notice, dismissed])

  if (!notice || dismissed) return null

  const text = locale === 'ko' && notice.ko ? notice.ko : notice.en
  if (!text) return null

  return (
    <>
      <div
        ref={bannerRef}
        className="fixed top-16 left-0 right-0 z-40 bg-burnt-orange text-white text-center text-sm py-2 px-10"
      >
        <span>{text}</span>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
      <div style={{ height: `${height}px` }} />
    </>
  )
}
