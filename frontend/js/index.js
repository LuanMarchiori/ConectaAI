/* Página: Visão geral (index.html) */
(function () {
  "use strict";
  const { api, esc, initials, brl, fmtData, hojeISO, daquiADias, badge, estaConcluido, mostrarErro, limparErro } = App;
  const $ = id => document.getElementById(id);

  async function carregar() {
    try {
      const [d, recentes, prazos] = await Promise.all([
        api('/dashboard'), api('/contratos?limit=5'), api('/prazos'),
      ]);
      limparErro();

      // ----- Números do topo -----
      $('statClientes').textContent = d.clientes.total;
      $('deltaClientes').textContent = `+${d.clientes.novos_mes} este mês`;

      $('statContratos').textContent = d.contratos.em_andamento;
      $('deltaContratos').textContent = `${d.contratos.encerram_30d} encerram em 30 dias`;

      $('statPrazos').textContent = d.prazos.proximos;
      const v = d.prazos.vencem_semana, a = d.prazos.atrasados;
      $('deltaPrazos').textContent =
        `${v} vence${v === 1 ? '' : 'm'} esta semana` + (a ? ` · ${a} atrasado${a === 1 ? '' : 's'}` : '');

      const g = d.gastos;
      $('statGastos').textContent = brl(g.mes_atual);
      const dg = $('deltaGastos');
      if (g.mes_anterior > 0) {
        const pct = Math.round((g.mes_atual - g.mes_anterior) / g.mes_anterior * 100);
        dg.textContent = `${pct >= 0 ? '+' : ''}${pct}% vs. mês anterior`;
        dg.classList.toggle('warn', pct > 0);
      } else {
        dg.textContent = 'sem gastos no mês anterior';
        dg.classList.remove('warn');
      }

      // ----- Contratos recentes -----
      $('contratosRecentes').innerHTML = recentes.length ? `
        <table>
          <thead><tr><th>Cliente</th><th>Contrato</th><th>Valor</th><th>Status</th></tr></thead>
          <tbody>
            ${recentes.map(c => `
            <tr>
              <td class="name-cell"><span class="avatar">${esc(initials(c.cliente_nome))}</span>${esc(c.cliente_nome)}</td>
              <td class="strong">${esc(c.titulo)}</td>
              <td class="mono">${brl(c.valor_total)}</td>
              <td>${badge(c.status)}</td>
            </tr>`).join('')}
          </tbody>
        </table>` : `<div class="empty">Nenhum contrato cadastrado ainda.</div>`;

      // ----- Prazos dos próximos 7 dias -----
      const hoje = hojeISO(), lim = daquiADias(7);
      const daSemana = prazos.filter(p => {
        const dt = String(p.data_limite).slice(0, 10);
        return !estaConcluido(p) && dt >= hoje && dt <= lim;
      });
      $('prazosSemana').innerHTML = daSemana.length ? `
        <table>
          <thead><tr><th>Entrega</th><th>Vence</th></tr></thead>
          <tbody>
            ${daSemana.map(p => `
            <tr><td class="strong">${esc(p.descricao)}<span class="sub">${esc(p.contrato_titulo)} · #${p.contrato_id}</span></td><td class="mono">${fmtData(p.data_limite, true)}</td></tr>`).join('')}
          </tbody>
        </table>` : `<div class="empty">Nenhum prazo vencendo nesta semana.</div>`;
    } catch (e) {
      mostrarErro(e, carregar);
    }
  }

  carregar();
})();
