'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

type Props = {
  adminName: string
  adminEmail: string
}

type UserProfile = {
  fullName: string
  email: string
  avatarUrl: string
}

export default function ProfileClient({ adminName, adminEmail }: Props) {
  const router = useRouter()
  const { showToast } = useToast()

  const [profile, setProfile] = useState<UserProfile>({
    fullName: adminName || '',
    email: adminEmail || '',
    avatarUrl: '',
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  useEffect(() => {
    async function loadUser() {
      const defaultProfile = {
        fullName: adminName || '',
        email: adminEmail || '',
        avatarUrl: '',
      }

      try {
        const res = await fetch('/api/admin/profile')
        if (!res.ok) {
          setProfile(defaultProfile)
          setLoading(false)
          return
        }
        const data = await res.json()
        setProfile({
          fullName: data.name || adminName || '',
          email: data.email || adminEmail || '',
          avatarUrl: '',
        })
      } catch (error) {
        console.error('Failed to load profile:', error)
        setProfile(defaultProfile)
      }
      setLoading(false)
    }

    loadUser()
  }, [adminEmail, adminName])

  function handleAvatarSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSaveProfile() {
    setErrorMessage('')
    setSavingProfile(true)

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.fullName }),
      })

      if (!res.ok) {
        const error = await res.json()
        setErrorMessage(error.error || 'Failed to save profile')
        setSavingProfile(false)
        return
      }

      const data = await res.json()
      setProfile(prev => ({ ...prev, fullName: data.name }))
      setAvatarFile(null)
      showToast('Profile updated successfully')
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to save profile.')
    }
    setSavingProfile(false)
  }

  async function handlePasswordUpdate() {
    setPasswordError('')
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError('Please fill all password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation must match.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: currentPassword.trim(), 
          newPassword: newPassword.trim() 
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        setPasswordError(error.error || 'Failed to update password')
        setSavingPassword(false)
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password updated successfully')
    } catch (error: any) {
      setPasswordError(error?.message || 'Failed to update password')
    }
    setSavingPassword(false)
  }

  async function handleEmailUpdate() {
    setEmailError('')
    if (!newEmail.trim()) {
      setEmailError('Please enter a new email address.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address.')
      return
    }
    if (newEmail === profile.email) {
      setEmailError('New email must be different from current email.')
      return
    }
    if (!emailPassword.trim()) {
      setEmailError('Please enter your password to confirm email change.')
      return
    }

    setSavingEmail(true)
    try {
      const res = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newEmail: newEmail.trim(), 
          password: emailPassword.trim() 
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        setEmailError(error.error || 'Failed to update email')
        setSavingEmail(false)
        return
      }

      const data = await res.json()
      setProfile(prev => ({ ...prev, email: data.admin.email }))
      setNewEmail('')
      setEmailPassword('')
      showToast('Email updated successfully')
    } catch (error: any) {
      setEmailError(error?.message || 'Failed to update email')
    }
    setSavingEmail(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-14 text-center shadow-lg">
          <p className="text-slate-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin Profile</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Manage your account</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Update display name, avatar, and password securely using Supabase Auth.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-flow-col sm:grid-cols-[auto_auto]">
            <div className="rounded-3xl bg-slate-50 px-6 py-4 text-center">
              <p className="text-sm text-slate-500">Current email</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{profile.email}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-6 py-4 text-center">
              <p className="text-sm text-slate-500">Role</p>
              <p className="mt-2 text-base font-semibold text-slate-900">Admin</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section className="rounded-[2rem] bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="relative h-32 w-32 overflow-hidden rounded-full bg-slate-100">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-4xl text-slate-400">
                    {profile.fullName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{profile.fullName}</h2>
                <p className="text-sm text-slate-500">{profile.email}</p>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Upload new avatar
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelected} />
              </label>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[2rem] bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile details</p>
                  <h3 className="text-xl font-semibold text-slate-900">Edit name and avatar</h3>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={e => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Avatar URL</label>
                  <input
                    type="text"
                    value={profile.avatarUrl}
                    onChange={e => setProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Optional direct image URL"
                  />
                  <p className="mt-2 text-sm text-slate-500">Use this field if you already have a hosted avatar link.</p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {savingProfile ? 'Saving profile...' : 'Save profile'}
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Account</p>
                  <h3 className="text-xl font-semibold text-slate-900">Change email address</h3>
                </div>
              </div>

              {emailError && (
                <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{emailError}</div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">New Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter new email"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Password (to confirm)</label>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={e => setEmailPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your password"
                  />
                  <p className="mt-2 text-sm text-slate-500">A verification link will be sent to your new email address.</p>
                </div>

                <button
                  type="button"
                  onClick={handleEmailUpdate}
                  disabled={savingEmail}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {savingEmail ? 'Updating email...' : 'Update email'}
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Security</p>
                  <h3 className="text-xl font-semibold text-slate-900">Change password</h3>
                </div>
              </div>

              {passwordError && (
                <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="New password"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  disabled={savingPassword}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {savingPassword ? 'Updating password...' : 'Update password'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
