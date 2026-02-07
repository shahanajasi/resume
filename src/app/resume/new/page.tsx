'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '~/lib/supabase'

export default function NewResume() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    title: '',
    full_name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    website: '',
    summary: '',
    experience: [
      {
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        description: ''
      }
    ],
    education: [
      {
        school: '',
        degree: '',
        field: '',
        graduation_date: ''
      }
    ],
    skills: [''],
    certifications: [
      {
        name: '',
        issuer: '',
        date: ''
      }
    ]
  })

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { company: '', position: '', start_date: '', end_date: '', description: '' }
      ]
    })
  }

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { school: '', degree: '', field: '', graduation_date: '' }
      ]
    })
  }

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, '']
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data, error } = await supabase
      .from('resumes')
      .insert([
        {
          user_id: userData.user.id,
          ...formData
        }
      ])
      .select()

    if (error) {
      alert('Error saving resume: ' + error.message)
    } else if (data) {
      router.push(`/resume/${data[0].id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Create New Resume</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block mb-2 font-semibold">Resume Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., Software Engineer Resume"
              required
            />
          </div>

          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  placeholder='e.g., John Doe'
                />
              </div>
              
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  placeholder='e.g., 6oM6A@example.com'
                />
              </div>
              
              <div>
                <label className="block mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder='e.g., (123) 456-7890'
                 />
              </div>
              
              <div>
                <label className="block mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder='e.g., 123 Main Street, City, State'
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">Professional Summary</h2>
            <textarea
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              className="w-full p-2 border rounded h-32"
              placeholder="Brief summary of your professional background..."
            />
          </div>

          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">Work Experience</h2>
            {formData.experience.map((exp, index) => (
              <div key={index} className="mb-6 p-4 border rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...formData.experience]
                        if (newExp[index]) {
                          newExp[index].company = e.target.value
                        }
                        handleChange('experience', newExp)
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., Google"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2">Position</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => {
                        const newExp = [...formData.experience]
                        if (newExp[index]) {
                          newExp[index].position = e.target.value
                        }
                        handleChange('experience', newExp)
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2">Start Date</label>
                    <input
                      type="month"
                      value={exp.start_date}
                      onChange={(e) => {
                        const newExp = [...formData.experience]
                        if (newExp[index]) {
                          newExp[index].start_date = e.target.value
                        }
                        handleChange('experience', newExp)
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., 2020-01"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2">End Date</label>
                    <input
                      type="month"
                      value={exp.end_date}
                      onChange={(e) => {
                        const newExp = [...formData.experience]
                        if (newExp[index]) {
                          newExp[index].end_date = e.target.value
                        }
                        handleChange('experience', newExp)
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="Present"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block mb-2">Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => {
                      const newExp = [...formData.experience]
                      if (newExp[index]) {
                        newExp[index].description = e.target.value
                      }
                      handleChange('experience', newExp)
                    }}
                    className="w-full p-2 border rounded h-24"
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addExperience}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              + Add Experience
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Resume
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}