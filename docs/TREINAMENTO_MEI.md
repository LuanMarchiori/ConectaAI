# Treinamento Prático do MEI — Conecta.ai

## 1. Objetivo

Ao final do treinamento, o participante deverá conseguir:

- Abrir e fechar o aplicativo.
- Cadastrar um cliente.
- Vincular um contrato ao cliente.
- Registrar prazo e gasto para o contrato.
- Localizar os registros.
- Interpretar os indicadores.
- Identificar situações que exigem suporte.

Tempo sugerido: 45 a 60 minutos, ajustado ao ritmo do participante.

## 2. Preparação pelo instrutor

Antes da sessão:

- Validar o executável e o atalho.
- Iniciar o MySQL.
- Preparar um banco exclusivo de treinamento.
- Configurar a aplicação para esse banco.
- Confirmar que nenhum dado real será utilizado.
- Verificar a data do computador.
- Confirmar os nomes dos botões na versão instalada.

Não usar o banco real para exercícios: a versão atual não possui exclusão pela interface.

## 3. Etapa 1 — Conhecer o sistema

Duração sugerida: 5 minutos.

O instrutor apresenta:

- Visão geral.
- Clientes.
- Contratos.
- Prazos.
- Gastos.

Explicar a sequência:

```text
Cliente → Contrato → Prazo e gasto
```

Verificação:

O participante explica, com suas palavras, por que precisa cadastrar um cliente antes do contrato.

## 4. Etapa 2 — Cadastrar cliente fictício

Duração sugerida: 10 minutos.

Dados de exercício:

| Campo | Valor |
|---|---|
| Nome | Cliente Treinamento 01 |
| E-mail | treinamento01@example.com |
| Senha provisória | Definida apenas para o exercício |
| Telefone | Deixar vazio |
| CPF/CNPJ | Deixar vazio |

Passos:

1. Abrir `Clientes`.
2. Preencher os campos.
3. Salvar.
4. Aguardar a mensagem de sucesso.
5. Localizar o cliente na lista.

Critério de conclusão:

O participante encontra o cliente sem ajuda e confirma o nome e o e-mail.

## 5. Etapa 3 — Registrar contrato

Duração sugerida: 10 minutos.

Dados:

| Campo | Valor |
|---|---|
| Cliente | Cliente Treinamento 01 |
| Título | Serviço de treinamento |
| Descrição | Exercício de uso do sistema |
| Valor total | 500,00 |
| Início | Data atual |
| Término | Data posterior ao início |
| Link da minuta | Deixar vazio |

Passos:

1. Abrir `Contratos`.
2. Selecionar o cliente.
3. Preencher e salvar.
4. Filtrar pelo cliente.
5. Localizar o contrato.
6. Voltar a `Todos os clientes`.

Critério de conclusão:

O contrato aparece associado ao cliente correto e com valor de R$ 500,00.

## 6. Etapa 4 — Registrar uma entrega

Duração sugerida: 5 minutos.

Dados:

| Campo | Valor |
|---|---|
| Contrato | Serviço de treinamento |
| Descrição | Entrega demonstrativa |
| Data limite | Amanhã |
| Status | Pendente |

Passos:

1. Abrir `Prazos`.
2. Selecionar o contrato.
3. Preencher e salvar.
4. Conferir a lista.
5. Abrir a visão geral.

Critério de conclusão:

A entrega aparece na lista e entre os prazos próximos, considerando a data correta do computador.

Explicar:

A atualização de status de um prazo existente ainda não está disponível pela interface.

## 7. Etapa 5 — Registrar despesa

Duração sugerida: 5 minutos.

Dados:

| Campo | Valor |
|---|---|
| Contrato | Serviço de treinamento |
| Descrição | Material demonstrativo |
| Valor | 25,00 |
| Data | Hoje |
| Comprovante | Deixar vazio |

Passos:

1. Abrir `Gastos`.
2. Selecionar o contrato.
3. Registrar a despesa.
4. Conferir a lista.
5. Voltar ao dashboard.

Critério de conclusão:

O gasto aparece vinculado ao contrato. Se o banco de treinamento estava vazio, o indicador mensal deve mostrar R$ 25,00.

Se já havia despesas, comparar o total anterior com o novo.

## 8. Etapa 6 — Confirmar persistência

Duração sugerida: 5 minutos.

1. Fechar o aplicativo.
2. Abrir novamente pelo atalho.
3. Localizar cliente, contrato, prazo e gasto.
4. Confirmar que permanecem registrados.

Explicar:

Os dados ficam no banco. O atalho serve apenas para abrir o programa.

## 9. Etapa 7 — Resolver dúvidas operacionais

Apresentar três situações:

### O indicador de gastos mostra zero

O participante deve consultar a lista e verificar o mês das despesas antes de concluir que houve perda de dados.

### O contrato não aparece na seleção

O participante deve confirmar se o contrato foi cadastrado e se a página foi recarregada.

### Aparece erro interno

O participante deve registrar a mensagem e chamar suporte, sem apagar dados nem importar backups.

## 10. Checklist de avaliação

- [ ] Abre pelo atalho.
- [ ] Identifica os quatro módulos.
- [ ] Cadastra cliente fictício.
- [ ] Vincula contrato ao cliente.
- [ ] Usa o filtro de contratos.
- [ ] Cadastra prazo.
- [ ] Cadastra gasto.
- [ ] Confere o dashboard.
- [ ] Confirma persistência após reabrir.
- [ ] Entende que o MySQL precisa estar iniciado.
- [ ] Sabe solicitar suporte sem compartilhar senhas.
- [ ] Entende que edição e exclusão ainda não estão disponíveis.

## 11. Registro da sessão

| Informação | Preenchimento |
|---|---|
| Data | |
| Participante | |
| Instrutor | |
| Versão/commit utilizado | |
| Ambiente de treinamento | |
| Atividades concluídas | |
| Dificuldades observadas | |
| Pendências | |

A aprovação deve ser registrada após a execução dos exercícios, não apenas após a leitura do manual.