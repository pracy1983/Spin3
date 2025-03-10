import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePostgresAuthStore } from '../../stores/postgresAuthStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { signIn } = usePostgresAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  // Verifica mensagem de sucesso no state
  useEffect(() => {
    const message = location.state?.message
    if (message) {
      setSuccessMessage(message)
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      console.log('LoginPage: Tentando fazer login...')
      const { error: signInError } = await signIn(email, password)
      
      if (signInError) {
        console.error('LoginPage: Erro no login:', signInError)
        if (signInError.message.includes('Credenciais inválidas')) {
          setError('Email ou senha inválidos')
        } else {
          setError(signInError.message)
        }
        return
      }

      console.log('LoginPage: Login bem sucedido!')
      // Redirecionar para a página principal após login bem-sucedido
      navigate('/')
    } catch (err: any) {
      console.error('LoginPage: Erro no login:', err)
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center items-center mb-4">
          <img src="/sales.svg" alt="SpinSeller Logo" className="h-12 mr-2 text-white" />
          <span className="text-2xl font-bold text-white">SpinSeller Helper</span>
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Entre na sua conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
              />
            </div>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{successMessage}</div>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
