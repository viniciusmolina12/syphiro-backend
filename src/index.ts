import process from 'node:process';

const port = process.env.PORT ?? 3000;

// Exemplo simples de "servidor" para testar o setup
function main() {
  console.log(`Servidor iniciado na porta ${port}`);
}

main();

