type ResumeData = {
  full_name: string
  email: string
  phone: string
  address: string
  linkedin?: string
  website?: string
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

type Props = {
  data: ResumeData
}

export default function ResumeTemplate({ data }: Props) {
  // Format date from YYYY-MM to "Month YYYY"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Present'
    const [year, month] = dateStr.split('-')
    if (!month || !year) return 'Present'
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="p-12 bg-white text-gray-900" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header Section */}
      <header className="text-center border-b-4 border-blue-600 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {data.full_name}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          {data.email && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {data.email}
            </span>
          )}
          
          {data.phone && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              {data.phone}
            </span>
          )}
          
          {data.address && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {data.address}
            </span>
          )}
          
          {data.linkedin && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              {data.linkedin}
            </span>
          )}
          
          {data.website && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              {data.website}
            </span>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 border-b-2 border-gray-300 pb-2 mb-3">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {data.experience && data.experience.length > 0 && data.experience[0] && data.experience[0].company && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 border-b-2 border-gray-300 pb-2 mb-3">
            WORK EXPERIENCE
          </h2>
          
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                  <p className="text-gray-700 font-semibold">{exp.company}</p>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {exp.description}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && data.education[0] && data.education[0].school && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 border-b-2 border-gray-300 pb-2 mb-3">
            EDUCATION
          </h2>
          
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{edu.degree} in {edu.field}</h3>
                  <p className="text-gray-700">{edu.school}</p>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(edu.graduation_date)}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && data.skills[0] && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 border-b-2 border-gray-300 pb-2 mb-3">
            SKILLS
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.filter(skill => skill.trim()).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && data.certifications[0] && data.certifications[0].name && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 border-b-2 border-gray-300 pb-2 mb-3">
            CERTIFICATIONS
          </h2>
          
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{cert.name}</h3>
                  <p className="text-gray-700 text-sm">{cert.issuer}</p>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(cert.date)}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}