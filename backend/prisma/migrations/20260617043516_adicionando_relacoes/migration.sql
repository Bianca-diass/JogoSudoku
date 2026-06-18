-- AlterTable
ALTER TABLE "Partida" ADD COLUMN "lastPlayerId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JogadorPartida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jogadorId" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,
    "erros" INTEGER NOT NULL DEFAULT 0,
    "jogadas" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "JogadorPartida_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JogadorPartida_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "Partida" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_JogadorPartida" ("erros", "id", "jogadas", "jogadorId", "partidaId") SELECT "erros", "id", "jogadas", "jogadorId", "partidaId" FROM "JogadorPartida";
DROP TABLE "JogadorPartida";
ALTER TABLE "new_JogadorPartida" RENAME TO "JogadorPartida";
CREATE UNIQUE INDEX "JogadorPartida_jogadorId_partidaId_key" ON "JogadorPartida"("jogadorId", "partidaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
