// Script para testar a conexão com o PostgreSQL
import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Configurar o path para o arquivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');

// Carregar manualmente o arquivo .env
console.log(`Tentando carregar o arquivo .env de: ${envPath}`);
let envConfig = {};

try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      // Ignorar linhas de comentário ou vazias
      if (line.trim().startsWith('#') || line.trim() === '') continue;
      
      // Extrair chave e valor
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      
      if (key && value) {
        envConfig[key.trim()] = value;
      }
    }
    
    console.log('Arquivo .env carregado com sucesso!');
  } else {
    console.error('Arquivo .env não encontrado!');
  }
} catch (error) {
  console.error('Erro ao carregar o arquivo .env:', error);
}

const { Pool } = pg;

// Função para testar a conexão
async function testConnection(config, description) {
  console.log(`\nTestando conexão ${description}...`);
  console.log('Configuração:', JSON.stringify({
    ...config,
    password: config.password ? '******' : '' // Ocultar senha no log
  }, null, 2));
  
  const pool = new Pool(config);
  
  try {
    console.log('Tentando conectar...');
    const client = await pool.connect();
    console.log('✅ Conexão bem-sucedida!');
    
    // Testar uma consulta simples
    const result = await client.query('SELECT version()');
    console.log('Versão do PostgreSQL:', result.rows[0].version);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
    await pool.end();
    return false;
  }
}

// Configurações de conexão do arquivo .env
const postgresConfig = {
  host: envConfig.VITE_POSTGRES_HOST || 'easypanel.server.pracy.com.br',
  port: parseInt(envConfig.VITE_POSTGRES_PORT || '5432'),
  database: envConfig.VITE_POSTGRES_DATABASE || 'spin3_db',
  user: envConfig.VITE_POSTGRES_USER || 'postgres',
  password: envConfig.VITE_POSTGRES_PASSWORD || '123qwe123',
  ssl: envConfig.VITE_POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Configuração com valores fixos para teste
const hardcodedConfig = {
  host: 'easypanel.server.pracy.com.br',
  port: 5432,
  database: 'spin3_db',
  user: 'postgres',
  password: '123qwe123',
  ssl: false
};

async function runTests() {
  console.log('=== TESTE DE CONEXÃO COM POSTGRESQL ===');
  console.log('Variáveis de ambiente encontradas:');
  console.log(`VITE_POSTGRES_HOST: ${envConfig.VITE_POSTGRES_HOST || 'não definido'}`);
  console.log(`VITE_POSTGRES_PORT: ${envConfig.VITE_POSTGRES_PORT || 'não definido'}`);
  console.log(`VITE_POSTGRES_DATABASE: ${envConfig.VITE_POSTGRES_DATABASE || 'não definido'}`);
  console.log(`VITE_POSTGRES_USER: ${envConfig.VITE_POSTGRES_USER || 'não definido'}`);
  console.log(`VITE_POSTGRES_PASSWORD: ${envConfig.VITE_POSTGRES_PASSWORD ? '******' : 'não definido'}`);
  console.log(`VITE_POSTGRES_SSL: ${envConfig.VITE_POSTGRES_SSL || 'não definido'}`);
  
  // Testar com as configurações do .env
  const envSuccess = await testConnection(postgresConfig, 'usando configurações do .env');
  
  // Se falhar, testar com configurações fixas
  if (!envSuccess) {
    console.log('\nTentando com configurações fixas...');
    await testConnection(hardcodedConfig, 'usando configurações fixas');
  }
}

runTests().catch(error => {
  console.error('Erro ao executar testes:', error);
});
