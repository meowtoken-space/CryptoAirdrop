# 🚀 PROMPT COMPLETO: SISTEMA DE AUTENTICAÇÃO MEOW TOKEN

## 🎯 OBJETIVO:
Implementar um sistema de autenticação completo com três componentes:
1. **Login via Google/Gmail** - Autenticação principal
2. **Confirmação por email** - Verificação de segurança
3. **Conexão Phantom Wallet** - Apenas para obter chave pública

## 📋 FLUXO DE USUÁRIO:

### FASE 1: AUTENTICAÇÃO GOOGLE
```
1. Usuário clica "Entrar com Google" → 
2. Seleciona conta Gmail → 
3. Retorna ao site com perfil básico
```

### FASE 2: VERIFICAÇÃO EMAIL
```
4. Sistema envia código de 6 dígitos → 
5. Usuário insere código → 
6. Email confirmado
```

### FASE 3: CONEXÃO WALLET (OPCIONAL)
```
7. Para jogar/ganhar pontos, usuário conecta Phantom → 
8. Sistema armazena APENAS chave pública → 
9. Usuário elegível para TGE
```

## 🔧 IMPLEMENTAÇÃO TÉCNICA:

### 1. CONFIGURAÇÃO SUPABASE
```sql
-- Já implementado no banco de dados:
-- Tabela users com campos:
-- id, email, email_verified, google_id, wallet_address, created_at
```

### 2. COMPONENTES REACT

#### `AuthProvider.tsx`
```tsx
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Verificar sessão atual
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
  };
  
  const sendVerificationEmail = async (email) => {
    // Gerar código de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Salvar código no banco
    await supabase.from('verification_codes').insert({
      email,
      code: verificationCode,
      expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    });
    
    // Enviar email com código
    await supabase.functions.invoke('send-verification-email', {
      body: { email, code: verificationCode }
    });
    
    return true;
  };
  
  const verifyEmailCode = async (email, code) => {
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) return false;
    
    // Marcar email como verificado
    await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('email', email);
    
    // Remover código usado
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email);
    
    return true;
  };
  
  const connectWallet = async (walletAddress) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    await supabase
      .from('users')
      .update({ wallet_address: walletAddress })
      .eq('id', user.id);
    
    // Atualizar usuário local
    setUser({
      ...user,
      wallet_address: walletAddress
    });
    
    return true;
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  
  const value = {
    user,
    loading,
    signInWithGoogle,
    sendVerificationEmail,
    verifyEmailCode,
    connectWallet,
    signOut
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

#### `LoginPage.tsx`
```tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="p-8 bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          MEOW Token
        </h1>
        
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            {/* Google icon SVG */}
          </svg>
          Entrar com Google
        </button>
        
        <p className="mt-6 text-sm text-gray-400 text-center">
          Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade
        </p>
      </div>
    </div>
  );
}
```

#### `EmailVerification.tsx`
```tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';

