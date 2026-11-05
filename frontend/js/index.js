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

  // ========================================== //
  // LÓGICA DO CHATBOT GEMINI                   //
  // ========================================== //
  const btnChat = $('btnChat');
  const janelaChat = $('janelaChat');
  const fecharChat = $('fecharChat');
  const formChat = $('formChat');
  const inputChat = $('inputChat');
  const mensagensChat = $('mensagensChat');
  const btnEnviarChat = $('btnEnviarChat');

  // Alterna a visibilidade da janela
  if (btnChat) {
      btnChat.addEventListener('click', () => {
        janelaChat.style.display = janelaChat.style.display === 'none' ? 'flex' : 'none';
        if (janelaChat.style.display === 'flex') inputChat.focus();
      });
  }
  
  if(fecharChat) {
      fecharChat.addEventListener('click', () => janelaChat.style.display = 'none');
  }

  // Função para adicionar balões de mensagem na tela
  function addMensagem(texto, remetente) {
    const div = document.createElement('div');
    div.style.padding = '12px';
    div.style.borderRadius = '8px';
    div.style.maxWidth = '85%';
    div.style.lineHeight = '1.4';

    if (remetente === 'usuario') {
      div.style.background = 'var(--ink)';
      div.style.color = 'var(--paper)';
      div.style.alignSelf = 'flex-end';
    } else {
      div.style.background = 'var(--amber-wash)';
      div.style.color = 'var(--amber-ink)';
      div.style.alignSelf = 'flex-start';
    }
    
    // Converte quebras de linha em <br> para manter a formatação
    div.innerHTML = esc(texto).replace(/\n/g, '<br>');
    mensagensChat.appendChild(div);
    mensagensChat.scrollTop = mensagensChat.scrollHeight;
  }

  // Envia a mensagem para a API
  if (formChat) {
      formChat.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = inputChat.value.trim();
        if (!msg) return;

        // Coloca a mensagem do usuário na tela e bloqueia o input temporariamente
        addMensagem(msg, 'usuario');
        inputChat.value = '';
        inputChat.disabled = true;
        btnEnviarChat.disabled = true;

        try {
          // Faz a requisição POST para a nossa rota do FastAPI
          const resp = await api('/chat', {
            method: 'POST',
            body: JSON.stringify({ mensagem: msg })
          });
          addMensagem(resp.resposta, 'ia');
        } catch (err) {
          addMensagem('Desculpe, ocorreu um erro ao contactar a IA.', 'ia');
          console.error(err);
        } finally {
          inputChat.disabled = false;
          btnEnviarChat.disabled = false;
          inputChat.focus();
        }
      });
  }

  // Inicia o carregamento da página
  carregar();
})();