(function () {
  "use strict";
  const API = location.protocol.startsWith('http') ? location.origin : 'http://localhost:8000';

  const $toast = document.getElementById('toast');
  let toastTimer;

  /* ---------- Utilidades ---------- */
  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function initials(name) {
    return String(name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
  function brl(v) {
    return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  // Datas da API chegam como "2026-09-23" (ou ISO completo). Formata sem sofrer com fuso horário.
  function fmtData(v, curta) {
    if (!v) return '—';
    const [y, m, d] = String(v).slice(0, 10).split('-');
    return curta ? `${d}/${m}` : `${d}/${m}/${y}`;
  }
  function paraISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function hojeISO() { return paraISO(new Date()); }
  function daquiADias(n) { const d = new Date(); d.setDate(d.getDate() + n); return paraISO(d); }
  function nulo(v) { v = (v || '').trim(); return v === '' ? null : v; }
  // Lê um campo de FormData como texto
  function campo(fd, k) { return (fd.get(k) || '').toString(); }

  /* ---------- Avisos ---------- */
  function toast(msg, erro) {
    if (!$toast) return;
    clearTimeout(toastTimer);
    $toast.textContent = msg;
    $toast.classList.toggle('err', !!erro);
    $toast.classList.add('show');
    toastTimer = setTimeout(() => $toast.classList.remove('show'), 4200);
  }

  /* ---------- Chamadas à API ---------- */
  async function api(path, options) {
    let res;
    try {
      res = await fetch(API + path, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
    } catch (e) {
      throw new Error('Não foi possível conectar à API. Verifique se o servidor está rodando.');
    }
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).detail; } catch (e) { /* sem corpo */ }
      if (Array.isArray(detail)) detail = 'Verifique os campos preenchidos.';
      const err = new Error(detail || `Erro ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  /* ---------- Status ---------- */
  function statusClasse(s) {
    const t = String(s || '').toLowerCase();
    if (t.includes('conclu') || t.includes('pago')) return 'concluido';
    if (t.includes('atras') || t.includes('cancel')) return 'atrasado';
    if (t.includes('andamento') || t.includes('ativo')) return 'ativo';
    return 'pendente';
  }
  function badge(s) { return `<span class="badge ${statusClasse(s)}">${esc(s || '—')}</span>`; }
  function estaConcluido(p) { return String(p.status).toLowerCase().includes('conclu'); }

  // Prazo não concluído com data anterior a hoje aparece como "Atrasado"
  function statusPrazo(p) {
    if (!estaConcluido(p) && String(p.data_limite).slice(0, 10) < hojeISO()) return 'Atrasado';
    return p.status;
  }

  /* ---------- Formulários ---------- */
  // Envia um formulário: bloqueia o botão, mostra aviso e recarrega os dados em caso de sucesso
  function ligarForm(id, enviar, aoSucesso) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      try {
        const resp = await enviar(new FormData(form));
        toast(resp.mensagem || 'Salvo com sucesso!');
        form.reset();
        if (aoSucesso) await aoSucesso();
      } catch (e) {
        toast(e.message, true);
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---------- Erro de carregamento ---------- */
  // Mostra um painel de erro no topo da página, com botão para tentar de novo
  function mostrarErro(e, tentarDeNovo) {
    const box = document.getElementById('erro');
    if (!box) return;
    box.innerHTML = `
      <div class="panel" style="margin-bottom:22px;">
        <h2>Não foi possível carregar os dados</h2>
        <p class="hint">${esc(e.message)}</p>
        <button class="btn secondary" id="retry">Tentar novamente</button>
      </div>`;
    document.getElementById('retry').addEventListener('click', () => { limparErro(); tentarDeNovo(); });
  }
  function limparErro() {
    const box = document.getElementById('erro');
    if (box) box.innerHTML = '';
  }

  /* ---------- Menu do celular ---------- */
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => document.getElementById('tabsNav').classList.toggle('open'));
  }

  // Tudo fica disponível para os scripts das páginas em window.App
  window.App = {
    api, esc, initials, brl, fmtData, hojeISO, daquiADias, nulo, campo,
    toast, badge, estaConcluido, statusPrazo, ligarForm, mostrarErro, limparErro,
  };
})();
