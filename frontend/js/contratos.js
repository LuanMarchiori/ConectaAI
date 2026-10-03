/* Página: Contratos (contratos.html) */
(function () {
  "use strict";
  const { api, esc, brl, fmtData, badge, nulo, campo, ligarForm, mostrarErro, limparErro } = App;
  const $ = id => document.getElementById(id);

  function tabelaContratos(lista, comCliente) {
    if (!lista.length) return `<div class="empty">Nenhum contrato encontrado.</div>`;
    return `
      <table style="margin-top:6px;">
        <thead><tr>${comCliente ? '<th>Cliente</th>' : ''}<th>Título</th><th>Valor</th><th>Status</th><th>Início</th><th>Término</th><th>Minuta</th></tr></thead>
        <tbody>
          ${lista.map(c => `
          <tr>
            ${comCliente ? `<td>${esc(c.cliente_nome)}</td>` : ''}
            <td class="strong">${esc(c.titulo)}${c.descricao ? `<span class="sub">${esc(c.descricao)}</span>` : ''}</td>
            <td class="mono">${brl(c.valor_total)}</td>
            <td>${badge(c.status)}</td>
            <td class="mono">${fmtData(c.data_inicio)}</td>
            <td class="mono">${fmtData(c.data_termino)}</td>
            <td>${/^https?:\/\//i.test(c.link_minuta || '') ? `<a class="link" href="${esc(c.link_minuta)}" target="_blank" rel="noopener">abrir</a>` : '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  // Mostra a tabela conforme o cliente escolhido no filtro
  async function atualizarLista() {
    const id = $('filtroCliente').value;
    try {
      $('listaContratos').innerHTML = id
        ? tabelaContratos(await api(`/contratos/${id}`), false)
        : tabelaContratos(await api('/contratos'), true);
    } catch (e) {
      // A API devolve 404 quando o cliente não tem contratos
      $('listaContratos').innerHTML = e.status === 404
        ? `<div class="empty">Nenhum contrato encontrado para este cliente.</div>`
        : `<div class="empty">${esc(e.message)}</div>`;
    }
  }

  async function carregar() {
    try {
      const clientes = await api('/clientes');
      limparErro();

      const opcoes = clientes.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join('');
      const filtro = $('filtroCliente');
      const escolhido = filtro.value;
      filtro.innerHTML = `<option value="">Todos os clientes</option>${opcoes}`;
      filtro.value = escolhido;
      $('selCliente').innerHTML = opcoes;

      // Sem clientes não dá para criar contrato
      $('formContrato').hidden = !clientes.length;
      $('semClientes').hidden = !!clientes.length;

      await atualizarLista();
    } catch (e) {
      mostrarErro(e, carregar);
    }
  }

  $('filtroCliente').addEventListener('change', atualizarLista);

  ligarForm('formContrato', fd => api('/contratos', {
    method: 'POST',
    body: JSON.stringify({
      cliente_id: Number(campo(fd, 'cliente_id')),
      titulo: campo(fd, 'titulo').trim(),
      descricao: nulo(campo(fd, 'descricao')),
      valor_total: Number(campo(fd, 'valor_total')),
      data_inicio: nulo(campo(fd, 'data_inicio')),
      data_termino: nulo(campo(fd, 'data_termino')),
      link_minuta: nulo(campo(fd, 'link_minuta')),
    }),
  }), atualizarLista);

  carregar();
})();
