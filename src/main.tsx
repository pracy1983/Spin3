import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './app/page'
import LoginPage from './app/login/page'
import { Layout } from './components/Layout'
import './index.css'

// Inicializa o Supabase
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'

function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
