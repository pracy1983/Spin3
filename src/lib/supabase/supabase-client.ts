// Este arquivo agora serve como uma camada de compatibilidade para migração do Supabase para PostgreSQL
// Ele simula a API do Supabase, mas na verdade usa o PostgreSQL

import { usePostgresAuthStore } from '../../stores/postgresAuthStore'

// Criando um objeto que simula a API do Supabase
const createFakeSupabaseClient = () => {
  return {
    auth: {
      getUser: async () => {
        const { user } = usePostgresAuthStore.getState()
        return { data: { user }, error: null }
      },
      getSession: async () => {
        const { user, session } = usePostgresAuthStore.getState()
        return { 
          data: { 
            session: user ? session : null 
          }, 
          error: null 
        }
      },
      signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
        const store = usePostgresAuthStore.getState()
        try {
          const result = await store.signIn(email, password)
          if (result.error) {
            throw result.error
          }
          return { data: { user: store.user, session: store.session }, error: null }
        } catch (error) {
          return { data: { user: null }, error }
        }
      },
      signOut: async () => {
        const store = usePostgresAuthStore.getState()
        try {
          await store.signOut()
          return { error: null }
        } catch (error) {
          return { error }
        }
      },
      onAuthStateChange: (callback: any) => {
        // Como o postgresAuthStore não tem um método subscribe nativo,
        // vamos implementar uma solução alternativa usando um intervalo
        // que verifica periodicamente o estado de autenticação
        
        let previousUser = usePostgresAuthStore.getState().user
        
        const interval = setInterval(() => {
          const currentUser = usePostgresAuthStore.getState().user
          
          // Se o estado do usuário mudou, chama o callback
          if (JSON.stringify(previousUser) !== JSON.stringify(currentUser)) {
            previousUser = currentUser
            const event = currentUser ? 'SIGNED_IN' : 'SIGNED_OUT'
            callback(event, { 
              session: currentUser ? { 
                user: currentUser,
                access_token: localStorage.getItem('auth-token') || 'fake-token',
                refresh_token: 'fake-refresh-token'
              } : null 
            })
          }
        }, 1000) // Verifica a cada segundo
        
        // Retorna uma função para cancelar o intervalo
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => clearInterval(interval) 
            } 
          } 
        }
      }
    },
    // Adicione outras APIs do Supabase conforme necessário
  }
}

// Cliente público (para usuários) - singleton
export const supabase = createFakeSupabaseClient()
