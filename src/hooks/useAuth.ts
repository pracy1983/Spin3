import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/supabase-client'

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Função para verificar a sessão atual
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata?.role || 'admin'
          })
          setIsAuthenticated(true)
        } else if (mounted) {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err)
        if (mounted) {
          setError(err as string)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    // Verifica a sessão inicial
    checkSession()

    // Inscreve para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata?.role || 'admin'
        })
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    })

    // Limpa a inscrição quando o componente é desmontado
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Executa apenas uma vez na montagem

  return {
    user,
    isLoading,
    isAuthenticated,
    error
  }
}
