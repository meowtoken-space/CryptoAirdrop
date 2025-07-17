# 🔑 GUIA COMPLETO: COMO ENCONTRAR AS CHAVES DO SUPABASE

## 🎯 **LOCALIZAÇÃO EXATA DAS CHAVES:**

### **📍 CAMINHO COMPLETO:**
```
Supabase Dashboard → Seu Projeto → Settings → API
```

---

## 🚀 **PASSO A PASSO DETALHADO:**

### **1. ACESSE O SUPABASE DASHBOARD**
- **URL:** https://supabase.com/dashboard
- **Login:** Use sua conta (GitHub recomendado)

### **2. SELECIONE SEU PROJETO**
- **Nome do projeto:** "meowtoken-space" (ou o nome que você criou)
- **Clique no projeto** para abrir

### **3. NAVEGUE PARA AS CONFIGURAÇÕES**
- **Menu lateral esquerdo** → Procure por **"Settings"** (ícone de engrenagem ⚙️)
- **Clique em "Settings"**

### **4. ACESSE A SEÇÃO API**
- **Dentro de Settings** → Clique em **"API"**
- **Esta é a seção onde estão TODAS as chaves!**

---

## 🔑 **CHAVES QUE VOCÊ PRECISA:**

### **✅ NEXT_PUBLIC_SUPABASE_URL**
**Localização:** Settings → API → **"Project URL"**
```
Formato: https://[seu-projeto-id].supabase.co
Exemplo: https://abcdefghijklmnop.supabase.co
```

### **✅ NEXT_PUBLIC_SUPABASE_ANON_KEY**
**Localização:** Settings → API → **"Project API keys" → "anon public"**
```
Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Tamanho: String muito longa (centenas de caracteres)
```

---

## 📋 **INSTRUÇÕES VISUAIS:**

### **TELA 1 - DASHBOARD PRINCIPAL:**
```
┌─────────────────────────────────────────┐
│  🏠 Supabase Dashboard                  │
├─────────────────────────────────────────┤
│                                         │
│  📁 meowtoken-space                     │ ← CLIQUE AQUI
│     └── Seu projeto principal          │
│                                         │
│  📁 Outros projetos...                  │
│                                         │
└─────────────────────────────────────────┘
```

### **TELA 2 - MENU LATERAL DO PROJETO:**
```
┌─────────────────────────────────────────┐
│  📊 Table Editor                        │
│  📝 SQL Editor                          │
│  🔐 Authentication                      │
│  📡 Edge Functions                      │
│  📈 Logs                                │
│  ⚙️  Settings                          │ ← CLIQUE AQUI
│     ├── General                        │
│     ├── API                            │ ← DEPOIS AQUI
│     ├── Auth                           │
│     └── Billing                        │
└─────────────────────────────────────────┘
```

### **TELA 3 - SEÇÃO API (ONDE ESTÃO AS CHAVES):**
```
┌─────────────────────────────────────────┐
│  ⚙️ Settings → API                      │
├─────────────────────────────────────────┤
│                                         │
│  🌐 Project URL                         │
│  https://abcdefg.supabase.co           │ ← COPIE ESTA URL
│                                         │
│  🔑 Project API keys                    │
│                                         │
│  📖 anon public                         │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6...       │ ← COPIE ESTA CHAVE
│  [👁️ Reveal] [📋 Copy]                  │
│                                         │
│  🔒 service_role                        │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6...       │ ← NÃO USE ESTA
│                                         │
└─────────────────────────────────────────┘
```

---

## ⚠️ **IMPORTANTE - QUAL CHAVE USAR:**

### **✅ USE ESTA (anon public):**
- **Nome:** `anon public`
- **Descrição:** "This key is safe to use in a browser if you have enabled Row Level Security for your tables and configured policies."
- **Uso:** Frontend/cliente (segura para usar no código)

### **❌ NÃO USE ESTA (service_role):**
- **Nome:** `service_role`
- **Descrição:** "This key has the ability to bypass Row Level Security. Never share it publicly."
- **Uso:** Apenas backend/servidor (nunca no frontend)

---

## 📝 **FORMATO FINAL PARA O REPLIT:**

Após copiar as chaves, você terá algo assim:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0ODAwMCwiZXhwIjoxOTUyMTI0MDAwfQ.exemplo-de-token-muito-longo
```

---

## 🔧 **COMO USAR NO REPLIT:**

### **Método 1 - Variáveis de Ambiente:**
1. **Replit** → Seu projeto → **"Secrets"** (ícone de chave 🔑)
2. **Adicione as duas variáveis:**
   - `NEXT_PUBLIC_SUPABASE_URL` = sua URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua chave anon

### **Método 2 - Arquivo .env:**
1. **Crie arquivo** `.env.local` na raiz do projeto
2. **Adicione as variáveis** no formato mostrado acima

---

## 🚨 **DICAS DE SEGURANÇA:**

### **✅ SEGURO:**
- ✅ Usar `anon public` key no frontend
- ✅ Configurar RLS (Row Level Security) nas tabelas
- ✅ Usar variáveis de ambiente
- ✅ Não commitar chaves no Git

### **❌ PERIGOSO:**
- ❌ Usar `service_role` key no frontend
- ❌ Hardcoded chaves no código
- ❌ Compartilhar chaves publicamente
- ❌ Desabilitar RLS sem políticas

---

## 🎯 **VERIFICAÇÃO RÁPIDA:**

### **URL correta deve ter:**
- ✅ Começar com `https://`
- ✅ Terminar com `.supabase.co`
- ✅ Ter ID único no meio

### **Chave anon correta deve:**
- ✅ Começar com `eyJ`
- ✅ Ter centenas de caracteres
- ✅ Conter pontos (.) separando seções
- ✅ Ser a chave marcada como "anon public"

---

## 🚀 **PRÓXIMOS PASSOS:**

1. **Acesse:** https://supabase.com/dashboard
2. **Navegue:** Projeto → Settings → API
3. **Copie:** Project URL + anon public key
4. **Configure:** No Replit como variáveis de ambiente
5. **Execute:** O prompt do sistema de pontos
6. **Teste:** Sistema funcionando!

**Com essas chaves, o sistema de pontos funcionará perfeitamente conectado ao Supabase!** 🎉

