import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import HomePage from './app/page'
import LoginPage from './app/login/page'
import { Layout } from './components/Layout'
import './index.css'
// Importando o novo store de autenticação
import { usePostgresAuthStore } from './stores/postgresAuthStore'

function AuthGuard({ children }: { children: React.ReactNode }) {
  // Usando o novo store de autenticação
  const { user, isLoading, initialized } = usePostgresAuthStore()
  const location = useLocation()

  // Verificar se o usuário está autenticado
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Se não estiver autenticado, redirecionar para login
  if (!user) {
    console.log('AuthGuard: Usuário não autenticado, redirecionando para login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Se estiver autenticado, renderizar o conteúdo protegido
  return <>{children}</>
}

function LoginRoute() {
  const { user, isLoading, initialized } = usePostgresAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Só verificar redirecionamento quando a inicialização estiver completa
    if (!initialized || isLoading) return

    // Se o usuário estiver autenticado e estiver na página de login, redirecionar para home
    if (user) {
      console.log('LoginRoute: Usuário autenticado, redirecionando para home')
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [user, isLoading, initialized, navigate, location])

  // Renderizar a página de login normalmente
  return <LoginPage />
}

function AppRoutes() {
  return (
    <Routes>
      {/* A rota de login NÃO usa AuthGuard */}
      <Route path="/login" element={<LoginRoute />} />
      
      {/* Rotas protegidas usam AuthGuard */}
      <Route path="/" element={
        <AuthGuard>
          <Layout>
            <HomePage />
          </Layout>
        </AuthGuard>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  // Usando o novo store de autenticação
  const { initialize } = usePostgresAuthStore()

  useEffect(() => {
    let mounted = true
    initialize().finally(() => {
      if (mounted) {
        console.log('App: Inicialização completa')
      }
    })
    return () => {
      mounted = false
    }
  }, [initialize])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
