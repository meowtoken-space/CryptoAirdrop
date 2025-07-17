# PLANO DE IMPLEMENTAÇÃO: SISTEMA DE LOGIN MEOW TOKEN

## 1. VISÃO GERAL

### 1.1 Objetivo
Implementar um sistema de autenticação completo para o MEOW Token com:
- Página de boas-vindas
- Autenticação via Google
- Formulário flip-card para login/registro
- Verificação de email
- Integração com o restante da plataforma

### 1.2 Escopo
- **Dentro do escopo:** Autenticação, registro, verificação, integração Google
- **Fora do escopo:** Funcionalidades pós-login, recuperação de senha (fase 2)

### 1.3 Equipe
- Desenvolvedor Frontend (Replit)
- Desenvolvedor Backend (Replit)
- Revisor de Código (Opcional)

## 2. CRONOGRAMA DETALHADO

### 2.1 Fase 1: Configuração e Preparação (Dia 1)
- [x] Criar projeto no Replit
- [ ] Configurar estrutura de pastas
- [ ] Instalar dependências necessárias
- [ ] Configurar banco de dados Supabase
- [ ] Configurar projeto no Google Cloud para OAuth
- [ ] Definir variáveis de ambiente

### 2.2 Fase 2: Desenvolvimento Frontend (Dias 2-3)
- [ ] Implementar página de boas-vindas
- [ ] Implementar formulário flip-card
- [ ] Adicionar validação de formulários
- [ ] Integrar botão de login Google
- [ ] Implementar página de verificação de email
- [ ] Criar componentes de feedback (loading, sucesso, erro)
- [ ] Implementar responsividade

### 2.3 Fase 3: Desenvolvimento Backend (Dias 4-5)
- [ ] Implementar rotas de autenticação
- [ ] Configurar autenticação Google OAuth
- [ ] Implementar sistema de sessões
- [ ] Criar sistema de verificação de email
- [ ] Implementar proteção de rotas
- [ ] Configurar middleware de segurança

### 2.4 Fase 4: Testes e Otimização (Dia 6)
- [ ] Testar todos os fluxos de autenticação
- [ ] Corrigir bugs identificados
- [ ] Otimizar performance
- [ ] Realizar testes de segurança
- [ ] Validar em diferentes dispositivos

### 2.5 Fase 5: Lançamento (Dia 7)
- [ ] Revisão final de código
- [ ] Documentação de API
- [ ] Implementação em produção
- [ ] Monitoramento inicial

## 3. RECURSOS NECESSÁRIOS

### 3.1 Tecnologias
- **Frontend:** React, CSS, JavaScript
- **Backend:** Node.js, Express
- **Banco de Dados:** Supabase
- **Autenticação:** Google OAuth 2.0
- **Email:** Serviço SMTP (SendGrid ou similar)

### 3.2 Dependências
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "nodemailer": "^6.9.3",
    "googleapis": "^118.0.0",
    "@supabase/supabase-js": "^2.26.0",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}
```

### 3.3 Serviços Externos
- **Google Cloud Platform:**
  - Projeto configurado para OAuth
  - Credenciais de API
  - URIs de redirecionamento configurados
- **Supabase:**
  - Projeto criado
  - Tabelas configuradas
  - Políticas de segurança definidas
- **Serviço de Email:**
  - Conta configurada
  - Templates de email criados
  - Domínio verificado

## 4. ESTRUTURA DE ARQUIVOS

```
meow-token-auth/
├── client/                     # Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Welcome.jsx     # Página de boas-vindas
│   │   │   ├── FlipCard.jsx    # Componente de login/registro
│   │   │   ├── GoogleAuth.jsx  # Componente de autenticação Google
│   │   │   └── Verification.jsx # Página de verificação
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx # Contexto de autenticação
│   │   ├── services/
│   │   │   ├── api.js          # Serviço de API
│   │   │   └── auth.js         # Serviço de autenticação
│   │   ├── styles/
│   │   │   ├── global.css      # Estilos globais
│   │   │   └── auth.css        # Estilos de autenticação
│   │   ├── App.jsx             # Componente principal
│   │   └── index.jsx           # Ponto de entrada
│   └── package.json
├── server/                     # Backend
│   ├── controllers/
│   │   ├── authController.js   # Controlador de autenticação
│   │   └── userController.js   # Controlador de usuário
│   ├── middleware/
│   │   ├── auth.js             # Middleware de autenticação
│   │   └── validation.js       # Middleware de validação
│   ├── routes/
│   │   ├── auth.js             # Rotas de autenticação
│   │   └── user.js             # Rotas de usuário
│   ├── services/
│   │   ├── emailService.js     # Serviço de email
│   │   └── googleAuthService.js # Serviço de autenticação Google
│   ├── utils/
│   │   ├── tokens.js           # Utilitário de tokens
│   │   └── validation.js       # Utilitário de validação
│   ├── config.js               # Configurações
│   ├── db.js                   # Conexão com banco de dados
│   ├── server.js               # Ponto de entrada
│   └── package.json
├── .env                        # Variáveis de ambiente
├── .gitignore
└── README.md
```

## 5. ESPECIFICAÇÕES TÉCNICAS DETALHADAS

### 5.1 Banco de Dados

#### 5.1.1 Tabela `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  google_id VARCHAR(255),
  profile_picture VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
