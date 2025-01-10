import { DollarSign, LogOut } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase/supabase-client'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      // Primeiro faz logout no Supabase
      await signOut()

      // Limpa o localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.startsWith('auth-')) {
          localStorage.removeItem(key)
        }
      })

      // Redireciona para login
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 transition-all duration-300">
      <header className="bg-gray-800 shadow-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo e título */}
          <div className="flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">SpinSeller Helper</h1>
          </div>
          
          {/* Botão de logout */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4">{children}</main>
    </div>
  )
}
