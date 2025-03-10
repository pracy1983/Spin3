import { Pool } from 'pg'

// Carrega as variáveis de ambiente do PostgreSQL
const host = import.meta.env.VITE_POSTGRES_HOST
const port = import.meta.env.VITE_POSTGRES_PORT
const database = import.meta.env.VITE_POSTGRES_DATABASE
const user = import.meta.env.VITE_POSTGRES_USER
const password = import.meta.env.VITE_POSTGRES_PASSWORD
const ssl = import.meta.env.VITE_POSTGRES_SSL === 'true'

// Verifica se as variáveis necessárias estão definidas
if (!host) {
  console.error('VITE_POSTGRES_HOST não está definido')
}

if (!database) {
  console.error('VITE_POSTGRES_DATABASE não está definido')
}

if (!user) {
  console.error('VITE_POSTGRES_USER não está definido')
}

// Configuração da conexão com o PostgreSQL
const poolConfig = {
  host,
  port: port ? parseInt(port, 10) : 5432,
  database,
  user,
  password,
  ssl: ssl ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo máximo que uma conexão pode ficar inativa
  connectionTimeoutMillis: 2000, // Tempo máximo para estabelecer uma conexão
}

// Cria o pool de conexões
export const pool = new Pool(poolConfig)

// Log quando o pool é criado
console.log(`Pool de conexão PostgreSQL criado para ${host}:${port}/${database}`)

// Evento para quando uma conexão é estabelecida
pool.on('connect', () => {
  console.log('Nova conexão PostgreSQL estabelecida')
})

// Evento para quando uma conexão é liberada de volta para o pool
pool.on('release', () => {
  console.log('Conexão PostgreSQL liberada de volta para o pool')
})

// Evento para quando ocorre um erro
pool.on('error', (err) => {
  console.error('Erro no pool de conexão PostgreSQL:', err)
})

// Função para testar a conexão
export const testConnection = async () => {
  try {
    const client = await pool.connect()
    console.log('Conexão com PostgreSQL estabelecida com sucesso!')
    const result = await client.query('SELECT NOW()')
    console.log('Resultado da consulta de teste:', result.rows[0])
    client.release()
    return true
  } catch (error) {
    console.error('Erro ao conectar ao PostgreSQL:', error)
    return false
  }
}

// Função para fechar o pool de conexões
export const closePool = async () => {
  await pool.end()
  console.log('Pool de conexão PostgreSQL fechado')
}
