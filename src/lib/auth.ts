/**
 * Login único por senha compartilhada (ENV APP_PASSWORD).
 * O cookie não guarda a senha: guarda um vencimento assinado com HMAC-SHA256
 * usando a senha como chave. Assim, trocar APP_PASSWORD invalida as sessões.
 * Usa Web Crypto porque o middleware roda no runtime Edge.
 */

export const NOME_COOKIE = 'ap_sessao';
export const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 12; // 12 horas

function codificar(texto: string): BufferSource {
  // O cast resolve a divergência entre Uint8Array<ArrayBufferLike> do TS
  // e o BufferSource esperado pela Web Crypto.
  return new TextEncoder().encode(texto) as unknown as BufferSource;
}

function paraHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function assinar(mensagem: string, segredo: string): Promise<string> {
  const chave = await crypto.subtle.importKey(
    'raw',
    codificar(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return paraHex(await crypto.subtle.sign('HMAC', chave, codificar(mensagem)));
}

/** Comparação de tempo constante, para não vazar a senha por timing. */
export function compararSeguro(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i += 1) {
    diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diferenca === 0;
}

export async function criarTokenSessao(senha: string): Promise<string> {
  const expiraEm = Date.now() + DURACAO_SESSAO_SEGUNDOS * 1000;
  const carga = String(expiraEm);
  return `${carga}.${await assinar(carga, senha)}`;
}

export async function validarTokenSessao(
  token: string | undefined,
  senha: string | undefined,
): Promise<boolean> {
  if (!token || !senha) return false;
  const partes = token.split('.');
  if (partes.length !== 2) return false;
  const [carga, assinatura] = partes;
  const expiraEm = Number(carga);
  if (!Number.isFinite(expiraEm) || expiraEm < Date.now()) return false;
  return compararSeguro(assinatura, await assinar(carga, senha));
}
