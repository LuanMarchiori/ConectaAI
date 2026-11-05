(function () {
    "use strict";

    const $ = id => document.getElementById(id);
    let toastTimer;

    function esc(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, caractere => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[caractere]));
    }

    function initials(nome) {
        return String(nome || '?')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(parte => parte[0])
            .join('')
            .toUpperCase();
    }

    function brl(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function paraISO(data) {
        return [
            data.getFullYear(),
            String(data.getMonth() + 1).padStart(2, '0'),
            String(data.getDate()).padStart(2, '0')
        ].join('-');
    }

    function hojeISO() {
        return paraISO(new Date());
    }

    function daquiADias(numero) {
        const data = new Date();
        data.setDate(data.getDate() + numero);
        return paraISO(data);
    }

    function fmtData(valor, curta = false) {
        if (!valor) return '—';

        const texto = String(valor);
        let iso;

        if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
            iso = texto.slice(0, 10);
        } else {
            const data = new Date(texto);

            if (Number.isNaN(data.getTime())) return '—';

            iso = [
                data.getUTCFullYear(),
                String(data.getUTCMonth() + 1).padStart(2, '0'),
                String(data.getUTCDate()).padStart(2, '0')
            ].join('-');
        }

        const [ano, mes, dia] = iso.split('-');
        return curta ? `${dia}/${mes}` : `${dia}/${mes}/${ano}`;
    }

    function campo(fd, chave) {
        return String(fd.get(chave) ?? '').trim();
    }

    function nulo(valor) {
        const texto = String(valor ?? '').trim();
        return texto || null;
    }

    function toast(mensagem, erro = false) {
        const elemento = $('toast');

        if (!elemento) {
            console[erro ? 'error' : 'log'](mensagem);
            return;
        }

        clearTimeout(toastTimer);
        elemento.textContent = mensagem;
        elemento.classList.toggle('err', erro);
        elemento.classList.add('show');

        toastTimer = setTimeout(() => {
            elemento.classList.remove('show');
        }, 5000);
    }

    async function api(path, options = {}) {
        const endpoint = path.startsWith('/api/')
            ? path
            : '/api/' + path.replace(/^\/+/, '');

        let res;

        try {
            res = await fetch(endpoint, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                },
                cache: 'no-store'
            });
        } catch (erro) {
            throw new Error(
                'Não foi possível conectar ao servidor. Verifique o terminal.'
            );
        }

        const texto = await res.text();
        let dados;

        try {
            dados = texto ? JSON.parse(texto) : null;
        } catch (erro) {
            throw new Error(
                `${endpoint} retornou conteúdo que não é JSON. HTTP ${res.status}.`
            );
        }

        if (!res.ok) {
            const erro = new Error(
                dados?.error ||
                dados?.detail ||
                dados?.message ||
                `Erro HTTP ${res.status}`
            );

            erro.status = res.status;
            throw erro;
        }

        return dados;
    }

    function statusClasse(status) {
        const texto = String(status || '').toLowerCase();

        if (texto.includes('conclu') || texto.includes('pago')) {
            return 'concluido';
        }

        if (texto.includes('atras') || texto.includes('cancel')) {
            return 'atrasado';
        }

        if (texto.includes('andamento') || texto === 'ativo') {
            return 'ativo';
        }

        return 'pendente';
    }

    function badge(status) {
        return `<span class="badge ${statusClasse(status)}">${esc(status || '—')}</span>`;
    }

    function estaConcluido(prazo) {
        return String(prazo.status || '').toLowerCase().includes('conclu');
    }

    function statusPrazo(prazo) {
        const limite = String(prazo.data_limite || '').slice(0, 10);

        if (!estaConcluido(prazo) && limite && limite < hojeISO()) {
            return 'Atrasado';
        }

        return prazo.status || 'Pendente';
    }

    function mostrarErro(erro, tentarNovamente) {
        console.error(erro);

        const box = $('erro');
        if (!box) return;

        box.hidden = false;
        box.style.display = 'block';
        box.replaceChildren();

        const mensagem = document.createElement('p');
        mensagem.textContent = erro?.message || String(erro);
        box.appendChild(mensagem);

        if (typeof tentarNovamente === 'function') {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.textContent = 'Tentar novamente';
            botao.addEventListener('click', tentarNovamente);
            box.appendChild(botao);
        }
    }

    function limparErro() {
        const box = $('erro');
        if (!box) return;

        box.replaceChildren();
        box.hidden = true;
        box.style.display = 'none';
    }

    function ligarForm(id, enviar, aoSucesso) {
        const form = $(id);
        if (!form) return;

        form.addEventListener('submit', async evento => {
            evento.preventDefault();

            const botao = form.querySelector('button[type="submit"]');
            if (botao) botao.disabled = true;

            try {
                const resposta = await enviar(new FormData(form));
                toast(resposta?.message || 'Salvo com sucesso!');
                form.reset();

                if (aoSucesso) await aoSucesso();
            } catch (erro) {
                toast(erro.message, true);
            } finally {
                if (botao) botao.disabled = false;
            }
        });
    }

    function tabela(cabecalhos, linhas, vazio) {
        if (!linhas.length) {
            return `<p class="empty">${esc(vazio)}</p>`;
        }

        return `
            <div class="table-wrap" style="overflow-x:auto">
                <table>
                    <thead>
                        <tr>
                            ${cabecalhos.map(c => `<th>${esc(c)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>${linhas.join('')}</tbody>
                </table>
            </div>
        `;
    }

    function link(url, rotulo) {
        if (!/^https?:\/\//i.test(String(url || ''))) return '—';

        return `<a href="${esc(url)}" target="_blank"
                   rel="noopener noreferrer">${esc(rotulo)}</a>`;
    }

    $('menuBtn')?.addEventListener('click', () => {
        $('tabsNav')?.classList.toggle('open');
    });

    window.App = {
        api, esc, initials, brl, fmtData, paraISO,
        hojeISO, daquiADias, campo, nulo, toast,
        statusClasse, badge, estaConcluido, statusPrazo,
        mostrarErro, limparErro, ligarForm, tabela, link
    };
})();