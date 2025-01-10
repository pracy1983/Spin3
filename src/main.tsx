import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import HomePage from './app/page'
import LoginPage from './app/login/page'
import { Layout } from './components/Layout'
import './index.css'
import { useAuthStore } from './stores/authStore'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initialized } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!initialized || isLoading) return

    const isLoginPage = location.pathname === '/login'
    const isAuthenticated = !!user

    if (isAuthenticated && isLoginPage) {
      console.log('AuthGuard: Usuário autenticado, redirecionando para home')
      navigate('/', { replace: true })
    } else if (!isAuthenticated && !isLoginPage) {
      console.log('AuthGuard: Usuário não autenticado, redirecionando para login')
      navigate('/login', { replace: true, state: { from: location } })
    }
  }, [user, isLoading, initialized, location, navigate])

  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <AuthGuard>
          <LoginPage />
        </AuthGuard>
      } />
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
  const { initialize } = useAuthStore()

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
