# PRD: SISTEMA DE AUTENTICAÇÃO MEOW TOKEN

## 1. VISÃO GERAL DO PRODUTO

### 1.1 Objetivo
Implementar um sistema de autenticação completo para o MEOW Token que inclua:
- Página de boas-vindas com botão "Conectar/Continuar"
- Autenticação via Google (API oficial do Google)
- Formulário de login/registro com design flip-card
- Verificação de email
- Acesso ao conteúdo completo do site após autenticação

### 1.2 Público-alvo
- Usuários da plataforma MEOW Token
- Faixa etária: 18-45 anos
- Familiaridade com criptomoedas e Web3

### 1.3 Plataformas
- Web (desktop e mobile)
- Implementação no Replit

## 2. FLUXO DE USUÁRIO

### 2.1 Fluxo Completo
1. Usuário acessa o site → Página de boas-vindas
2. Clica em "Conectar/Continuar" → Opções de autenticação
3. Escolhe "Entrar com Google" → Redirecionado para página oficial do Google
4. Seleciona conta Google → Retorna ao site
5. Primeiro acesso → Completa registro (confirmar email/senha)
6. Recebe email de verificação → Confirma email
7. Acesso completo ao conteúdo do site

### 2.2 Diagrama de Fluxo
```
Landing Page → Botão "Conectar" → Opções de Auth → Google Auth → Registro/Login → Verificação → Dashboard
                                                                                  ↑
                                                                                  ↓
                                                                      Email de Verificação
```

## 3. ESPECIFICAÇÕES DETALHADAS

### 3.1 Página de Boas-Vindas

#### 3.1.1 Design
- Fundo: Gradiente escuro com tema cyberpunk
- Logo MEOW Token centralizado
- Animação sutil de partículas no fundo
- Botão "Conectar/Continuar" destacado

#### 3.1.2 Conteúdo
- Título: "Bem-vindo ao MEOW Token"
- Subtítulo: "O futuro dos tokens gamificados"
- Breve descrição: 1-2 frases sobre o projeto
- Botão CTA: "Conectar/Continuar"

#### 3.1.3 Comportamento
- Ao clicar em "Conectar/Continuar" → Redireciona para página de autenticação
- Animações suaves de transição entre páginas

### 3.2 Sistema de Autenticação

#### 3.2.1 Opções de Autenticação
- Botão principal: "Entrar com Google" (API oficial)
- Formulário alternativo: Login/Registro via email

#### 3.2.2 Autenticação Google
- Implementação da API oficial do Google (OAuth 2.0)
- Botão padrão do Google com ícone e texto "Entrar com Google"
- Ao clicar, abre popup/página oficial do Google para seleção de conta
- Solicita permissões: email, perfil básico
- Após autenticação, retorna ao site com token

#### 3.2.3 Formulário de Login/Registro (Flip-Card)
**Design conforme fornecido:**
- Card com efeito flip
- Lado frontal: Login
- Lado traseiro: Registro
- Switch na parte superior para alternar entre os modos

**Lado Login:**
- Título: "Log in"
- Campo: Email
- Campo: Senha
- Botão: "Let's go!"

**Lado Registro:**
- Título: "Sign up"
- Campo: Nome
- Campo: Email
- Campo: Confirmar Email (adicionar)
- Campo: Senha
- Campo: Confirmar Senha (adicionar)
- Botão: "Confirm!"

### 3.3 Verificação de Email

#### 3.3.1 Processo
- Após registro, sistema envia email de verificação
- Email contém link único de verificação
- Usuário clica no link → Redireciona para página de confirmação
- Conta verificada → Acesso completo liberado

#### 3.3.2 Email de Verificação
- Remetente: noreply@meowtoken.com
- Assunto: "Verifique seu email - MEOW Token"
- Design: Template HTML com branding MEOW Token
- Conteúdo: Instruções claras e botão de verificação
- Link de verificação com token seguro e prazo de expiração (24h)

