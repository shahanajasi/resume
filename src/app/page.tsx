'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '~/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      alert('Login failed: ' + error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center">
          Resume Creator
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Create professional resumes in minutes
        </p>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}