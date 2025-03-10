// Tipagem do usuário
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

// Tipagem do estado de autenticação
export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}
