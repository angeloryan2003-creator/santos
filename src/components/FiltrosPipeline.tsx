import Link from 'next/link';
import { STATUS, VAGAS } from '@/lib/pontuacao';

export default function FiltrosPipeline({
  vaga,
  status,
  busca,
}: {
  vaga: string;
  status: string;
  busca: string;
}) {
  const temFiltro = Boolean(vaga || status || busca);

  return (
    <form method="get" action="/" className="cartao flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-[200px] flex-1">
        <label htmlFor="q" className="rotulo">
          Buscar
        </label>
        <input
          id="q"
          name="q"
          defaultValue={busca}
          placeholder="Nome ou telefone"
          className="campo"
        />
      </div>

      <div className="w-40">
        <label htmlFor="vaga" className="rotulo">
          Vaga
        </label>
        <select id="vaga" name="vaga" defaultValue={vaga} className="campo">
          <option value="">Todas</option>
          {VAGAS.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      </div>

      <div className="w-52">
        <label htmlFor="status" className="rotulo">
          Status
        </label>
        <select id="status" name="status" defaultValue={status} className="campo">
          <option value="">Todos</option>
          {STATUS.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="botao-primario">
        Filtrar
      </button>

      {temFiltro ? (
        <Link href="/" className="botao-secundario">
          Limpar
        </Link>
      ) : null}
    </form>
  );
}