#### 3.3.3 Página de Confirmação
- Mensagem de sucesso após verificação
- Botão para continuar para o dashboard
- Animação de sucesso (confete/checkmark)

## 4. ESPECIFICAÇÕES TÉCNICAS

### 4.1 Implementação da API Google

#### 4.1.1 Configuração OAuth 2.0
```javascript
// Configuração do cliente OAuth
const googleConfig = {
  clientId: 'SEU_CLIENT_ID_GOOGLE',
  clientSecret: 'SEU_CLIENT_SECRET',
  redirectUri: 'https://seu-app.repl.co/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]
};
```

#### 4.1.2 Botão de Login Google
```html
<button id="googleLoginBtn" class="google-btn">
  <img src="google-icon.svg" alt="Google" />
  <span>Entrar com Google</span>
</button>
```

```javascript
// Inicialização do botão Google
function initGoogleAuth() {
  const googleBtn = document.getElementById('googleLoginBtn');
  googleBtn.addEventListener('click', () => {
    // Redireciona para a página de autenticação do Google
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
      client_id=${googleConfig.clientId}&
      redirect_uri=${googleConfig.redirectUri}&
      response_type=code&
      scope=${googleConfig.scopes.join(' ')}&
      access_type=offline&
      prompt=select_account`;
    
    window.location.href = authUrl;
  });
}
```

#### 4.1.3 Callback e Processamento
```javascript
// Rota de callback
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    // Troca o código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Obtém informações do usuário
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });
    
    const { data } = await oauth2.userinfo.get();
    
    // Verifica se o usuário já existe no banco
    const existingUser = await db.findUserByEmail(data.email);
    
    if (existingUser) {
      // Login
      const session = createSession(existingUser);
      res.redirect('/?session=' + session);
    } else {
      // Registro
      const newUser = await db.createUser({
        email: data.email,
        name: data.name,
        googleId: data.id,
        profilePicture: data.picture,
        verified: data.verified_email
      });
      
      // Envia email de verificação se necessário
      if (!data.verified_email) {
        await sendVerificationEmail(data.email);
      }
      
      const session = createSession(newUser);
      res.redirect('/?session=' + session);
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.redirect('/login?error=auth_failed');
  }
});
```

### 4.2 Implementação do Formulário Flip-Card

#### 4.2.1 HTML (Atualizado)
```html
<div class="wrapper">
  <div class="card-switch">
    <label class="switch">
      <input class="toggle" type="checkbox">
      <span class="slider"></span>
      <span class="card-side"></span>
      <div class="flip-card__inner">
        <div class="flip-card__front">
          <div class="title">Log in</div>
          <form action="/api/auth/login" method="POST" class="flip-card__form">
            <input type="email" placeholder="Email" name="email" class="flip-card__input" required>
            <input type="password" placeholder="Password" name="password" class="flip-card__input" required>
            <button type="submit" class="flip-card__btn">Let`s go!</button>
          </form>
        </div>
        <div class="flip-card__back">
          <div class="title">Sign up</div>
          <form action="/api/auth/register" method="POST" class="flip-card__form">
            <input type="text" placeholder="Name" name="name" class="flip-card__input" required>
            <input type="email" placeholder="Email" name="email" class="flip-card__input" required>
            <input type="email" placeholder="Confirm Email" name="confirmEmail" class="flip-card__input" required>
            <input type="password" placeholder="Password" name="password" class="flip-card__input" required>
            <input type="password" placeholder="Confirm Password" name="confirmPassword" class="flip-card__input" required>
            <button type="submit" class="flip-card__btn">Confirm!</button>
          </form>
        </div>
      </div>
    </label>
  </div>
  
  <!-- Botão Google abaixo do card -->
  <div class="google-auth-container">
    <p class="auth-separator">ou</p>
    <button id="googleLoginBtn" class="google-btn">
      <img src="google-icon.svg" alt="Google" />
      <span>Entrar com Google</span>
    </button>
  </div>
</div>
```

