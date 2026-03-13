'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useT } from '../components/LanguageProvider'

function ResetPasswordForm() {
  const t = useT()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="card p-8 text-center">
        <h2 className="font-display text-xl font-bold text-charcoal mb-2">{t('resetPassword.invalidTitle')}</h2>
        <p className="text-charcoal-light text-sm">{t('resetPassword.invalidMessage')}</p>
        <Link href="/forgot-password" className="btn-primary inline-block mt-6 !py-2.5 no-underline">
          {t('resetPassword.requestNew')}
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(t('profile.errors.newPasswordShort'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('profile.errors.passwordMismatch'))
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'INVALID_TOKEN') {
          setError(t('resetPassword.invalidMessage'))
        } else if (data.error === 'EXPIRED_TOKEN') {
          setError(t('resetPassword.expiredMessage'))
        } else {
          setError(t('common.error'))
        }
      } else {
        setSuccess(true)
      }
    } catch {
      setError(t('common.error'))
    }
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-charcoal/15 bg-warm-white text-charcoal focus:outline-none focus:ring-2 focus:ring-burnt-orange/30 focus:border-burnt-orange transition-all text-sm"

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 className="font-display text-xl font-bold text-charcoal mb-2">{t('resetPassword.successTitle')}</h2>
        <p className="text-charcoal-light text-sm">{t('resetPassword.successMessage')}</p>
        <Link href="/login" className="btn-primary inline-block mt-6 !py-2.5 no-underline">
          {t('auth.loginBtn')}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5">{t('profile.newPassword')}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5">{t('profile.confirmNewPassword')}</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full !py-3 disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? t('common.loading') : t('resetPassword.submitBtn')}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  const t = useT()

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pt-24 pb-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <svg viewBox="0 0 40 28" className="w-12 h-8 fill-burnt-orange mx-auto mb-4">
            <path d="M20 12C20 12 16 4 8 2C6 1.5 3 1.5 1 3C0.5 3.3 0 4 0.5 4.5C1 5 2 4.8 3 4.5C5 3.8 7 4 8 5C10 7 12 10 14 12C15 13 17 15 20 15C23 15 25 13 26 12C28 10 30 7 32 5C33 4 35 3.8 37 4.5C38 4.8 39 5 39.5 4.5C40 4 39.5 3.3 39 3C37 1.5 34 1.5 32 2C24 4 20 12 20 12Z"/>
            <path d="M20 15C17 15 15 17 14 19C13 21 13 24 15 26C16 27 18 28 20 28C22 28 24 27 25 26C27 24 27 21 26 19C25 17 23 15 20 15ZM20 25C18.5 25 17.5 23.5 18 22C18.3 21 19 20 20 20C21 20 21.7 21 22 22C22.5 23.5 21.5 25 20 25Z"/>
          </svg>
          <h1 className="font-display text-3xl font-bold text-charcoal">{t('resetPassword.title')}</h1>
          <p className="text-charcoal-light mt-2">{t('resetPassword.subtitle')}</p>
        </div>

        <Suspense fallback={<div className="text-center text-charcoal-light">{t('common.loading')}</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
