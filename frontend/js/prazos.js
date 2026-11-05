(function () {
    "use strict";

    const {
        api, esc, brl, fmtData, hojeISO, daquiADias,
        badge, estaConcluido, statusPrazo,
        ligarForm, mostrarErro, limparErro, tabela, link
    } = window.App;

    const $ = id => document.getElementById(id);

    function definirTexto(id, texto) {
        const elemento = $(id);
        if (elemento) elemento.textContent = texto;
    }

    function enviar(endpoint, fd) {
        return api(endpoint, {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(fd.entries()))
        });
    }

    function preencherSelect(id, registros, rotulo, primeiraOpcao) {
        const select = $(id);
        if (!select) return;

        const valorAnterior = select.value;

        select.innerHTML =
            `<option value="">${esc(primeiraOpcao)}</option>` +
            registros.map(registro => `
                <option value="${esc(registro.id)}">
                    ${esc(rotulo(registro))}
                </option>
            `).join('');

        if (registros.some(r => String(r.id) === valorAnterior)) {
            select.value = valorAnterior;
        }
    }

    function linhasContratos(registros) {
        return registros.map(c => `
            <tr>
                <td>${esc(c.cliente_nome || '—')}</td>
                <td>
                    ${esc(c.titulo)}
                    ${c.descricao
                        ? `<br><small>${esc(c.descricao)}</small>`
                        : ''}
                </td>
                <td>${brl(c.valor_total)}</td>
                <td>${badge(c.status)}</td>
                <td>${fmtData(c.data_inicio)}</td>
                <td>${fmtData(c.data_termino)}</td>
                <td>${link(c.link_minuta, 'Abrir')}</td>
            </tr>
        `);
    }

    async function iniciarClientes() {
        async function carregar() {
            try {
                const clientes = await api('/api/clientes');

                definirTexto(
                    'contagem',
                    `${clientes.length} cliente(s) cadastrado(s).`
                );

                $('listaClientes').innerHTML = tabela(
                    ['Nome', 'Contato', 'Documento', 'Desde'],
                    clientes.map(c => `
                        <tr>
                            <td>${esc(c.nome)}</td>
                            <td>
                                ${esc(c.email)}
                                ${c.telefone
                                    ? `<br><small>${esc(c.telefone)}</small>`
                                    : ''}
                            </td>
                            <td>${esc(c.cnpj_cpf || '—')}</td>
                            <td>${fmtData(c.criado_em)}</td>
                        </tr>
                    `),
                    'Nenhum cliente cadastrado.'
                );

                limparErro();
            } catch (erro) {
                mostrarErro(erro, carregar);
            }
        }

        ligarForm(
            'formCliente',
            fd => enviar('/api/clientes', fd),
            carregar
        );

        await carregar();
    }

    async function iniciarContratos() {
        let contratos = [];

        function renderizar() {
            const clienteId = $('filtroCliente')?.value || '';

            const filtrados = clienteId
                ? contratos.filter(c => String(c.cliente_id) === clienteId)
                : contratos;

            $('listaContratos').innerHTML = tabela(
                ['Cliente', 'Título', 'Valor', 'Status', 'Início', 'Término', 'Minuta'],
                linhasContratos(filtrados),
                'Nenhum contrato encontrado.'
            );
        }

        async function carregar() {
            try {
                const [clientes, lista] = await Promise.all([
                    api('/api/clientes'),
                    api('/api/contratos')
                ]);

                contratos = lista;

                preencherSelect(
                    'selCliente',
                    clientes,
                    c => c.nome,
                    'Selecione um cliente'
                );

                preencherSelect(
                    'filtroCliente',
                    clientes,
                    c => c.nome,
                    'Todos os clientes'
                );

                $('formContrato').hidden = clientes.length === 0;

                if ($('semClientes')) {
                    $('semClientes').hidden = clientes.length > 0;
                }

                renderizar();
                limparErro();
            } catch (erro) {
                mostrarErro(erro, carregar);
            }
        }

        $('filtroCliente')?.addEventListener('change', renderizar);

        ligarForm(
            'formContrato',
            fd => enviar('/api/contratos', fd),
            carregar
        );

        await carregar();
    }

    async function iniciarPrazos() {
        async function carregar() {
            try {
                const [contratos, prazos] = await Promise.all([
                    api('/api/contratos'),
                    api('/api/prazos')
                ]);

                preencherSelect(
                    'selContrato',
                    contratos,
                    c => `#${c.id} · ${c.titulo} (${c.cliente_nome || '—'})`,
                    'Selecione um contrato'
                );

                $('formPrazo').hidden = contratos.length === 0;

                if ($('semContratos')) {
                    $('semContratos').hidden = contratos.length > 0;
                }

                $('listaPrazos').innerHTML = tabela(
                    ['Descrição', 'Contrato', 'Vence', 'Status'],
                    prazos.map(p => `
                        <tr>
                            <td>${esc(p.descricao)}</td>
                            <td>
                                #${esc(p.contrato_id)}
                                <br>
                                <small>${esc(p.contrato_titulo || '—')}</small>
                            </td>
                            <td>${fmtData(p.data_limite)}</td>
                            <td>${badge(statusPrazo(p))}</td>
                        </tr>
                    `),
                    'Nenhum prazo cadastrado.'
                );

                limparErro();
            } catch (erro) {
                mostrarErro(erro, carregar);
            }
        }

        ligarForm(
            'formPrazo',
            fd => enviar('/api/prazos', fd),
            carregar
        );

        await carregar();
    }

    async function iniciarGastos() {
        function definirData() {
            if ($('dataGasto')) {
                $('dataGasto').value = hojeISO();
            }
        }

        async function carregar() {
            try {
                const [contratos, gastos] = await Promise.all([
                    api('/api/contratos'),
                    api('/api/gastos')
                ]);

                preencherSelect(
                    'selContrato',
                    contratos,
                    c => `#${c.id} · ${c.titulo} (${c.cliente_nome || '—'})`,
                    'Selecione um contrato'
                );

                $('formGasto').hidden = contratos.length === 0;

                if ($('semContratos')) {
                    $('semContratos').hidden = contratos.length > 0;
                }

                const total = gastos.reduce(
                    (soma, gasto) => soma + Number(gasto.valor || 0),
                    0
                );

                $('listaGastos').innerHTML = `
                    <p>Total registrado: ${brl(total)}</p>
                    ${tabela(
                        ['Descrição', 'Contrato', 'Valor', 'Data', 'Comprovante'],
                        gastos.map(g => `
                            <tr>
                                <td>${esc(g.descricao)}</td>
                                <td>
                                    #${esc(g.contrato_id)}
                                    <br>
                                    <small>${esc(g.contrato_titulo || '—')}</small>
                                </td>
                                <td>${brl(g.valor)}</td>
                                <td>${fmtData(g.data_gasto)}</td>
                                <td>${link(g.comprovante_url, 'Abrir')}</td>
                            </tr>
                        `),
                        'Nenhum gasto cadastrado.'
                    )}
                `;

                limparErro();
            } catch (erro) {
                mostrarErro(erro, carregar);
            }
        }

        ligarForm(
            'formGasto',
            fd => enviar('/api/gastos', fd),
            async () => {
                definirData();
                await carregar();
            }
        );

        definirData();
        await carregar();
    }

    async function iniciarDashboard() {
        async function carregar() {
            try {
                const [d, contratos, prazos] = await Promise.all([
                    api('/api/dashboard'),
                    api('/api/contratos?limit=5'),
                    api('/api/prazos')
                ]);

                definirTexto('statClientes', d.clientes.total);
                definirTexto(
                    'deltaClientes',
                    `+${d.clientes.novos_mes} este mês`
                );

                definirTexto('statContratos', d.contratos.em_andamento);
                definirTexto(
                    'deltaContratos',
                    `${d.contratos.encerram_30d} encerram em 30 dias`
                );

                definirTexto('statPrazos', d.prazos.proximos);
                definirTexto(
                    'deltaPrazos',
                    `${d.prazos.vencem_semana} nos próximos 7 dias` +
                    ` · ${d.prazos.atrasados} atrasados`
                );

                definirTexto('statGastos', brl(d.gastos.mes_atual));

                if (d.gastos.mes_anterior > 0) {
                    const variacao = Math.round(
                        (
                            (d.gastos.mes_atual - d.gastos.mes_anterior) /
                            d.gastos.mes_anterior
                        ) * 100
                    );

                    definirTexto(
                        'deltaGastos',
                        `${variacao >= 0 ? '+' : ''}${variacao}% vs. mês anterior`
                    );

                    $('deltaGastos')?.classList.toggle('warn', variacao > 0);
                } else {
                    definirTexto(
                        'deltaGastos',
                        'Sem gastos no mês anterior'
                    );

                    $('deltaGastos')?.classList.remove('warn');
                }

                $('contratosRecentes').innerHTML = tabela(
                    ['Cliente', 'Contrato', 'Valor', 'Status'],
                    contratos.map(c => `
                        <tr>
                            <td>${esc(c.cliente_nome || '—')}</td>
                            <td>${esc(c.titulo)}</td>
                            <td>${brl(c.valor_total)}</td>
                            <td>${badge(c.status)}</td>
                        </tr>
                    `),
                    'Nenhum contrato cadastrado.'
                );

                const hoje = hojeISO();
                const fim = daquiADias(7);

                const proximos = prazos
                    .filter(p => {
                        const limite = String(p.data_limite || '').slice(0, 10);

                        return (
                            !estaConcluido(p) &&
                            limite >= hoje &&
                            limite < fim
                        );
                    })
                    .sort((a, b) =>
                        String(a.data_limite).localeCompare(String(b.data_limite))
                    );

                $('prazosSemana').innerHTML = tabela(
                    ['Entrega', 'Vence'],
                    proximos.map(p => `
                        <tr>
                            <td>
                                ${esc(p.descricao)}
                                <br>
                                <small>
                                    ${esc(p.contrato_titulo || '—')}
                                    · #${esc(p.contrato_id)}
                                </small>
                            </td>
                            <td>${fmtData(p.data_limite, true)}</td>
                        </tr>
                    `),
                    'Nenhum prazo pendente nos próximos 7 dias.'
                );

                limparErro();
            } catch (erro) {
                mostrarErro(erro, carregar);
            }
        }

        // Mantém a abertura e o fechamento visual do chat.
        // Nenhuma API de IA foi adicionada neste ajuste.
        $('btnChat')?.addEventListener('click', () => {
            const janela = $('janelaChat');
            if (!janela) return;

            const visivel = getComputedStyle(janela).display !== 'none';

            janela.hidden = visivel;
            janela.style.display = visivel ? 'none' : 'flex';
        });

        $('fecharChat')?.addEventListener('click', () => {
            const janela = $('janelaChat');
            if (!janela) return;

            janela.hidden = true;
            janela.style.display = 'none';
        });

        $('formChat')?.addEventListener('submit', evento => {
            evento.preventDefault();

            window.App.toast(
                'O assistente de IA não está conectado a uma API neste ajuste.',
                true
            );
        });

        await carregar();
    }

    async function iniciar() {
        if ($('formCliente')) return iniciarClientes();
        if ($('formContrato')) return iniciarContratos();
        if ($('formPrazo')) return iniciarPrazos();
        if ($('formGasto')) return iniciarGastos();
        if ($('statClientes')) return iniciarDashboard();
    }

    function executar() {
        iniciar().catch(erro => mostrarErro(erro, executar));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executar, { once: true });
    } else {
        executar();
    }
})();