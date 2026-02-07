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
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingDocx, setDownloadingDocx] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadResume()
  }, [])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [error])


  const loadResume = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', params.id)
        .single()

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw new Error('Failed to load resume')
      }

      if (!data) {
        throw new Error('Resume not found')
      }

      setResume(data)
    } catch (err) {
      console.error('Error loading resume:', err)
      setError(err instanceof Error ? err.message : 'Failed to load resume')
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!resumeRef.current || !resume) {
      setError('Cannot generate PDF: Resume not loaded')
      return
    }

    try {
      setDownloadingPdf(true)
      setError(null)

      const result = await downloadAsPDF(resumeRef.current, resume.full_name)

      if (result.success) {
        setSuccessMessage('PDF downloaded successfully!')
      } else {
        setError(result.error?.message || 'Failed to download PDF')
      }
    } catch (err) {
      console.error('PDF download error:', err)
      setError('An unexpected error occurred while downloading PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleDownloadDocx = async () => {
    if (!resume) {
      setError('Cannot generate Word document: Resume not loaded')
      return
    }

    try {
      setDownloadingDocx(true)
      setError(null)

      const result = await downloadAsDocx(resume)

      if (result.success) {
        setSuccessMessage('Word document downloaded successfully!')
      } else {
        setError(result.error?.message || 'Failed to download Word document')
      }
    } catch (err) {
      console.error('DOCX download error:', err)
      setError('An unexpected error occurred while downloading Word document')
    } finally {
      setDownloadingDocx(false)
    }
  }

  const handlePrint = () => {
    try {
      window.print()
    } catch (err) {
      console.error('Print error:', err)
      setError('Failed to open print dialog')
    }
  }

  const handleSendEmail = async () => {
    if (!emailAddress) {
      setError('Please enter an email address')
      return
    }

    if (!emailAddress.includes('@') || !emailAddress.includes('.')) {
      setError('Please enter a valid email address')
      return
    }

    if (!resume || !resumeRef.current) {
      setError('Cannot send email: Resume not loaded')
      return
    }

    try {
      setSending(true)
      setError(null)

      const result = await sendEmail(emailAddress, resume, resumeRef.current)

      if (result.success) {
        setSuccessMessage(`Resume sent successfully to ${emailAddress}!`)
        setShowEmailModal(false)
        setEmailAddress('')
      } else {
        setError(result.error?.message || 'Failed to send email')
      }
    } catch (err) {
      console.error('Email send error:', err)
      setError('An unexpected error occurred while sending email')
    } finally {
      setSending(false)
    }
  }

  const handleCloseEmailModal = () => {
    setShowEmailModal(false)
    setEmailAddress('')
    setError(null)
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-700">Loading resume...</div>
        </div>
      </div>
    )
  }

  if (!resume) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Resume Not Found</h2>
          <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-semibold">Error</div>
            <div className="text-sm">{error}</div>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-2 hover:bg-red-600 rounded p-1"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white shadow-md p-4 print:hidden sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {downloadingPdf ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF
                </>
              )}
            </button>

            <button
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {downloadingDocx ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  DOCX
                </>
              )}
            </button>

            <button
              onClick={() => setShowEmailModal(true)}
              disabled={sending}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="bg-white shadow-lg print:shadow-none" ref={resumeRef}>
          <ResumeTemplate data={resume} />
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Email Resume</h2>

            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !sending && emailAddress) {
                    handleSendEmail()
                  }
                }}
                placeholder="hiring@company.com"
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                disabled={sending}
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                The resume will be sent as a PDF attachment
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendEmail}
                disabled={sending || !emailAddress}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Resume
                  </>
                )}
              </button>

              <button
                onClick={handleCloseEmailModal}
                disabled={sending}
                className="px-4 py-3 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          @page {
            margin: 0.5in;
          }
        }

        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}