#### 4.2.2 CSS Adicional
```css
/* Estilo para o botão do Google */
.google-auth-container {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-separator {
  color: var(--font-color);
  margin: 10px 0;
  position: relative;
  width: 100%;
  text-align: center;
}

.auth-separator::before,
.auth-separator::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background-color: var(--font-color-sub);
}

.auth-separator::before {
  left: 0;
}

.auth-separator::after {
  right: 0;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 250px;
  height: 40px;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  background-color: var(--bg-color);
  box-shadow: 4px 4px var(--main-color);
  font-size: 15px;
  font-weight: 600;
  color: var(--font-color);
  cursor: pointer;
  transition: all 0.3s;
}

.google-btn:hover {
  background-color: #222;
}

.google-btn:active {
  box-shadow: 0px 0px var(--main-color);
  transform: translate(3px, 3px);
}

.google-btn img {
  width: 20px;
  height: 20px;
}
```

#### 4.2.3 JavaScript para Validação
```javascript
document.addEventListener('DOMContentLoaded', () => {
  // Formulário de registro
  const registerForm = document.querySelector('.flip-card__back form');
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = registerForm.querySelector('[name="email"]').value;
    const confirmEmail = registerForm.querySelector('[name="confirmEmail"]').value;
    const password = registerForm.querySelector('[name="password"]').value;
    const confirmPassword = registerForm.querySelector('[name="confirmPassword"]').value;
    
    // Validação de email
    if (email !== confirmEmail) {
      showError('Os emails não coincidem');
      return;
    }
    
    // Validação de senha
    if (password !== confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }
    
    // Envio do formulário
    registerForm.submit();
  });
  
  // Função para mostrar erros
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove mensagens de erro anteriores
    const existingError = document.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Adiciona nova mensagem
    registerForm.appendChild(errorDiv);
    
    // Remove após 3 segundos
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }
});
```

### 4.3 Sistema de Verificação de Email

#### 4.3.1 Geração e Envio
```javascript
async function sendVerificationEmail(email, userId) {
  // Gera token único
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
  
  // Salva token no banco
  await db.saveVerificationToken(userId, token, expires);
  
  // Cria URL de verificação
  const verificationUrl = `https://seu-app.repl.co/verify-email?token=${token}`;
  
  // Configura email
  const mailOptions = {
    from: 'noreply@meowtoken.com',
    to: email,
    subject: 'Verifique seu email - MEOW Token',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #111; color: #fefefe;">
        <img src="https://seu-app.repl.co/logo.png" alt="MEOW Token" style="width: 150px; margin-bottom: 20px;">
        <h2 style="color: #2d8cf0;">Verifique seu email</h2>
        <p>Olá,</p>
        <p>Obrigado por se registrar no MEOW Token. Para completar seu cadastro, por favor verifique seu email clicando no botão abaixo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2d8cf0; color: #fefefe; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar Email</a>
        </div>
        <p>Ou copie e cole o link abaixo no seu navegador:</p>
        <p style="word-break: break-all; font-size: 14px;">${verificationUrl}</p>
        <p>Este link expira em 24 horas.</p>
        <p>Se você não solicitou este email, por favor ignore-o.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #7e7e7e;">
          <p>© 2025 MEOW Token. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  };
  
  // Envia email
  await transporter.sendMail(mailOptions);
}
```

#### 4.3.2 Verificação do Token
```javascript
app.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.redirect('/login?error=invalid_token');
  }
  
  try {
    // Verifica token no banco
    const verification = await db.getVerificationToken(token);
    
    if (!verification) {
      return res.redirect('/login?error=invalid_token');
    }
    
    // Verifica expiração
    if (new Date() > new Date(verification.expires)) {
      return res.redirect('/login?error=expired_token');
    }
    
    // Marca usuário como verificado
    await db.updateUser(verification.userId, { verified: true });
    
    // Remove token usado
    await db.removeVerificationToken(token);
    
    // Redireciona para página de sucesso
    res.redirect('/verification-success');
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.redirect('/login?error=verification_failed');
  }
});
```

#### 4.3.3 Página de Sucesso
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verificado - MEOW Token</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="verification-success">
    <div class="success-icon">
      <svg viewBox="0 0 24 24" width="100" height="100">
        <path fill="#2d8cf0" d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm6.93,8.2-6.85,9.29a1,1,0,0,1-1.43.19L5.76,13.77a1,1,0,0,1-.15-1.41,1,1,0,0,1,1.41-.15l4.26,3.34,6.12-8.29a1,1,0,1,1,1.61,1.19Z"/>
      </svg>
    </div>
    <h1>Email Verificado com Sucesso!</h1>
    <p>Sua conta foi ativada e você já pode acessar todos os recursos do MEOW Token.</p>
    <a href="/dashboard" class="success-btn">Continuar para o Dashboard</a>
  </div>
  
  <script>
    // Animação de confete
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  </script>
</body>
</html>
```