```

#### 5.1.2 Tabela `verification_tokens`
```sql
CREATE TABLE verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);
```

#### 5.1.3 Tabela `sessions`
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

### 5.2 API Endpoints

#### 5.2.1 Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/google` - Iniciar autenticação Google
- `GET /api/auth/google/callback` - Callback de autenticação Google
- `GET /api/auth/verify` - Verificar email
- `POST /api/auth/resend-verification` - Reenviar email de verificação
- `POST /api/auth/logout` - Logout de usuário

#### 5.2.2 Usuário
- `GET /api/user/me` - Obter dados do usuário atual
- `PUT /api/user/me` - Atualizar dados do usuário atual

### 5.3 Fluxos de Autenticação

#### 5.3.1 Registro com Email
1. Usuário preenche formulário de registro
2. Frontend valida dados
3. Requisição para `/api/auth/register`
4. Backend valida dados
5. Cria usuário no banco de dados
6. Gera token de verificação
7. Envia email de verificação
8. Retorna sucesso com instruções

#### 5.3.2 Login com Email
1. Usuário preenche formulário de login
2. Frontend valida dados
3. Requisição para `/api/auth/login`
4. Backend valida credenciais
5. Verifica se email está verificado
6. Gera token de sessão
7. Retorna token e dados do usuário

#### 5.3.3 Autenticação Google
1. Usuário clica no botão Google
2. Redirecionado para `/api/auth/google`
3. Backend redireciona para página de autenticação Google
4. Usuário seleciona conta
5. Google redireciona para `/api/auth/google/callback`
6. Backend verifica token
7. Busca ou cria usuário no banco
8. Gera token de sessão
9. Redireciona para aplicação com token

#### 5.3.4 Verificação de Email
1. Usuário clica no link no email
2. Redirecionado para `/api/auth/verify?token=xyz`
3. Backend valida token
4. Marca usuário como verificado
5. Redireciona para página de sucesso

## 6. PONTOS DE REVISÃO E QUALIDADE

### 6.1 Critérios de Aceitação
- **Funcionalidade:** Todos os fluxos de autenticação funcionam sem erros
- **Segurança:** Implementação de práticas de segurança recomendadas
- **Performance:** Tempo de carregamento < 3 segundos
- **Usabilidade:** Interface intuitiva e responsiva
- **Acessibilidade:** Conformidade com WCAG 2.1 AA

### 6.2 Revisões Planejadas
- **Revisão de Design:** Após implementação do frontend
- **Revisão de Código:** Após implementação do backend
- **Revisão de Segurança:** Antes do lançamento
- **Revisão de Performance:** Antes do lançamento

### 6.3 Testes Necessários
- **Testes Unitários:** Componentes e funções individuais
- **Testes de Integração:** Interação entre componentes
- **Testes E2E:** Fluxos completos de usuário
- **Testes de Segurança:** Vulnerabilidades comuns
- **Testes de Compatibilidade:** Diferentes navegadores e dispositivos

## 7. RISCOS E MITIGAÇÕES

### 7.1 Riscos Identificados
1. **Configuração incorreta do OAuth Google**
   - *Mitigação:* Seguir documentação oficial, testar em ambiente de desenvolvimento
2. **Problemas de entrega de email**
   - *Mitigação:* Usar serviço confiável, implementar sistema de logs, ter alternativa
3. **Vulnerabilidades de segurança**
   - *Mitigação:* Seguir melhores práticas, realizar testes de segurança
4. **Problemas de compatibilidade**
   - *Mitigação:* Testar em diferentes navegadores e dispositivos
5. **Atrasos na implementação**
   - *Mitigação:* Planejamento detalhado, buffer de tempo, priorização de funcionalidades

### 7.2 Plano de Contingência
- Ter alternativas para cada serviço externo
- Documentar processos de rollback
- Manter versões estáveis do código
- Ter canais de comunicação claros para reportar problemas

## 8. DOCUMENTAÇÃO E ENTREGÁVEIS

### 8.1 Documentação Técnica
- Documentação de API
- Guia de configuração
- Documentação de banco de dados
- Guia de troubleshooting

### 8.2 Documentação para Usuário
- Guia de uso do sistema de autenticação
- FAQ sobre problemas comuns
- Instruções para verificação de email

### 8.3 Entregáveis Finais
- Código-fonte completo
- Documentação técnica
- Relatório de testes
- Guia de manutenção

## 9. MONITORAMENTO E MANUTENÇÃO

### 9.1 Métricas de Monitoramento
- Taxa de conversão (registro → verificação)
- Tempo médio para verificação
- Taxa de falha de autenticação
- Distribuição de métodos de login (Google vs. Email)
- Tempo de resposta da API

### 9.2 Plano de Manutenção
- Atualizações regulares de dependências
- Monitoramento de logs de erro
- Backup regular do banco de dados
- Revisões periódicas de segurança

## 10. PRÓXIMOS PASSOS

### 10.1 Imediatos
- Configurar projeto no Replit
- Criar projeto no Google Cloud
- Configurar banco de dados Supabase
- Iniciar desenvolvimento frontend

### 10.2 Futuros (Fase 2)
- Implementar recuperação de senha
- Adicionar autenticação de dois fatores
- Integrar com mais provedores (Apple, GitHub)
- Implementar sistema de roles e permissões

---

## REVISÃO E APROVAÇÃO

| Etapa | Responsável | Status | Data |
|-------|-------------|--------|------|
| Elaboração do Plano | Equipe Técnica | ✅ Concluído | 17/07/2025 |
| Revisão Técnica | Tech Lead | ⏳ Pendente | - |
| Aprovação Final | Product Owner | ⏳ Pendente | - |

---

**Versão:** 1.0  
**Data:** 17/07/2025  
**Autor:** Equipe MEOW Token

