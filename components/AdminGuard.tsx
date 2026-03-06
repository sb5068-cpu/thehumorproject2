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
          <p className="font-bold max-w-md mb-8">
            You are not marked as a Superadmin. Please log in with an authorized account.
          </p>

          {/* ADD THIS BUTTON */}
          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              })
            }}
            className="bg-black text-white px-8 py-4 font-black uppercase border-4 border-white hover:bg-white hover:text-black transition-all"
          >
            Sign in with Google
          </button>
        </div>
      )
    }

  return <>{children}</>
}