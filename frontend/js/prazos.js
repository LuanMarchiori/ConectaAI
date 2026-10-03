/* Página: Prazos (prazos.html) */
(function () {
  "use strict";
  const { api, esc, fmtData, badge, estaConcluido, statusPrazo, toast, campo, ligarForm, mostrarErro, limparErro } = App;
  const $ = id => document.getElementById(id);

  function tabelaPrazos(prazos) {
    if (!prazos.length) return `<div class="empty">Nenhum prazo cadastrado ainda.</div>`;
    return `
      <table>
        <thead><tr><th>Descrição</th><th>Contrato</th><th>Vence</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${prazos.map(p => `
          <tr>
            <td class="strong">${esc(p.descricao)}</td>
            <td class="mono">#${p.contrato_id}</td>
            <td class="mono">${fmtData(p.data_limite, true)}</td>
            <td>${badge(statusPrazo(p))}</td>
            <td>${estaConcluido(p) ? '' : `<button class="btn secondary small" data-concluir="${p.id}">Concluir</button>`}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  async function carregar() {
    try {
      const [prazos, contratos] = await Promise.all([api('/prazos'), api('/contratos')]);
      limparErro();

      $('listaPrazos').innerHTML = tabelaPrazos(prazos);
      $('selContrato').innerHTML = contratos
        .map(c => `<option value="${c.id}">#${c.id} · ${esc(c.titulo)} (${esc(c.cliente_nome)})</option>`).join('');

      $('formPrazo').hidden = !contratos.length;
      $('semContratos').hidden = !!contratos.length;
    } catch (e) {
      mostrarErro(e, carregar);
    }
  }

  // Botão "Concluir" de cada linha (a tabela é redesenhada, então escutamos o contêiner)
  $('listaPrazos').addEventListener('click', async ev => {
    const btn = ev.target.closest('[data-concluir]');
    if (!btn) return;
    btn.disabled = true;
    try {
      await api(`/prazos/${btn.dataset.concluir}`, { method: 'PATCH', body: JSON.stringify({ status: 'Concluído' }) });
      toast('Prazo concluído!');
      await carregar();
    } catch (e) {
      toast(e.message, true);
      btn.disabled = false;
    }
  });

  ligarForm('formPrazo', fd => api('/prazos', {
    method: 'POST',
    body: JSON.stringify({
      contrato_id: Number(campo(fd, 'contrato_id')),
      descricao: campo(fd, 'descricao').trim(),
      data_limite: campo(fd, 'data_limite'),
      status: campo(fd, 'status') || 'Pendente',
    }),
  }), carregar);

  carregar();
})();
