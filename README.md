# Syphiro Backend

Backend Node.js com TypeScript, configurado para desenvolvimento em DevContainer.

## Requisitos

- Node.js 18+ (se for rodar localmente sem DevContainer)
- Docker + Dev Containers (VS Code / Cursor) para usar o devcontainer

## Scripts

- `npm install` — instala as dependências
- `npm run dev` — modo desenvolvimento com recarregamento automático
- `npm run build` — compila para `dist`
- `npm start` — roda o código compilado em `dist`
- `npm run lint` — roda ESLint
- `npm run lint:fix` — ESLint corrigindo automaticamente
- `npm run format` — verifica formatação com Prettier
- `npm run format:fix` — formata com Prettier

## DevContainer

1. Abra o projeto no VS Code / Cursor.
2. Use o comando **Reopen in Container**.
3. Dentro do container, rode:

```bash
npm run dev
```

