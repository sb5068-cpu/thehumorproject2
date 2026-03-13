'use client'
import { useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'denied'>('loading')
  const supabase = createClient()

  useEffect(() => {
    async function verify() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setStatus('denied')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single()

      setStatus(profile?.is_superadmin ? 'authorized' : 'denied')
    }
    verify()
  }, [])

  if (status === 'loading') {
    return <div className="bg-black text-white p-10 font-mono animate-pulse">BOOTING_CORE_SYSTEMS...</div>
  }

  if (status === 'denied') {
    return (
      <div className="h-screen bg-red-600 text-white p-20 flex flex-col justify-center border-[16px] border-black">
        <h1 className="text-9xl font-black uppercase italic mb-4">No Entry</h1>
        <p className="text-2xl font-bold mb-10 uppercase">Identity not verified in Superadmin Archive.</p>
        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` }})}
          className="bg-black text-white p-6 text-2xl font-black hover:bg-white hover:text-black transition-all w-fit"
        >
          FORCE_LOGIN_OAUTH
        </button>
      </div>
    )
  }

  return <>{children}</>
}