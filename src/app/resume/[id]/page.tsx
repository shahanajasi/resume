'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '~/lib/supabase'
import { downloadAsDocx, downloadAsPDF, sendEmail } from '~/lib/export'
import ResumeTemplate from '~/components/Resumetemplate'


type ResumeData = {
  id: string
  title: string
  full_name: string
  email: string
  phone: string
  address: string
  linkedin: string
  website: string
  summary: string
  experience: Array<{
    company: string
    position: string
    start_date: string
    end_date: string
    description: string
  }>
  education: Array<{
    school: string
    degree: string
    field: string
    graduation_date: string
  }>
  skills: string[]
  certifications: Array<{
    name: string
    issuer: string
    date: string
  }>
}

export default function ResumePreview() {
  const params = useParams()
  const router = useRouter()
  const resumeRef = useRef<HTMLDivElement>(null)
  
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailAddress, setEmailAddress] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadResume()
  }, [])

  const loadResume = async () => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      alert('Error loading resume')
      router.push('/dashboard')
    } else {
      setResume(data)
    }
    setLoading(false)
  }

  const handleDownloadPDF = async () => {
    if (resumeRef.current && resume) {
      await downloadAsPDF(resumeRef.current, resume.full_name)
    }
  }

  const handleDownloadDocx = async () => {
    if (resume) {
      await downloadAsDocx(resume)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSendEmail = async () => {
    if (!emailAddress || !resume) return
    
    setSending(true)
    const success = await sendEmail(emailAddress, resume, resumeRef.current!)
    setSending(false)
    
    if (success) {
      alert('Resume sent successfully!')
      setShowEmailModal(false)
      setEmailAddress('')
    } else {
      alert('Failed to send email')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!resume) return null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action Bar - Don't print this */}
      <div className="bg-white shadow-md p-4 print:hidden sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← Back to Dashboard
            </button>
            
            <button
              onClick={() => router.push(`/resume/edit/${params.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Resume
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>

            {/* Download DOCX */}
            <button
              onClick={handleDownloadDocx}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              DOCX
            </button>

            {/* Email */}
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="bg-white shadow-lg print:shadow-none" ref={resumeRef}>
          <ResumeTemplate data={resume} />
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Email Resume</h2>
            
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Recipient Email</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="hiring@company.com"
                className="w-full p-3 border rounded"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendEmail}
                disabled={sending || !emailAddress}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300"
              >
                {sending ? 'Sending...' : 'Send Resume'}
              </button>
              
              <button
                onClick={() => {
                  setShowEmailModal(false)
                  setEmailAddress('')
                }}
                className="px-4 py-3 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}