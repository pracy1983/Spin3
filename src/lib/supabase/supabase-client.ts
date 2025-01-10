import { createClient } from '@supabase/supabase-js'

// Carrega as variáveis de ambiente
const supabaseUrl = 'https://mmdtsjxtwlphojcrakow.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZHRzanh0d2xwaG9qY3Jha293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NDY0ODYsImV4cCI6MjA1MTUyMjQ4Nn0.ScQ5QE7-jobQ0n9y-0v_We3KB_lotQGqnbnY6fWrHPQ'

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL é necessário')
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY é necessário')
}

// Cliente público (para usuários) - singleton
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'spin3-auth-token'
      }
    })
  }
  return supabaseInstance
})()
