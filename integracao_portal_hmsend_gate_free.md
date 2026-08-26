# Especificação de Arquitetura e Integração: Lead Gate Free (Hotmart Send)
**Projeto:** Portal AgoraEuFalo  
**Módulo:** Integração-1 (Lead Gate Free com WhatsApp)  

---

## 1. Visão Geral e Credenciais

Esta especificação define a arquitetura técnica para implementar um bloqueio de conteúdo (*Lead Gate*) para usuários gratuitos no portal **AgoraEuFalo**, capturando Nome, E-mail e WhatsApp, integrando diretamente com o manipulador de formulários do **Hotmart Send**.

- **Endpoint de Ação:** `https://handler.send.hotmart.com/convert/o4TQeL4`
- **Token do Formulário:** `7d71287b-b314-4223-8295-037bce8c9fe5`
- **Campos do Payload:** `token`, `name`, `email`, `phone` (ou `whatsapp`)
- **Mecanismo de Persistência:** `localStorage` chave `aef_free_lead_unlocked`

---

## 2. Tipagem e Configuração TypeScript (`types/leadGate.ts`)

```typescript
// types/leadGate.ts

export interface FreeLeadData {
  name: string;
  email: string;
  phone: string;
  capturedAt: string;
}

export interface HotmartSendConfig {
  endpoint: string;
  token: string;
}

export const HOTMART_SEND_FREE_CONFIG: HotmartSendConfig = {
  endpoint: 'https://handler.send.hotmart.com/convert/o4TQeL4',
  token: '7d71287b-b314-4223-8295-037bce8c9fe5',
};
```

---

## 3. Serviço de Disparo Assíncrono (`services/hotmartSendService.ts`)

```typescript
// services/hotmartSendService.ts
import { HOTMART_SEND_FREE_CONFIG, FreeLeadData } from '../types/leadGate';

export const submitFreeLead = async (name: string, email: string, phone: string): Promise<boolean> => {
  const formData = new FormData();
  formData.append('token', HOTMART_SEND_FREE_CONFIG.token);
  formData.append('name', name);
  formData.append('email', email);
  formData.append('phone', phone);
  // Envia também como fallback caso o campo no Hotmart Send esteja mapeado como 'whatsapp'
  formData.append('whatsapp', phone);

  try {
    // mode: 'no-cors' contorna o bloqueio de CORS do navegador no envio direto client-side
    await fetch(HOTMART_SEND_FREE_CONFIG.endpoint, {
      method: 'POST',
      mode: 'no-cors',
      body: formData,
    });

    const leadRecord: FreeLeadData = {
      name,
      email,
      phone,
      capturedAt: new Date().toISOString(),
    };

    localStorage.setItem('aef_free_lead_unlocked', JSON.stringify(leadRecord));
    return true;
  } catch (error) {
    console.error('Erro ao registrar lead no Hotmart Send:', error);
    return false;
  }
};
```

---

## 4. Componente React / TypeScript (`components/FreeLeadGate.tsx`)

```tsx
// components/FreeLeadGate.tsx
import React, { useState, useEffect } from 'react';
import { submitFreeLead } from '../services/hotmartSendService';

interface FreeLeadGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const FreeLeadGate: React.FC<FreeLeadGateProps> = ({
  children,
  title = "Acesso Gratuito - AgoraEuFalo",
  description = "Cadastre-se para liberar seu acesso imediato ao conteúdo."
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedLead = localStorage.getItem('aef_free_lead_unlocked');
    if (savedLead) {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const success = await submitFreeLead(name.trim(), email.trim(), phone.trim());

    if (success) {
      setIsUnlocked(true);
    } else {
      setError('Ocorreu um erro ao conectar. Por favor, tente novamente.');
    }
    setLoading(false);
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white border border-slate-200 rounded-xl shadow-md text-slate-800">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>

      {error && (
        <div className="mb-3 p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Seu Nome
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu primeiro nome"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Seu E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.melhor.email@exemplo.com"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            WhatsApp (com DDD)
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition duration-150 ease-in-out"
        >
          {loading ? 'Validando acesso...' : 'Liberar Acesso Gratuito'}
        </button>
      </form>
    </div>
  );
};
```

---

## 5. Diretrizes para o Antigravity (Prompt Direto)

```markdown
### SPEC DE IMPLEMENTAÇÃO: Lead Gate Free (AgoraEuFalo + Hotmart Send)

1. **Configuração do Handler:**
   - URL: `https://handler.send.hotmart.com/convert/o4TQeL4`
   - Token do Formulário: `7d71287b-b314-4223-8295-037bce8c9fe5`

2. **Campos do Payload:**
   - Construir requisição `POST` com `FormData` contendo: `token`, `name`, `email`, `phone` (e fallback `whatsapp`).
   - Utilizar `fetch` com `mode: 'no-cors'` para envio assíncrono direto pelo navegador sem recarregar a página.

3. **Controle de Sessão e Acesso:**
   - Checar `localStorage.getItem('aef_free_lead_unlocked')` na montagem do componente.
   - Se presente, exibir o conteúdo filho imediatamente.
   - Caso ausente, apresentar o formulário do Gate com os campos Nome, E-mail e WhatsApp.
   - Ao submeter com sucesso, gravar o objeto completo do lead em `localStorage` e liberar a visualização.
```
