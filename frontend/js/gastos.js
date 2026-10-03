/* Página: Gastos (gastos.html) */
(function () {
  "use strict";
  const { api, esc, brl, fmtData, hojeISO, nulo, campo, ligarForm, mostrarErro, limparErro } = App;
  const $ = id => document.getElementById(id);

  function tabelaGastos(gastos) {
    if (!gastos.length) return `<div class="empty">Nenhum gasto lançado ainda.</div>`;
    return `
      <table>
        <thead><tr><th>Descrição</th><th>Contrato</th><th>Valor</th><th>Data</th></tr></thead>
        <tbody>
          ${gastos.map(g => `
          <tr>
            <td class="strong">${esc(g.descricao)}${/^https?:\/\//i.test(g.comprovante_url || '') ? `<span class="sub"><a class="link" href="${esc(g.comprovante_url)}" target="_blank" rel="noopener">comprovante</a></span>` : ''}</td>
            <td class="mono">#${g.contrato_id}</td>
            <td class="mono">${brl(g.valor)}</td>
            <td class="mono">${fmtData(g.data_gasto, true)}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  async function carregar() {
    try {
      const [gastos, contratos] = await Promise.all([api('/gastos'), api('/contratos')]);
      limparErro();

      $('listaGastos').innerHTML = tabelaGastos(gastos);
      $('selContrato').innerHTML = contratos
        .map(c => `<option value="${c.id}">#${c.id} · ${esc(c.titulo)} (${esc(c.cliente_nome)})</option>`).join('');

      $('formGasto').hidden = !contratos.length;
      $('semContratos').hidden = !!contratos.length;
    } catch (e) {
      mostrarErro(e, carregar);
    }
  }

  // A data do gasto começa preenchida com hoje (e volta a hoje depois de salvar)
  function dataPadrao() { $('dataGasto').value = hojeISO(); }

  ligarForm('formGasto', fd => api('/gastos', {
    method: 'POST',
    body: JSON.stringify({
      contrato_id: Number(campo(fd, 'contrato_id')),
      descricao: campo(fd, 'descricao').trim(),
      valor: Number(campo(fd, 'valor')),
      data_gasto: campo(fd, 'data_gasto'),
      comprovante_url: nulo(campo(fd, 'comprovante_url')),
    }),
  }), async () => { dataPadrao(); await carregar(); });

  dataPadrao();
  carregar();
})();
