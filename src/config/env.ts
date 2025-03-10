// Arquivo de configuração para variáveis de ambiente
// Este arquivo centraliza o acesso às variáveis de ambiente para facilitar a manutenção

// Configurações do PostgreSQL
export const POSTGRES_CONFIG = {
  host: import.meta.env.VITE_POSTGRES_HOST || 'easypanel.server.pracy.com.br',
  port: parseInt(import.meta.env.VITE_POSTGRES_PORT || '5432'),
  database: import.meta.env.VITE_POSTGRES_DATABASE || 'spin3_db',
  user: import.meta.env.VITE_POSTGRES_USER || 'postgres',
  password: import.meta.env.VITE_POSTGRES_PASSWORD || '123qwe123',
  ssl: import.meta.env.VITE_POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Chave secreta para JWT
export const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'chave1983272af3';

// Configurações do Supabase (mantidas para compatibilidade)
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
};

// Configurações do OpenAI
export const OPENAI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || ''
};

// Configurações do Deepseek
export const DEEPSEEK_CONFIG = {
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || ''
};

// Configurações do Azure Speech
export const AZURE_SPEECH_CONFIG = {
  key: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
  region: import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus',
  endpoint: import.meta.env.VITE_AZURE_SPEECH_ENDPOINT || 'https://eastus.api.cognitive.microsoft.com/'
};