## 5. BANCO DE DADOS

### 5.1 Estrutura de Tabelas

#### 5.1.1 Tabela `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  google_id VARCHAR(255),
  profile_picture VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.1.2 Tabela `verification_tokens`
```sql
CREATE TABLE verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.1.3 Tabela `sessions`
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 6. SEGURANÇA

### 6.1 Proteção de Dados
- Senhas armazenadas com hash bcrypt
- Tokens com expiração
- HTTPS para todas as comunicações
- Proteção contra CSRF
- Validação de entrada em todos os formulários

### 6.2 Prevenção de Ataques
- Rate limiting para tentativas de login
- Proteção contra ataques de força bruta
- Validação de tokens de sessão
- Sanitização de dados de entrada

## 7. TESTES E VALIDAÇÃO

### 7.1 Cenários de Teste
1. Registro com email e senha
2. Login com email e senha
3. Login com Google
4. Verificação de email
5. Tentativa de acesso sem verificação
6. Recuperação de senha
7. Logout

### 7.2 Critérios de Aceitação
- Todos os fluxos de autenticação funcionam sem erros
- Emails de verificação são entregues corretamente
- Sessões persistem entre navegações
- Interface responsiva em todos os dispositivos
- Tempo de carregamento < 3 segundos

## 8. IMPLEMENTAÇÃO E CRONOGRAMA

### 8.1 Fases de Implementação
1. **Configuração inicial** (1 dia)
   - Setup do projeto no Replit
   - Configuração do banco de dados
   - Configuração da API do Google

2. **Desenvolvimento frontend** (2 dias)
   - Página de boas-vindas
   - Formulário flip-card
   - Integração do botão Google

3. **Desenvolvimento backend** (3 dias)
   - Sistema de autenticação
   - Verificação de email
   - Gerenciamento de sessões

4. **Testes e ajustes** (1 dia)
   - Testes de todos os fluxos
   - Correção de bugs
   - Otimização de performance

### 8.2 Entregáveis
- Código-fonte completo no Replit
- Documentação de API
- Guia de configuração
- Relatório de testes

## 9. CONSIDERAÇÕES ADICIONAIS

### 9.1 Acessibilidade
- Contraste adequado para leitura
- Navegação por teclado
- Textos alternativos para imagens
- Mensagens de erro claras

### 9.2 Internacionalização
- Suporte inicial para Português (BR)
- Estrutura preparada para adicionar outros idiomas

### 9.3 Analytics
- Rastreamento de conversão (registro → verificação)
- Métricas de uso (login Google vs. email)
- Tempo médio para verificação

## 10. CONCLUSÃO

Este PRD detalha a implementação de um sistema de autenticação completo para o MEOW Token, com foco na experiência do usuário e segurança. O sistema combina a facilidade do login via Google com a robustez da verificação por email, garantindo que apenas usuários legítimos tenham acesso ao conteúdo completo da plataforma.

A implementação seguirá as melhores práticas de desenvolvimento web, com atenção especial à segurança, performance e experiência do usuário.

