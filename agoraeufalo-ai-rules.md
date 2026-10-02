# 🏛️ DIRETRIZES DEFINITIVAS DE ARQUITETURA, SEGURANÇA E I/O

Este documento estabelece as regras estritas de infraestrutura, privilégios e manipulação de disco para todos os agentes de Inteligência Artificial operando no ecossistema AgoraEuFalo.

## 1. Regra de Autenticação (Menor Privilégio)
O agente Antigravity **DEVE SEMPRE** usar o arquivo `.antigravity-credentials.json` para inicializar o Firebase Admin SDK ou interagir com o GCP. 
* **PROIBIÇÃO ABSOLUTA:** É estritamente proibido usar o token global do `firebase-tools` ou alterar as regras de segurança (`firestore.rules`) do banco de dados de produção para facilitar a execução de scripts locais. O agente opera estritamente sob os papéis limitados de `datastore.user` e `storage.objectAdmin`.

## 2. Regra de I/O (Proteção de Disco e Memória)
**MANIPULAÇÃO DE MÍDIA:** É estritamente proibido fazer o download e salvar arquivos de mídia no disco local (usando `fs.writeFileSync` ou ferramentas que geram cache massivo como a CLI local do Wrangler) durante migrações ou processamentos em lote. 
* **OBRIGAÇÃO ARQUITETURAL:** Todo tráfego *cloud-to-cloud* (ex: transferências do Firebase Storage para o Cloudflare R2 ou AWS S3) deve ser obrigatoriamente orquestrado em memória utilizando **Streams** (repassando o stream de leitura do `fetch` ou SDK diretamente para a classe de Upload do destino), garantindo o uso eficiente da RAM e **ZERO ocupação de disco rígido** da máquina local.
