'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useT } from '../components/LanguageProvider'

export default function ForgotPasswordPage() {
  const t = useT()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || t('common.error'))
      } else {
        setSent(true)
      }
    } catch {
      setError(t('common.error'))
    }
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-charcoal/15 bg-warm-white text-charcoal focus:outline-none focus:ring-2 focus:ring-burnt-orange/30 focus:border-burnt-orange transition-all text-sm"

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pt-24 pb-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <svg viewBox="0 0 40 28" className="w-12 h-8 fill-burnt-orange mx-auto mb-4">
            <path d="M20 12C20 12 16 4 8 2C6 1.5 3 1.5 1 3C0.5 3.3 0 4 0.5 4.5C1 5 2 4.8 3 4.5C5 3.8 7 4 8 5C10 7 12 10 14 12C15 13 17 15 20 15C23 15 25 13 26 12C28 10 30 7 32 5C33 4 35 3.8 37 4.5C38 4.8 39 5 39.5 4.5C40 4 39.5 3.3 39 3C37 1.5 34 1.5 32 2C24 4 20 12 20 12Z"/>
            <path d="M20 15C17 15 15 17 14 19C13 21 13 24 15 26C16 27 18 28 20 28C22 28 24 27 25 26C27 24 27 21 26 19C25 17 23 15 20 15ZM20 25C18.5 25 17.5 23.5 18 22C18.3 21 19 20 20 20C21 20 21.7 21 22 22C22.5 23.5 21.5 25 20 25Z"/>
          </svg>
          <h1 className="font-display text-3xl font-bold text-charcoal">{t('forgotPassword.title')}</h1>
          <p className="text-charcoal-light mt-2">{t('forgotPassword.subtitle')}</p>
        </div>

        {sent ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h2 className="font-display text-xl font-bold text-charcoal mb-2">{t('forgotPassword.sentTitle')}</h2>
            <p className="text-charcoal-light text-sm">{t('forgotPassword.sentMessage')}</p>
            <Link href="/login" className="btn-primary inline-block mt-6 !py-2.5 no-underline">
              {t('auth.loginBtn')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-8 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="longhorn@utexas.edu"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('forgotPassword.submitBtn')}
            </button>

            <p className="text-center text-sm text-charcoal-light">
              <Link href="/login" className="text-burnt-orange font-medium hover:text-burnt-dark no-underline">
                {t('forgotPassword.backToLogin')}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
