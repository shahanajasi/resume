import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

// ============================================
// PDF DOWNLOAD
// ============================================
export async function downloadAsPDF(element: HTMLElement, fileName: string) {
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
    })

    // Calculate dimensions for A4 page
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if content is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download
    pdf.save(`${fileName}_Resume.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Failed to generate PDF')
  }
}

// ============================================
// DOCX DOWNLOAD
// ============================================
export async function downloadAsDocx(resumeData: any) {
  try {
    const sections: any[] = []

    // Helper function to format dates
    const formatDate = (dateStr: string) => {
      if (!dateStr) return 'Present'
      const [year, month] = dateStr.split('-')
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${monthNames[parseInt(month || '1') - 1]} ${year}`
    }

    // Header with name
    sections.push(
      new Paragraph({
        text: resumeData.full_name,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )

    // Contact information
    const contactInfo = [
      resumeData.email,
      resumeData.phone,
      resumeData.address,
      resumeData.linkedin,
      resumeData.website,
    ].filter(Boolean).join(' | ')

    sections.push(
      new Paragraph({
        text: contactInfo,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    )

    // Professional Summary
    if (resumeData.summary) {
      sections.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: {
            bottom: {
              color: '2563EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        }),
        new Paragraph({
          text: resumeData.summary,
          spacing: { after: 200 },
        })
      )
    }

    // Work Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      sections.push(
        new Paragraph({
          text: 'WORK EXPERIENCE',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: {
            bottom: {
              color: '2563EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      )

      resumeData.experience.forEach((exp: any) => {
        if (!exp.company) return

        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: exp.company,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${formatDate(exp.start_date)} - ${formatDate(exp.end_date)}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            text: exp.description,
            spacing: { after: 150 },
          })
        )
      })
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      sections.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: {
            bottom: {
              color: '2563EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      )

      resumeData.education.forEach((edu: any) => {
        if (!edu.school) return

        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.degree} in ${edu.field}`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            text: edu.school,
          }),
          new Paragraph({
            text: formatDate(edu.graduation_date),
            spacing: { after: 150 },
          })
        )
      })
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0 && resumeData.skills[0]) {
      sections.push(
        new Paragraph({
          text: 'SKILLS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: {
            bottom: {
              color: '2563EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        }),
        new Paragraph({
          text: resumeData.skills.filter((s: string) => s.trim()).join(' • '),
          spacing: { after: 200 },
        })
      )
    }

    // Certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      sections.push(
        new Paragraph({
          text: 'CERTIFICATIONS',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          border: {
            bottom: {
              color: '2563EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      )

      resumeData.certifications.forEach((cert: any) => {
        if (!cert.name) return

        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cert.name,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            text: `${cert.issuer} - ${formatDate(cert.date)}`,
            spacing: { after: 100 },
          })
        )
      })
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    })

    // Generate and download
    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${resumeData.full_name}_Resume.docx`)
  } catch (error) {
    console.error('Error generating DOCX:', error)
    alert('Failed to generate Word document')
  }
}

// ============================================
// EMAIL FUNCTION
// ============================================
export async function sendEmail(
  recipientEmail: string,
  resumeData: any,
  element: HTMLElement
): Promise<boolean> {
  try {
    // First, convert resume to PDF
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF('p', 'mm', 'a4')
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)

    // Convert PDF to base64
    const pdfBase64 = pdf.output('dataurlstring').split(',')[1]

    // Send email using your backend API
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject: `Resume - ${resumeData.full_name}`,
        text: `Please find attached the resume for ${resumeData.full_name}.`,
        pdfBase64: pdfBase64,
        fileName: `${resumeData.full_name}_Resume.pdf`,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}