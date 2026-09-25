-- AlterTable
ALTER TABLE "Candidato" ADD COLUMN     "trabalhoAltura" TEXT,
ADD COLUMN     "treinamentoNr" TEXT,
ADD COLUMN     "usoEpi" TEXT;

-- CreateTable
CREATE TABLE "AlteracaoStatus" (
    "id" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "de" TEXT NOT NULL,
    "para" TEXT NOT NULL,
    "autor" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlteracaoStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlteracaoStatus_candidatoId_criadoEm_idx" ON "AlteracaoStatus"("candidatoId", "criadoEm");

-- AddForeignKey
ALTER TABLE "AlteracaoStatus" ADD CONSTRAINT "AlteracaoStatus_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;
