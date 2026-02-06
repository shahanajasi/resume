// types/database.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string
          user_id: string
          title: string
          job_title: string  // This must match your database
          full_name: string
          email: string
          phone: string | null
          address: string | null
          linkedin: string | null
          website: string | null
          summary: string | null
          experience: Json
          education: Json
          skills: Json
          certifications: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          job_title: string  // This must match your database
          full_name: string
          email: string
          phone?: string | null
          address?: string | null
          linkedin?: string | null
          website?: string | null
          summary?: string | null
          experience?: Json
          education?: Json
          skills?: Json
          certifications?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          job_title?: string  // This must match your database
          full_name?: string
          email?: string
          phone?: string | null
          address?: string | null
          linkedin?: string | null
          website?: string | null
          summary?: string | null
          experience?: Json
          education?: Json
          skills?: Json
          certifications?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}