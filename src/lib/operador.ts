'use client';

import { useEffect, useState } from 'react';
import { TRIADORES } from './pontuacao';

const CHAVE = 'ap_operador';

/**
 * Quem está usando o app agora. Como o login é uma senha só para as três
 * pessoas do escritório, essa escolha fica no navegador e serve para marcar
 * autoria das mudanças de status e preencher o triador por padrão.
 */
export function useOperador(): [string, (valor: string) => void] {
  const [operador, definirEstado] = useState('');

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CHAVE) ?? '';
      if ((TRIADORES as readonly string[]).includes(salvo)) definirEstado(salvo);
    } catch {
      // Navegador sem localStorage disponível, segue sem operador.
    }
  }, []);

  function definir(valor: string) {
    definirEstado(valor);
    try {
      if (valor) window.localStorage.setItem(CHAVE, valor);
      else window.localStorage.removeItem(CHAVE);
    } catch {
      // Ignora, é só conveniência.
    }
  }

  return [operador, definir];
}
