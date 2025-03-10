// Funções de API para autenticação
// Estas funções são usadas no frontend para se comunicar com o backend

// Tipos para autenticação
export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Session {
  access_token: string;
  expires_at: string;
  user?: User;
}

export interface AuthResponse {
  data?: {
    user?: User;
    session?: Session | null;
  };
  error?: {
    message: string;
  };
}

// Função para fazer login
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    // No ambiente de desenvolvimento, simulamos a API com uma chamada ao backend
    if (import.meta.env.DEV) {
      // Verificar se as credenciais são do usuário admin
      if (email === 'admin@example.com' && password === 'admin123') {
        // Simular um login bem-sucedido
        const user: User = {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          email: 'admin@example.com',
          role: 'admin'
        };
        
        // Criar um token JWT simulado
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MTYxNjI4MDAsImV4cCI6MTYxNjc2NzYwMH0.simulated-token';
        
        // Criar uma data de expiração (7 dias a partir de agora)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        return {
          data: {
            user,
            session: {
              access_token: token,
              expires_at: expiresAt.toISOString(),
              user
            }
          }
        };
      } else {
        // Credenciais inválidas
        return {
          error: {
            message: 'Credenciais inválidas'
          }
        };
      }
    } else {
      // Em produção, faríamos uma chamada real à API
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      return await response.json();
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return {
      error: {
        message: 'Erro ao fazer login'
      }
    };
  }
}

// Função para verificar sessão
export async function getSession(token?: string): Promise<AuthResponse> {
  try {
    // No ambiente de desenvolvimento, simulamos a API
    if (import.meta.env.DEV) {
      if (!token) {
        return { data: { session: null } };
      }
      
      // Simular um token válido
      if (token.includes('simulated-token')) {
        const user: User = {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          email: 'admin@example.com',
          role: 'admin'
        };
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        return {
          data: {
            session: {
              access_token: token,
              expires_at: expiresAt.toISOString(),
              user
            }
          }
        };
      } else {
        return { data: { session: null } };
      }
    } else {
      // Em produção, faríamos uma chamada real à API
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return await response.json();
    }
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return { data: { session: null } };
  }
}

// Função para fazer logout
export async function signOut(token?: string): Promise<AuthResponse> {
  try {
    // No ambiente de desenvolvimento, simulamos a API
    if (import.meta.env.DEV) {
      return { error: undefined };
    } else {
      // Em produção, faríamos uma chamada real à API
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return await response.json();
    }
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return {
      error: {
        message: 'Erro ao fazer logout'
      }
    };
  }
}

// Função para registrar um novo usuário
export async function signUp(email: string, password: string, role: string = 'user'): Promise<AuthResponse> {
  try {
    // No ambiente de desenvolvimento, simulamos a API
    if (import.meta.env.DEV) {
      // Simular um registro bem-sucedido
      const user: User = {
        id: 'simulated-id',
        email,
        role
      };
      
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNpbXVsYXRlZC1pZCIsImVtYWlsIjoic2ltdWxhdGVkQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2MTYxNjI4MDAsImV4cCI6MTYxNjc2NzYwMH0.simulated-token';
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      return {
        data: {
          user,
          session: {
            access_token: token,
            expires_at: expiresAt.toISOString()
          }
        }
      };
    } else {
      // Em produção, faríamos uma chamada real à API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      });
      
      return await response.json();
    }
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return {
      error: {
        message: 'Erro ao registrar usuário'
      }
    };
  }
}
