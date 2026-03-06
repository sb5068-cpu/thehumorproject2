'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_superadmin')
          .eq('id', user.id)
          .single()

        if (profile?.is_superadmin) {
          setAuthorized(true)
        }
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  if (loading) return <div className="p-10 font-black italic">SHARPENING THE BLADES...</div>

  if (!authorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-red-500 text-white p-10 text-center">
        <h1 className="text-6xl font-black uppercase mb-4 italic">Access Denied</h1>
        <p className="font-bold max-w-md">You are not marked as a Superadmin in the database. Please log in with an authorized account.</p>
      </div>
    )
  }

  return <>{children}</>
}