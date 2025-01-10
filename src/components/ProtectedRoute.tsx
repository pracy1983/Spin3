import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout

    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: Usuário não autenticado, redirecionando...')
      setShouldRedirect(true)
      redirectTimeout = setTimeout(() => {
        navigate('/login', { replace: true })
      }, 100)
    }

    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout)
      }
    }
  }, [isLoading, isAuthenticated, navigate])

  if (isLoading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
