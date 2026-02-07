'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '~/lib/supabase'

type Resume = {
  id: string
  title: string
  updated_at: string
}

export default function Dashboard() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    loadResumes()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/') 
    }
  }

  const loadResumes = async () => {
    const { data, error } = await supabase
      .from('resumes')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })

    if (data) setResumes(data)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>

        <Link
          href="/resume/new"
          className="inline-block mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create New Resume
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Link
              key={resume.id}
              href={`/resume/${resume.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">{resume.title}</h3>
              <p className="text-gray-500 text-sm">
                Updated: {new Date(resume.updated_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>

        {resumes.length === 0 && (
          <p className="text-center text-gray-500 mt-12">
            No resumes yet. Create your first one!
          </p>
        )}
      </div>
    </div>
  )
}