-- Script para recriar a estrutura do banco mantendo os usuários
-- Remover triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;

-- Remover funções existentes
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Remover políticas existentes
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by users who created them" ON public.profiles;

-- Remover tabela existente
DROP TABLE IF EXISTS public.profiles;

-- Agora criar tudo novamente
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar tabela de perfis
CREATE TABLE public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text not null,
    role text not null check (role in ('admin', 'user')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Public profiles are viewable by everyone."
    ON profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING ( auth.uid() = id );

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    new.updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$;

-- Criar trigger para atualizar o updated_at
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();

-- Criar função para lidar com novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'user'));
    RETURN new;
END;
$$;

-- Criar trigger para novos usuários
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();

-- IMPORTANTE: Este script mantém os usuários existentes na tabela auth.users
-- e apenas recria a estrutura de perfis e políticas de segurança
