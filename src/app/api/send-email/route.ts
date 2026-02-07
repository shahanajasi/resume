import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, text, html, pdfBase64, fileName } = body

    if (!to || !EMAIL_REGEX.test(to)) {
      return NextResponse.json(
        { error: 'Invalid recipient email address' },
        { status: 400 }
      )
    }

    if (!subject || !text) {
      return NextResponse.json(
        { error: 'Subject and text are required' },
        { status: 400 }
      )
    }

    if (!pdfBase64 || !fileName) {
      return NextResponse.json(
        { error: 'PDF attachment is required' },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      text: text,
      html: html || text,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    })

    if (error) {
      console.error('Resend API error:', error)
      return NextResponse.json(
        { 
          error: error.message || 'Failed to send email',
          details: error 
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No response data from email service' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        messageId: data.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending email:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: error.message,
          type: error.name 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const isConfigured = !!process.env.RESEND_API_KEY

  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured
      ? 'Email service is configured'
      : 'Email service requires RESEND_API_KEY environment variable',
  })
}