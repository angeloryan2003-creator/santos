-- CreateTable
CREATE TABLE "Candidato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "vaga" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "cidade" TEXT,
    "experiencia" TEXT NOT NULL,
    "consistencia" TEXT NOT NULL,
    "empresasAnteriores" TEXT,
    "mobilidade" TEXT NOT NULL,
    "ferramentas" TEXT NOT NULL,
    "disponibilidade" TEXT NOT NULL,
    "pretensao" TEXT NOT NULL,
    "documentacao" TEXT NOT NULL,
    "referencias" TEXT NOT NULL,
    "antecedentes" TEXT NOT NULL,
    "triador" TEXT,
    "observacoes" TEXT,
    "pontuacao" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensagemWhatsapp" (
    "id" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "recebidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processada" BOOLEAN NOT NULL DEFAULT false,
    "candidatoId" TEXT,

    CONSTRAINT "MensagemWhatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Candidato_status_idx" ON "Candidato"("status");

-- CreateIndex
CREATE INDEX "Candidato_vaga_idx" ON "Candidato"("vaga");

-- CreateIndex
CREATE INDEX "Candidato_pontuacao_idx" ON "Candidato"("pontuacao");

-- CreateIndex
CREATE INDEX "MensagemWhatsapp_processada_recebidaEm_idx" ON "MensagemWhatsapp"("processada", "recebidaEm");
