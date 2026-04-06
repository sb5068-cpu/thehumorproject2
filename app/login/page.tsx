'use client'
import { createClient } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-10 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl">
        {/* Logo Section */}
        <div className="mb-10 text-center">
          <div className="inline-block bg-indigo-600 text-white font-mono font-medium text-xs px-3 py-1 rounded-md tracking-widest mb-4 shadow-lg shadow-indigo-500/20">
            ADMIN PORTAL
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Humor Pipeline
          </h1>
          <p className="text-neutral-400 text-sm">
            Superadmin access only. Sign in to continue.
          </p>
        </div>

        {error === 'unauthorized' && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400 text-sm text-center font-medium">
            ⚠ Your account does not have superadmin privileges.
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 bg-white hover:bg-neutral-100 transition-colors duration-200 rounded-lg text-neutral-900 flex items-center justify-center gap-3 text-sm font-semibold shadow-md"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-center text-neutral-500 text-xs uppercase tracking-wider font-medium">
          Secure Environment
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950"></div>}>
      <LoginContent />
    </Suspense>
  )
}