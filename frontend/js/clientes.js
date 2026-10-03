/* Página: Clientes (clientes.html) */
(function () {
  "use strict";
  const { api, esc, initials, fmtData, nulo, campo, ligarForm, mostrarErro, limparErro } = App;
  const $ = id => document.getElementById(id);

  async function carregar() {
    try {
      const clientes = await api('/clientes');
      limparErro();
      const n = clientes.length;
      $('contagem').textContent = `${n} cliente${n === 1 ? '' : 's'} cadastrado${n === 1 ? '' : 's'}.`;
      $('listaClientes').innerHTML = n ? `
        <table>
          <thead><tr><th>Nome</th><th>Contato</th><th>Documento</th><th>Desde</th></tr></thead>
          <tbody>
            ${clientes.map(c => `
              <tr>
                <td class="name-cell"><span class="avatar">${esc(initials(c.nome))}</span>${esc(c.nome)}</td>
                <td>${esc(c.email)}${c.telefone ? `<span class="sub mono">${esc(c.telefone)}</span>` : ''}</td>
                <td class="mono">${esc(c.cnpj_cpf || '—')}</td>
                <td class="mono">${fmtData(c.criado_em)}</td>
              </tr>`).join('')}
          </tbody>
        </table>` : `<div class="empty">Nenhum cliente cadastrado ainda.</div>`;
    } catch (e) {
      mostrarErro(e, carregar);
    }
  }

  ligarForm('formCliente', fd => api('/clientes', {
    method: 'POST',
    body: JSON.stringify({
      nome: campo(fd, 'nome').trim(),
      email: campo(fd, 'email').trim(),
      senha: campo(fd, 'senha'),
      telefone: nulo(campo(fd, 'telefone')),
      cnpj_cpf: nulo(campo(fd, 'cnpj_cpf')),
    }),
  }), carregar);

  carregar();
})();
