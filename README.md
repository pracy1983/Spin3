# SpinSelling


Sistema de vendas baseado no projeto AskPod, utilizando Clean Architecture e princípios SOLID.



## Estrutura do Projeto



```

src/

├── application/     # Casos de uso e regras de aplicação

├── domain/         # Entidades e regras de negócio

├── infrastructure/ # Implementações concretas (banco de dados, serviços externos)

└── interfaces/     # Controllers, views e apresentação

```



## Tecnologias Utilizadas



- Python

- FastAPI

- SQLAlchemy

- Tailwind CSS

- React/Next.js



## Como Iniciar



1. Clone o repositório

2. Instale as dependências

3. Configure as variáveis de ambiente

4. Execute o servidor de desenvolvimento



## Desenvolvimento



Este projeto segue os princípios de Clean Architecture e SOLID para garantir:



- Separação clara de responsabilidades

- Independência de frameworks

- Testabilidade

- Manutenibilidade

- Flexibilidade para mudanças



## Migração para PostgreSQL

A aplicação foi migrada do Supabase para um servidor PostgreSQL local. As seguintes alterações foram feitas:

1. Substituição do cliente Supabase por uma camada de compatibilidade que usa PostgreSQL
2. Substituição do cliente Admin do Supabase por uma versão compatível com PostgreSQL
3. Criação do cliente PostgreSQL para estabelecer a conexão com o banco de dados
4. Atualização dos componentes para usar o `postgresAuthStore`

### Variáveis de ambiente necessárias

As seguintes variáveis de ambiente devem ser configuradas no Netlify:

```
VITE_POSTGRES_HOST=easypanel.server.pracy.com.br
VITE_POSTGRES_PORT=5432
VITE_POSTGRES_DATABASE=spin3_db
VITE_POSTGRES_USER=postgres
VITE_POSTGRES_PASSWORD=123qwe123
VITE_POSTGRES_SSL=false
VITE_JWT_SECRET=chave1983272af3
```

Após configurar as variáveis de ambiente, é necessário forçar um novo deploy no Netlify.