export default function EmailVerification() {
  const { user, sendVerificationEmail, verifyEmailCode } = useAuth();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, verifying, success, error
  
  const handleSendCode = async () => {
    try {
      setStatus('sending');
      await sendVerificationEmail(user.email);
      setStatus('idle');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };
  
  const handleVerifyCode = async () => {
    try {
      setStatus('verifying');
      const success = await verifyEmailCode(user.email, code);
      setStatus(success ? 'success' : 'error');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };
  
  return (
    <div className="p-6 bg-gray-800 rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Verificar Email</h2>
      <p className="text-gray-300 mb-6">
        Para sua segurança, precisamos verificar seu email. Enviaremos um código de 6 dígitos.
      </p>
      
      {status !== 'success' ? (
        <>
          <button
            onClick={handleSendCode}
            disabled={status === 'sending'}
            className="w-full bg-purple-600 text-white py-2 rounded-lg mb-4 hover:bg-purple-700"
          >
            {status === 'sending' ? 'Enviando...' : 'Enviar Código'}
          </button>
          
          <div className="mt-4">
            <label className="block text-gray-300 mb-2">Código de Verificação</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Digite o código de 6 dígitos"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
              maxLength={6}
            />
            
            <button
              onClick={handleVerifyCode}
              disabled={code.length !== 6 || status === 'verifying'}
              className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              {status === 'verifying' ? 'Verificando...' : 'Verificar Código'}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-xl font-medium text-white">Email Verificado!</p>
          <p className="text-gray-400 mt-2">Você já pode acessar todas as funcionalidades.</p>
        </div>
      )}
    </div>
  );
}
```

#### `WalletConnect.tsx`
```tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';

export default function WalletConnect() {
  const { user, connectWallet } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      setError(null);
      
      // Verificar se Phantom está instalado
      const provider = window?.phantom?.solana;
      if (!provider?.isPhantom) {
        throw new Error('Phantom não está instalado. Por favor instale a extensão.');
      }
      
      // Conectar à carteira
      const response = await provider.connect();
      const walletAddress = response.publicKey.toString();
      
      // Salvar apenas a chave pública
      await connectWallet(walletAddress);
      
      setConnecting(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setConnecting(false);
    }
  };
  
  // Se já tem carteira conectada
  if (user?.wallet_address) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg max-w-md mx-auto">
        <div className="text-center py-4">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-xl font-medium text-white">Carteira Conectada!</p>
          <p className="text-gray-400 mt-2">Sua carteira está conectada e você está elegível para o TGE.</p>
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300 font-mono break-all">{user.wallet_address}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-800 rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Conectar Carteira</h2>
      <p className="text-gray-300 mb-6">
        Para participar dos jogos e ganhar pontos, conecte sua carteira Phantom. Apenas sua chave pública será armazenada.
      </p>
      
      <button
        onClick={handleConnectWallet}
        disabled={connecting}
        className="w-full bg-purple-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700"
      >
        {connecting ? (
          'Conectando...'
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              {/* Phantom icon SVG */}
            </svg>
            Conectar Phantom Wallet
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <p className="mt-6 text-sm text-gray-400">
        Não tem Phantom Wallet? <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Instale aqui</a>
      </p>
    </div>
  );
}
```

### 3. ROTAS E PROTEÇÃO

#### `App.tsx`
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthProvider';
import LoginPage from './pages/LoginPage';
import EmailVerification from './pages/EmailVerification';
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';

// Proteção para rotas que exigem autenticação
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Proteção para rotas que exigem email verificado
function RequireVerifiedEmail({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!user.email_verified) {
    return <Navigate to="/verify-email" />;
  }
  
  return children;
}

// Proteção para rotas que exigem carteira conectada
function RequireWallet({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!user.email_verified) {
    return <Navigate to="/verify-email" />;
  }
  
  if (!user.wallet_address) {
    return <Navigate to="/connect-wallet" />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Rotas que exigem autenticação */}
          <Route 
            path="/verify-email" 
            element={
              <RequireAuth>
                <EmailVerification />
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/connect-wallet" 
            element={
              <RequireVerifiedEmail>
                <WalletConnect />
              </RequireVerifiedEmail>
            } 
          />
          
          {/* Rotas que exigem email verificado */}
          <Route 
            path="/" 
            element={
              <RequireVerifiedEmail>
                <Dashboard />
              </RequireVerifiedEmail>
            } 
          />
          
          {/* Rotas que exigem carteira conectada */}
          <Route 
            path="/games/*" 
            element={
              <RequireWallet>
                <Games />
              </RequireWallet>
            } 
          />
          
          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### 4. FUNÇÃO SERVERLESS PARA EMAIL

#### `send-verification-email.js`
```javascript
// Supabase Edge Function
import { createClient } from '@supabase/supabase-js';
import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts';

export async function handler(req) {
  try {
    const { email, code } = await req.json();
    
    // Validar dados
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email e código são obrigatórios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Configurar cliente SMTP
    const client = new SmtpClient();
    await client.connect({
      hostname: Deno.env.get('SMTP_HOST'),
      port: parseInt(Deno.env.get('SMTP_PORT')),
      username: Deno.env.get('SMTP_USERNAME'),
      password: Deno.env.get('SMTP_PASSWORD'),
    });
    
    // Enviar email
    await client.send({
      from: 'noreply@meowtoken.com',
      to: email,
      subject: 'Seu código de verificação MEOW Token',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9a45fc;">MEOW Token - Verificação de Email</h2>
          <p>Olá,</p>
          <p>Seu código de verificação é:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
            ${code}
          </div>
          <p>Este código expira em 30 minutos.</p>
          <p>Se você não solicitou este código, ignore este email.</p>
          <p>Atenciosamente,<br>Equipe MEOW Token</p>
        </div>
      `,
      html: true,
    });
    
    await client.close();
    
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    
    return new Response(
      JSON.stringify({ error: 'Falha ao enviar email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

## 🚀 IMPLEMENTAÇÃO NO REPLIT:

### 1. CONFIGURAÇÃO SUPABASE
- Criar tabela `verification_codes` no Supabase
- Configurar OAuth com Google no Supabase
- Configurar Edge Function para envio de email

### 2. INSTALAÇÃO DE DEPENDÊNCIAS
```bash
npm install @supabase/supabase-js react-router-dom
```

### 3. IMPLEMENTAÇÃO DOS COMPONENTES
- Criar os componentes React conforme especificado
- Implementar o sistema de rotas e proteção
- Configurar o AuthProvider

### 4. TESTES E VALIDAÇÃO
- Testar fluxo completo de autenticação
- Verificar armazenamento correto da chave pública
- Validar proteção de rotas

## 💎 RESULTADO FINAL:

Um sistema de autenticação completo e seguro com:
- Login via Google (fácil e rápido)
- Verificação por email (segurança adicional)
- Conexão Phantom Wallet (apenas chave pública)
- Proteção de rotas baseada em nível de autenticação
- Elegibilidade para TGE garantida

Este sistema proporciona:
- Experiência de usuário simplificada
- Segurança robusta
- Integração perfeita com Solana
- Base sólida para o ecossistema MEOW Token

