import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { signIn, signOut, getSession } from '../lib/api/auth-api'

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

export const usePostgresAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      initialized: false,
      error: null,

      initialize: async () => {
        if (get().initialized && get().user) {
          console.log('AuthStore: Já inicializado com usuário:', get().user.email)
          set({ isLoading: false })
          return
        }

        console.log('AuthStore: Inicializando...')
        try {
          // Recuperar token do localStorage
          const token = localStorage.getItem('auth-token')
          
          if (!token) {
            console.log('AuthStore: Nenhum token encontrado')
            set({ 
              user: null, 
              session: null, 
              error: null, 
              isLoading: false,
              initialized: true 
            })
            return
          }
          
          const response = await getSession(token)
          const session = response.data?.session
          
          if (session?.user) {
            console.log('AuthStore: Sessão encontrada para:', session.user.email)
            set({ 
              user: {
                id: session.user.id,
                email: session.user.email,
                role: session.user.role as 'admin' | 'user' || 'user'
              },
              session,
              error: null,
              isLoading: false,
              initialized: true
            })
          } else {
            console.log('AuthStore: Nenhuma sessão válida encontrada')
            // Limpar token inválido
            localStorage.removeItem('auth-token')
            set({ 
              user: null, 
              session: null, 
              error: null, 
              isLoading: false,
              initialized: true 
            })
          }
        } catch (error: any) {
          console.error('AuthStore: Erro ao inicializar:', error)
          // Em caso de erro, limpar o token
          localStorage.removeItem('auth-token')
          set({ 
            user: null,
            session: null,
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
          const response = await signIn(email, password)

          if (response.error) {
            console.error('AuthStore: Erro no login:', response.error)
            throw response.error
          }

          if (response.data?.user) {
            console.log('AuthStore: Login bem sucedido para:', response.data.user.email)
            
            // Salvar token no localStorage
            if (response.data.session?.access_token) {
              localStorage.setItem('auth-token', response.data.session.access_token)
            }
            
            const user = {
              id: response.data.user.id,
              email: response.data.user.email,
              role: response.data.user.role as 'admin' | 'user' || 'user'
            }
            
            set({ 
              user,
              session: response.data.session,
              error: null,
              isLoading: false,
              initialized: true
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
          
          // Recuperar token do localStorage
          const token = localStorage.getItem('auth-token')
          const response = await signOut(token || undefined)
          
          if (response.error) throw response.error
          
          // Remover token do localStorage
          localStorage.removeItem('auth-token')
          
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        initialized: state.initialized
      })
    }
  )
)
