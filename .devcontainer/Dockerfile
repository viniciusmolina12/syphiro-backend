FROM mcr.microsoft.com/devcontainers/typescript-node:22

WORKDIR /workspaces/app

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

CMD ["npm", "run", "dev"]

