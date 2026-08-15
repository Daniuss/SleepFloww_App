# SleepFlow

App mobile (Expo/React Native) para acompanhar padrões respiratórios durante o
sono — grava o áudio da noite, identifica ronco e possíveis pausas respiratórias
por uma heurística de volume, e mostra o histórico das noites.

> ⚠️ **Este app não diagnostica apneia nem substitui avaliação médica.** A
> detecção é uma heurística baseada em volume de áudio, não um algoritmo
> clínico validado.

## Stack

- **App**: Expo SDK 54, React Native 0.81, TypeScript, React Navigation
  (bottom tabs + stack), Zustand (estado global), `expo-audio` (gravação).
- **Backend**: Node.js + Express, SQLite (`better-sqlite3`) para persistência
  local, sem serviço externo.

## Estrutura do projeto

```
sleepflow/
├── App.tsx                    # Entry point do app (ThemeProvider + RootNavigator)
├── app.json                   # Config do Expo (permissões Android, plugins)
├── src/
│   ├── api/
│   │   ├── client.ts          # Funções de chamada à API (login, nights, records)
│   │   └── config.ts          # URL do backend (IP local — ver seção Configuração)
│   ├── audio/
│   │   └── snoreDetector.ts   # Heurística de detecção de ronco/pausas a partir do volume
│   ├── components/            # Componentes de UI reutilizáveis (Card, AppButton, etc.)
│   ├── data/mockNights.ts     # severityLabel() e dados de exemplo (não usados em produção)
│   ├── navigation/            # RootNavigator (stack) + MainTabs (tabs)
│   ├── screens/
│   │   ├── LoginScreen.tsx        # Autenticação (auto-cria conta no primeiro login)
│   │   ├── HomeScreen.tsx         # Resumo da última noite
│   │   ├── HistoryScreen.tsx      # Histórico de noites
│   │   ├── RecordScreen.tsx       # Registro manual de sintomas/hábitos
│   │   ├── SleepSessionScreen.tsx # Gravação de áudio da noite
│   │   └── ProfileScreen.tsx      # Conta / logout
│   ├── store/                 # Zustand: authStore, nightsStore, recordStore
│   ├── theme/                 # Tokens de cor/tipografia + ThemeProvider
│   └── types/domain.ts        # Tipos do domínio (Night, ManualRecord, etc.)
└── server/
    ├── index.js                # Servidor Express (rotas de auth, nights, records)
    ├── db.js                   # Acesso ao SQLite (better-sqlite3)
    └── sleepflow.db             # Arquivo do banco (gerado ao rodar; git-ignorado)
```

## Rodando o projeto

### 1. Backend

```
cd server
npm install
npm start
```

Sobe em `http://0.0.0.0:4000`. Os dados ficam em `server/sleepflow.db`
(SQLite), sobrevivem a reinícios do servidor.

### 2. App

```
npm install
npx expo start
```

Escaneie o QR code com o **Expo Go** (Android/iOS) para telas gerais do app.

> **Gravação de áudio da noite (`SleepSessionScreen`) não funciona no Expo
> Go** — gravação em segundo plano (tela apagada) exige um *dev client*
> customizado, buildado via EAS Build. Ver seção abaixo.

### 3. Testar rapidamente no navegador (sem celular)

```
npx expo start --web
```

Bom para iterar na UI rapidamente. A gravação de áudio em segundo plano não é
testável no navegador (mesma limitação: abas em segundo plano são suspensas).

## Configuração

O app se conecta ao backend via IP local, definido em
[`src/api/config.ts`](src/api/config.ts):

```ts
export const API_BASE_URL = 'http://SEU_IP_LOCAL:4000';
```

Celular e computador precisam estar na **mesma rede Wi-Fi**. Se o IP do PC
mudar (trocar de rede, reiniciar o roteador etc.), atualize esse arquivo.
Para descobrir o IP atual no Windows: `ipconfig` → IPv4 do adaptador Wi-Fi.

## Dev client (EAS Build) — necessário para gravação em segundo plano

O Expo Go não dá suporte a `TaskManager`/gravação de áudio em segundo plano.
Para testar a gravação da noite de verdade (tela apagada, app em segundo
plano):

1. `npx eas-cli login` (conta Expo gratuita)
2. `npx eas build:configure`
3. `npx eas build --platform android --profile development`
4. Instalar o `.apk` gerado no celular (link fornecido ao final do build)
5. A partir daí, rodar `npx expo start --dev-client` em vez de `npx expo start`

Gratuito até 15 builds Android/mês no plano free da Expo.

## Como funciona a detecção (heurística, não clínica)

Implementada em [`src/audio/snoreDetector.ts`](src/audio/snoreDetector.ts).
Durante a gravação, o app lê o nível de volume (dB) do microfone a cada ~1s
(via `expo-audio`) e, ao final da noite, roda:

- **Ronco**: trechos com volume sustentado acima de um limiar por 2s+ →
  soma a duração total em `snoreMinutes`.
- **Pausa respiratória candidata**: silêncio (abaixo de um piso de volume)
  por 10s+, seguido de um salto abrupto de volume (engasgo) → conta como 1
  evento em `eventsCount`.
- `severity` (`baixo`/`moderado`/`alto`) é derivado da contagem de eventos.

Os limiares são constantes nomeadas no topo do arquivo — calibráveis
conforme o comportamento observado no uso real. O áudio bruto não é
enviado nem armazenado; só o resumo calculado (`Night`) é enviado ao
backend.

## Backend — API

Todas as rotas exceto `/health` e `/auth/login` exigem header
`Authorization: Bearer <token>` (token retornado no login).

| Método | Rota           | Descrição                                             |
|--------|----------------|--------------------------------------------------------|
| POST   | `/auth/login`  | Login (cria a conta automaticamente no primeiro acesso) |
| GET    | `/nights`      | Lista as noites do usuário logado                      |
| POST   | `/nights`      | Salva o resumo calculado de uma noite gravada           |
| GET    | `/records`     | Lista os registros manuais do usuário                   |
| POST   | `/records`     | Salva um registro manual (sintomas, hábitos, CPAP...)   |

### Banco (SQLite)

- `users (email, password)` — senha em texto puro por enquanto (**não é
  seguro para produção**, ok para desenvolvimento/testes).
- `nights (id, email, date, weekday_label, events_count, snore_minutes, sleep_duration_hours, severity)`
- `records (id, email, created_at, payload)` — `payload` é o `ManualRecord`
  inteiro serializado em JSON.

## Limitações conhecidas / próximos passos

- Só Android por enquanto (iOS não configurado nesta etapa).
- Senha sem hash no backend — trocar por bcrypt antes de qualquer uso real.
- Sessão (token) só em memória no app — fechar o app desloga.
- "App fechado" (removido da lista de recentes) não garante gravação
  contínua em nenhuma plataforma; o que funciona é "em segundo plano, tela
  apagada". Gerenciadores de bateria agressivos (Xiaomi, Samsung etc.) podem
  matar o serviço mesmo assim — pode ser necessário desativar a otimização
  de bateria pro app manualmente.
- Telas de "Exportar relatório", "Política de privacidade" e "Permissões do
  microfone" no Perfil ainda são placeholders sem ação.
- Backend acessível só na rede local — para uso fora de casa, precisa de
  deploy em um servidor real (fora do escopo atual).
