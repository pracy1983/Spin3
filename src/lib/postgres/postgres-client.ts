import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { POSTGRES_CONFIG, JWT_SECRET } from '../../config/env';

// Configuração do pool de conexões
const pool = new Pool(POSTGRES_CONFIG);

// Classe para gerenciar autenticação
export class AuthManager {
  // Registrar um novo usuário
  static async signUp(email: string, password: string, role: string = 'user') {
    try {
      // Verificar se o usuário já existe
      const userCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userCheck.rows.length > 0) {
        return { error: { message: 'Usuário já existe' } };
      }

      // Hash da senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Criar o usuário
      const userId = uuidv4();
      const result = await pool.query(
        'INSERT INTO users (id, email, encrypted_password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
        [userId, email, hashedPassword, role]
      );

      const user = result.rows[0];
      
      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Salvar sessão
      const sessionId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

      await pool.query(
        'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
        [sessionId, user.id, token, expiresAt]
      );

      return { 
        data: { 
          user, 
          session: { 
            access_token: token,
            expires_at: expiresAt.toISOString()
          } 
        } 
      };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { error: { message: 'Erro ao registrar usuário' } };
    }
  }

  // Login de usuário
  static async signIn(email: string, password: string) {
    try {
      // Buscar usuário
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return { error: { message: 'Credenciais inválidas' } };
      }

      const user = result.rows[0];

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.encrypted_password);
      if (!isPasswordValid) {
        return { error: { message: 'Credenciais inválidas' } };
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Salvar sessão
      const sessionId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

      await pool.query(
        'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
        [sessionId, user.id, token, expiresAt]
      );

      return { 
        data: { 
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }, 
          session: { 
            access_token: token,
            expires_at: expiresAt.toISOString()
          } 
        } 
      };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { error: { message: 'Erro ao fazer login' } };
    }
  }

  // Verificar sessão
  static async getSession(token?: string) {
    try {
      if (!token) {
        return { data: { session: null } };
      }

      // Verificar se o token é válido
      try {
        jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return { data: { session: null } };
      }

      // Verificar se a sessão existe e não expirou
      const result = await pool.query(
        'SELECT s.*, u.email, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        return { data: { session: null } };
      }

      const session = result.rows[0];

      return { 
        data: { 
          session: {
            access_token: token,
            expires_at: session.expires_at,
            user: {
              id: session.user_id,
              email: session.email,
              role: session.role
            }
          } 
        } 
      };
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      return { data: { session: null } };
    }
  }

  // Logout
  static async signOut(token?: string) {
    try {
      if (!token) {
        return { error: null };
      }

      // Remover sessão
      await pool.query(
        'DELETE FROM sessions WHERE token = $1',
        [token]
      );

      return { error: null };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { error: { message: 'Erro ao fazer logout' } };
    }
  }
}

// Classe para gerenciar transcrições
export class TranscriptionManager {
  // Salvar uma transcrição
  static async saveTranscription(userId: string, content: string, language: string = 'pt-BR', source: string = 'microphone') {
    try {
      const result = await pool.query(
        'INSERT INTO transcriptions (user_id, content, language, source) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, content, language, source]
      );

      return { data: result.rows[0], error: null };
    } catch (error) {
      console.error('Erro ao salvar transcrição:', error);
      return { data: null, error: { message: 'Erro ao salvar transcrição' } };
    }
  }

  // Buscar transcrições de um usuário
  static async getUserTranscriptions(userId: string) {
    try {
      const result = await pool.query(
        'SELECT * FROM transcriptions WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      return { data: result.rows, error: null };
    } catch (error) {
      console.error('Erro ao buscar transcrições:', error);
      return { data: null, error: { message: 'Erro ao buscar transcrições' } };
    }
  }
}

// Classe para gerenciar sugestões de IA
export class AISuggestionManager {
  // Salvar uma sugestão
  static async saveSuggestion(transcriptionId: string, content: string) {
    try {
      const result = await pool.query(
        'INSERT INTO ai_suggestions (transcription_id, content) VALUES ($1, $2) RETURNING *',
        [transcriptionId, content]
      );

      return { data: result.rows[0], error: null };
    } catch (error) {
      console.error('Erro ao salvar sugestão:', error);
      return { data: null, error: { message: 'Erro ao salvar sugestão' } };
    }
  }

  // Buscar sugestões para uma transcrição
  static async getTranscriptionSuggestions(transcriptionId: string) {
    try {
      const result = await pool.query(
        'SELECT * FROM ai_suggestions WHERE transcription_id = $1 ORDER BY created_at DESC',
        [transcriptionId]
      );

      return { data: result.rows, error: null };
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      return { data: null, error: { message: 'Erro ao buscar sugestões' } };
    }
  }
}

// Exportar o pool para uso direto se necessário
export const postgres = pool;
