import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

interface ExportError {
  message: string
  code: string
  details?: unknown
}

type ExportResult<T = void> = {
  success: boolean
  error?: ExportError
  data?: T
}

function ensureBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called in a browser environment')
  }
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'Present'
  const [year, month] = dateStr.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthIndex = parseInt(month || '1') - 1
  return `${monthNames[monthIndex] || 'Jan'} ${year}`
}


const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}

function colorToRGB(color: string): string {
  const unsupportedRegex = /(lab|lch|oklab|oklch)\(/i;
  if (!unsupportedRegex.test(color)) {
    return color;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return color;
  }

  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a = 255] = ctx.getImageData(0, 0, 1, 1).data;

  if (a === 0) {
    return 'transparent';
  }

  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

function fixUnsupportedColors(original: HTMLElement, clone: HTMLElement): void {
  const style = window.getComputedStyle(original);

  const singleColorProps = [
    'color',
    'background-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color',
    'column-rule-color',
    'fill',
    'stroke',
  ];

  const multiColorProps = [
    'box-shadow',
    'text-shadow',
    'filter',
    'background-image', 
  ];

  const unsupportedRegex = /(lab|lch|oklab|oklch)\(/i;

  singleColorProps.forEach((prop) => {
    let value = style.getPropertyValue(prop);
    if (value && unsupportedRegex.test(value)) {
      const rgbValue = colorToRGB(value);
      clone.style.setProperty(prop, rgbValue, 'important');
    }
  });

  multiColorProps.forEach((prop) => {
    let value = style.getPropertyValue(prop);
    if (value !== 'none' && value && unsupportedRegex.test(value)) {
      const newValue = value.replace(/(lab|lch|oklab|oklch)\([^)]*\)/gi, (match) => colorToRGB(match));
      clone.style.setProperty(prop, newValue, 'important');
    }
  });

  Array.from(original.children).forEach((child, index) => {
    fixUnsupportedColors(child as HTMLElement, clone.children[index] as HTMLElement);
  });
}

function createTempContainer(element: HTMLElement): { container: HTMLElement; cleanup: () => void } {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = element.offsetWidth + 'px'
  container.style.height = element.offsetHeight + 'px'
  container.style.backgroundColor = '#ffffff'
  
  const clone = element.cloneNode(true) as HTMLElement
  fixUnsupportedColors(element, clone)
  container.appendChild(clone)
  document.body.appendChild(container)
  
  return {
    container: clone,
    cleanup: () => {
      document.body.removeChild(container)
    },
  }
}



/**
 * @param element - The HTML element to convert to PDF
 * @param fileName - Base name for the file (without extension)
 * @returns Promise with success status and any error
 */
export async function downloadAsPDF(
  element: HTMLElement,
  fileName: string
): Promise<ExportResult> {
  let cleanup: (() => void) | null = null
  
  try {
    ensureBrowser()
    
    if (!element) {
      throw new Error('No element provided for PDF generation')
    }

    console.log('Generating PDF...')

    const { container, cleanup: cleanupFn } = createTempContainer(element)
    cleanup = cleanupFn

    const canvas = await html2canvas(container, {
      scale: 2, 
      useCORS: true, 
      logging: false, 
      allowTaint: false, 
      backgroundColor: '#ffffff', 
      imageTimeout: 15000,
      removeContainer: true,
      
      ignoreElements: (element) => {
        const classList = element.classList
        return (
          classList.contains('no-print') ||
          classList.contains('no-pdf') ||
          element.hasAttribute('data-html2canvas-ignore')
        )
      },
      
      windowWidth: container.offsetWidth,
      windowHeight: container.offsetHeight,
      
      foreignObjectRendering: false, 
    })

    if (cleanup) {
      cleanup()
      cleanup = null
    }

    const imgWidth = 210
    const pageHeight = 297 
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true, 
    })

    let heightLeft = imgHeight
    let position = 0

    const imgData = canvas.toDataURL('image/png', 1.0)
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const safeFileName = sanitizeFileName(fileName)
    pdf.save(`${safeFileName}_resume.pdf`)

    return { success: true }
  } catch (error) {
    console.error('Error generating PDF:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return {
      success: false,
      error: {
        message: 'Failed to generate PDF. Please try again.',
        code: 'PDF_GENERATION_ERROR',
        details: errorMessage,
      },
    }
  } finally {
    
    if (cleanup) {
      cleanup()
    }
  }
}



/**
 * Download resume as DOCX using docx library
 * @param resumeData - The resume data object
 * @returns Promise with success status and any error
 */
