import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase/supabase-client'

// Tipagem do usuário
interface User {
  id: string
  email: string
  role: 'admin' | 'user'
}

// Tipagem do estado de autenticação
interface AuthState {
  user: User | null
  session: any | null
  isLoading: boolean
  initialized: boolean
  error: string | null
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      initialized: false,
      error: null,

      initialize: async () => {
        if (get().initialized) {
          console.log('AuthStore: Já inicializado')
          return
        }

        console.log('AuthStore: Inicializando...')
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            console.log('AuthStore: Sessão encontrada para:', session.user.email)
            set({ 
              user: {
                id: session.user.id,
                email: session.user.email!,
                role: session.user.user_metadata?.role || 'user'
              },
              session,
              error: null,
              isLoading: false,
              initialized: true
            })
          } else {
            console.log('AuthStore: Nenhuma sessão encontrada')
            set({ 
              user: null, 
              session: null, 
              error: null, 
              isLoading: false,
              initialized: true 
            })
          }

          // Listener para mudanças de autenticação
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('AuthStore: Mudança de estado:', event, session?.user?.email)
              
              if (session?.user) {
                set({ 
                  user: {
                    id: session.user.id,
                    email: session.user.email!,
                    role: session.user.user_metadata?.role || 'user'
                  },
                  session,
                  error: null,
                  isLoading: false
                })
              } else {
                set({ 
                  user: null, 
                  session: null, 
                  error: null, 
                  isLoading: false 
                })
              }
            }
          )

          // Cleanup do listener quando o store for destruído
          return () => {
            subscription.unsubscribe()
          }
        } catch (error: any) {
          console.error('AuthStore: Erro ao inicializar:', error)
          set({ 
            error: error.message, 
            isLoading: false,
            initialized: true 
          })
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          console.log('AuthStore: Tentando login...')
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            console.error('AuthStore: Erro no login:', error)
            throw error
          }

          if (data.user) {
            console.log('AuthStore: Login bem sucedido para:', data.user.email)
            set({ 
              user: {
                id: data.user.id,
                email: data.user.email!,
                role: data.user.user_metadata?.role || 'user'
              },
              session: data.session,
              error: null,
              isLoading: false
            })
          }

          return { error: null }
        } catch (error: any) {
          console.error('AuthStore: Erro no login:', error)
          set({ error: error.message, user: null, session: null, isLoading: false })
          return { error }
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        try {
          console.log('AuthStore: Iniciando logout...')
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          set({ user: null, session: null, error: null, isLoading: false })
          console.log('AuthStore: Logout bem sucedido')
        } catch (error: any) {
          console.error('AuthStore: Erro no logout:', error)
          set({ error: error.message, isLoading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
)
