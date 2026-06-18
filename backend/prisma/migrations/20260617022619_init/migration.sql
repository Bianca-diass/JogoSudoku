-- CreateTable
CREATE TABLE "Jogador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "pontos" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Partida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'aguardando',
    "tabuleiro" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "JogadorPartida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jogadorId" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,
    "erros" INTEGER NOT NULL DEFAULT 0,
    "jogadas" INTEGER NOT NULL DEFAULT 0
);