export async function downloadAsDocx(resumeData: any): Promise<ExportResult> {
  try {
    ensureBrowser()

    if (!resumeData) {
      throw new Error('No resume data provided')
    }

    const sections: any[] = []

    // Header with name
    if (resumeData.full_name) {
      sections.push(
        new Paragraph({
          text: resumeData.full_name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      )
    }

    const contactInfo = [
      resumeData.email,
      resumeData.phone,
      resumeData.address,
      resumeData.linkedin,
      resumeData.website,
    ].filter(Boolean).join(' | ')

    if (contactInfo) {
      sections.push(
        new Paragraph({
          text: contactInfo,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      )
    }

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
                text: exp.position || 'Position',
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
            text: exp.description || '',
            spacing: { after: 150 },
          })
        )
      })
    }

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
                text: `${edu.degree || 'Degree'} in ${edu.field || 'Field'}`,
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

    if (resumeData.skills && resumeData.skills.length > 0 && resumeData.skills[0]) {
      const validSkills = resumeData.skills.filter((s: string) => s && s.trim())
      
      if (validSkills.length > 0) {
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
            text: validSkills.join(' • '),
            spacing: { after: 200 },
          })
        )
      }
    }

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
            text: `${cert.issuer || 'Issuer'} - ${formatDate(cert.date)}`,
            spacing: { after: 100 },
          })
        )
      })
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    const safeFileName = sanitizeFileName(resumeData.full_name || 'resume')
    saveAs(blob, `${safeFileName}_resume.docx`)

    return { success: true }
  } catch (error) {
    console.error('Error generating DOCX:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return {
      success: false,
      error: {
        message: 'Failed to generate Word document. Please try again.',
        code: 'DOCX_GENERATION_ERROR',
        details: errorMessage,
      },
    }
  }
}

/**
 * Send resume via email
 * @param recipientEmail - Email address to send to
 * @param resumeData - Resume data object
 * @param element - HTML element to convert to PDF
 * @returns Promise with success status and any error
 */
export async function sendEmail(
  recipientEmail: string,
  resumeData: any,
  element: HTMLElement
): Promise<ExportResult> {
  let cleanup: (() => void) | null = null
  
  try {
    ensureBrowser()

    if (!recipientEmail || !recipientEmail.includes('@')) {
      throw new Error('Invalid email address')
    }

    if (!element) {
      throw new Error('No element provided for PDF generation')
    }

    console.log('Generating PDF for email...')

    const { container, cleanup: cleanupFn } = createTempContainer(element)
    cleanup = cleanupFn

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: false,
      imageTimeout: 15000,
      removeContainer: true,
      ignoreElements: (element) => {
        const classList = element.classList
        return (
          classList.contains('no-print') ||
          classList.contains('no-pdf') ||
          element.hasAttribute('data-html2canvas-ignore')
        )
      },
      windowWidth: container.offsetWidth,
      windowHeight: container.offsetHeight,
      foreignObjectRendering: false,
    })

    if (cleanup) {
      cleanup()
      cleanup = null
    }

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const imgData = canvas.toDataURL('image/png', 1.0)
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const pdfBase64 = pdf.output('dataurlstring').split(',')[1]

    console.log('Sending email...')

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject: `Resume - ${resumeData.full_name || 'Applicant'}`,
        text: `Please find attached the resume for ${resumeData.full_name || 'the applicant'}.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Resume for ${resumeData.full_name || 'Applicant'}</h2>
            <p>Please find the attached resume.</p>
            ${resumeData.email ? `<p>Contact: <a href="mailto:${resumeData.email}">${resumeData.email}</a></p>` : ''}
            ${resumeData.phone ? `<p>Phone: ${resumeData.phone}</p>` : ''}
          </div>
        `,
        pdfBase64: pdfBase64,
        fileName: `${sanitizeFileName(resumeData.full_name || 'resume')}_resume.pdf`,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to send email')
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return {
      success: false,
      error: {
        message: 'Failed to send email. Please try again.',
        code: 'EMAIL_SEND_ERROR',
        details: errorMessage,
      },
    }
  } finally {
    if (cleanup) {
      cleanup()
    }
  }
}

/**
 * Convert HTML element to PDF blob (useful for further processing)
 * @param element - HTML element to convert
 * @returns Promise with PDF blob or error
 */
export async function elementToPdfBlob(element: HTMLElement): Promise<ExportResult<Blob>> {
  let cleanup: (() => void) | null = null
  
  try {
    ensureBrowser()

    const { container, cleanup: cleanupFn } = createTempContainer(element)
    cleanup = cleanupFn

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (element) => {
        const classList = element.classList
        return (
          classList.contains('no-print') ||
          classList.contains('no-pdf') ||
          element.hasAttribute('data-html2canvas-ignore')
        )
      },
      windowWidth: container.offsetWidth,
      windowHeight: container.offsetHeight,
      foreignObjectRendering: false,
    })

    if (cleanup) {
      cleanup()
      cleanup = null
    }

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const imgData = canvas.toDataURL('image/png', 1.0)
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

    let heightLeft = imgHeight - pageHeight
    let position = 0

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const blob = pdf.output('blob')
    
    return { success: true, data: blob }
  } catch (error) {
    console.error('Error creating PDF blob:', error)
    
    return {
      success: false,
      error: {
        message: 'Failed to create PDF',
        code: 'PDF_BLOB_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  } finally {
    if (cleanup) {
      cleanup()
    }
  }
}