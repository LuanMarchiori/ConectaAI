# Manual Operacional — Conecta.ai

## 1. Objetivo

Orientar o responsável pela microempresa no uso diário do sistema para registrar clientes, serviços contratados, entregas e despesas.

O aplicativo auxilia a organização. Não substitui acompanhamento contábil ou obrigações fiscais.

## 2. Antes de abrir

Verifique:

- O computador está ligado e com data correta.
- O MySQL está iniciado no XAMPP.
- A pasta do aplicativo não foi movida ou apagada.
- O atalho aponta para o executável correto.

Dê dois cliques no atalho do Conecta.ai/GestaoMEI.

Abra apenas uma instância por vez.

## 3. Ordem de utilização

```text
Cadastrar cliente
        ↓
Cadastrar contrato do cliente
        ↓
Registrar prazos e gastos do contrato
        ↓
Acompanhar listas e dashboard
```

Prazos e gastos precisam de um contrato existente. O contrato precisa de um cliente.

## 4. Cadastrar cliente

1. Clique em `Clientes`.
2. Informe o nome completo ou razão social.
3. Preencha o e-mail.
4. Preencha a senha provisória conforme a política definida pelo responsável.
5. Informe telefone e CPF/CNPJ, quando disponíveis.
6. Clique no botão de cadastro.
7. Aguarde a mensagem de sucesso.
8. Confira o nome na lista.

O campo de senha não significa que um portal de login esteja disponível nesta versão.

Revise CPF/CNPJ e e-mail antes de salvar: a interface atual não permite corrigir registros existentes.

## 5. Cadastrar contrato

1. Clique em `Contratos`.
2. Selecione o cliente.
3. Informe um título objetivo.
4. Descreva o serviço.
5. Informe o valor total.
6. Adicione o link da minuta, se houver.
7. Informe início e término, quando aplicáveis.
8. Clique no botão de cadastro.
9. Confirme o registro na lista.

O cadastro usa `Em Análise` como status padrão quando nenhum status é informado.

O link da minuta precisa apontar para um arquivo acessível. O aplicativo não faz upload do documento.

### Filtrar contratos

Use o campo de filtro por cliente.

Para voltar à lista completa, selecione `Todos os clientes`.

## 6. Registrar prazo

1. Clique em `Prazos`.
2. Escolha o contrato.
3. Descreva uma entrega verificável.
4. Informe a data limite.
5. Escolha um status disponível.
6. Salve.
7. Confira descrição, contrato e vencimento na lista.

Exemplo de descrição:

```text
Entregar a primeira versão do site para avaliação
```

Um prazo pendente anterior à data atual pode aparecer como atrasado.

Essa indicação é calculada para exibição; não significa que o sistema atualizou automaticamente o status no banco.

A versão atual não oferece edição de prazo nem botão para concluir um registro existente. Quando precisar corrigir ou concluir um prazo já cadastrado, solicite suporte técnico.

## 7. Registrar gasto

1. Clique em `Gastos`.
2. Escolha o contrato relacionado.
3. Informe uma descrição clara.
4. Preencha o valor.
5. Confira a data do gasto.
6. Inclua o link do comprovante, se houver.
7. Salve.
8. Confira o lançamento na lista.

A data é preenchida inicialmente com o dia atual, mas deve representar a data real da despesa.

O total da lista de gastos considera todos os registros listados. O dashboard mostra apenas o mês corrente.

Links de comprovantes não substituem o armazenamento seguro dos documentos originais.

## 8. Interpretar a visão geral

### Clientes

Quantidade total cadastrada e novos cadastros do mês.

### Contratos em andamento

Contagem dos contratos em status considerados em andamento pelo sistema.

### Prazos próximos

Entregas não concluídas com vencimento nos próximos 7 dias, incluindo hoje.

Prazos de outros períodos não aparecem nessa seção.

### Gastos no mês

Soma dos gastos com data no mês corrente.

Um indicador de R$ 0,00 não significa que todos os gastos foram apagados. Consulte a página `Gastos` e confira as datas.

### Contratos recentes

Mostra até cinco contratos cadastrados mais recentemente.

## 9. Rotina diária

Ao iniciar:

1. Abra o aplicativo.
2. Confira os indicadores.
3. Consulte os prazos.
4. Verifique os contratos relevantes.

Durante o trabalho:

1. Cadastre novos clientes.
2. Registre os contratos.
3. Lance prazos e despesas.
4. Confirme a mensagem de sucesso após cada cadastro.

Ao terminar:

1. Revise os lançamentos do dia.
2. Feche a janela.
3. Siga a rotina de backup definida pelo responsável técnico.

## 10. Cuidados

- Não clique várias vezes para tentar repetir um cadastro.
- Não compartilhe senhas ou arquivos `.env`.
- Não apague `_internal`.
- Não mova somente o executável.
- Não altere a data do computador para modificar indicadores.
- Não use o banco de produção para exercícios de treinamento.
- Não presuma que fechar o programa apaga dados: os registros ficam no banco.

## 11. Problemas comuns

| Situação | Ação inicial |
|---|---|
| Aplicativo não abre | Verificar se já existe uma janela aberta e se a pasta foi movida |
| Lista não carrega | Confirmar que o MySQL está iniciado |
| Erro interno | Registrar a mensagem e solicitar diagnóstico técnico |
| Cliente não aparece no contrato | Confirmar o cadastro e reabrir a página |
| Sem contratos para selecionar | Cadastrar primeiro um cliente e um contrato |
| Gasto não aparece no indicador mensal | Conferir a data do lançamento na lista de gastos |
| Prazo não aparece no dashboard | Conferir data e status na página de prazos |
| Link não abre | Conferir endereço e permissão do documento externo |
| Dado cadastrado incorretamente | Solicitar correção técnica; não duplicar automaticamente o registro |

Não reinstale nem importe backups para tentar resolver um erro de carregamento sem orientação.

## 12. Backup

O responsável técnico deve definir frequência, local e retenção dos backups.

Procedimento manual sugerido para o responsável autorizado:

1. Abrir o phpMyAdmin.
2. Selecionar `mei_dashboard`.
3. Abrir `Exportar`.
4. Selecionar formato SQL e conferir inclusão de estrutura e dados.
5. Executar a exportação.
6. Guardar o arquivo em local protegido, identificado por data.
7. Testar periodicamente a restauração em um banco separado.

Copiar a pasta do executável não salva os registros do MySQL.

Não publique exportações com dados pessoais no GitHub.

## 13. Como pedir suporte

Informe:

- Tela em que ocorreu o problema.
- Operação tentada.
- Horário aproximado.
- Mensagem completa.
- Se o erro ocorre pelo atalho, pelo Python ou nos dois.
- Se o MySQL está iniciado.

Não envie senhas. O suporte pode solicitar logs com informações sensíveis removidas.