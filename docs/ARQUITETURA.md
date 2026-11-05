# Guia de Arquitetura — Conecta.ai

## 1. Escopo

Este documento descreve a arquitetura da versão desktop local do Conecta.ai.

A solução atende ao cadastro e à consulta de clientes, contratos, prazos e gastos. Não representa uma plataforma financeira, fiscal ou de autenticação completa.

## 2. Visão geral

```text
Usuário
   |
   v
Janela PySide6
   |
   v
QWebEngineView
   |
   | HTTP para 127.0.0.1:5000
   v
Flask
   |-- Páginas e recursos estáticos
   |-- APIs JSON em /api/*
   |
   v
mysql-connector-python
   |
   v
MySQL / MariaDB
```

O banco é um serviço separado. Não está incorporado ao executável.

## 3. Responsabilidades

### main.py

Concentra:

- Leitura de configuração.
- Criação da aplicação Flask.
- Entrega das páginas HTML e dos recursos estáticos.
- Validação dos dados recebidos.
- Consultas e gravações no banco.
- Serialização das respostas.
- Tratamento de erros.
- Inicialização do servidor local e da janela desktop.
- Encerramento do servidor ao fechar a aplicação.

A concentração em um arquivo simplifica a versão inicial, mas aumenta o acoplamento.

### common.js

Disponibiliza:

- Comunicação com a API.
- Leitura de erros.
- Formatação de moeda e datas.
- Escape de conteúdo exibido em HTML.
- Construção de tabelas.
- Avisos visuais.
- Envio de formulários.
- Classificação visual de status.

### Scripts de página

Na implementação atual, os cinco scripts de página possuem o mesmo código unificado.

Cada HTML carrega `common.js` e apenas seu script correspondente. O código identifica a página por elementos como `formCliente`, `formContrato` ou `statClientes`.

Essa organização funciona, mas duplica código. Uma evolução possível é usar um único arquivo compartilhado de páginas ou separar efetivamente cada módulo.

### HTML e CSS

Definem estrutura, navegação, formulários e apresentação.

Identificadores relevantes:

| Página | Elementos principais |
|---|---|
| Clientes | `formCliente`, `listaClientes`, `contagem` |
| Contratos | `formContrato`, `selCliente`, `filtroCliente`, `listaContratos` |
| Prazos | `formPrazo`, `selContrato`, `listaPrazos` |
| Gastos | `formGasto`, `selContrato`, `dataGasto`, `listaGastos` |
| Dashboard | `statClientes`, `statContratos`, `statPrazos`, `statGastos`, `contratosRecentes`, `prazosSemana` |

## 4. Inicialização e encerramento

1. Resolve os caminhos dos recursos e da configuração.
2. Carrega o `.env`.
3. Inicializa o servidor em `127.0.0.1:5000`.
4. Executa o servidor em uma thread.
5. Abre a janela PySide6.
6. Carrega a página inicial pelo QWebEngineView.
7. Ao encerrar a janela, solicita o encerramento do servidor.

A porta ocupada impede uma segunda instância de iniciar normalmente. Ainda não há gerenciamento amigável de instância única.

## 5. Fluxo de cadastro

Exemplo: cliente.

1. Usuário preenche o formulário.
2. JavaScript impede o envio tradicional da página.
3. Converte os campos em JSON.
4. Envia `POST /api/clientes`.
5. Backend valida os campos.
6. Executa `INSERT` parametrizado.
7. Confirma a transação com `commit`.
8. Retorna JSON com mensagem e identificador.
9. Interface limpa o formulário e recarrega a lista.

A lista só deve ser considerada atualizada após resposta de sucesso.

## 6. Modelo de dados

Relacionamentos lógicos:

```text
clientes 1 ---- N contratos
contratos 1 --- N prazos
contratos 1 --- N gastos
```

A existência de índices, isoladamente, não comprova a presença de restrições de chave estrangeira. Confirme as constraints no banco antes de documentá-las como garantidas.

### clientes

Campos utilizados:

- `id`
- `nome`
- `email`
- `senha_hash`
- `telefone`
- `cnpj_cpf`
- `criado_em`

`senha_hash` não é retornado pela listagem de clientes.

### contratos

Campos utilizados:

- `id`
- `cliente_id`
- `titulo`
- `descricao`
- `valor_total`
- `link_minuta`
- `status`
- `data_inicio`
- `data_termino`

A API acrescenta `cliente_nome` por meio de consulta com JOIN.

### prazos

Campos confirmados na estrutura apresentada:

- `id`
- `contrato_id`
- `descricao`
- `data_limite`
- `status`
- `atualizado_em`

A API acrescenta `contrato_titulo`.

Não usar `data_vencimento` ou `titulo` como colunas dessa tabela.

### gastos

Campos confirmados:

- `id`
- `contrato_id`
- `descricao`
- `valor`
- `data_gasto`
- `comprovante_url`

A API acrescenta `contrato_titulo`.

Não usar `data` como coluna dessa tabela.

## 7. Contrato das APIs

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Cadastrar cliente |
| GET | `/api/contratos` | Listar contratos |
| POST | `/api/contratos` | Cadastrar contrato |
| GET | `/api/prazos` | Listar prazos |
| POST | `/api/prazos` | Cadastrar prazo |
| GET | `/api/gastos` | Listar gastos |
| POST | `/api/gastos` | Cadastrar gasto |
| GET | `/api/dashboard` | Consultar indicadores |

Parâmetros opcionais de contratos:

```text
/api/contratos?cliente_id=3
/api/contratos?limit=5
```

Não há endpoints implementados de edição ou exclusão.

### Exemplo de cadastro de prazo

```json
{
  "contrato_id": 2,
  "descricao": "Entrega da primeira versão",
  "data_limite": "2026-11-12",
  "status": "Pendente"
}
```

### Resposta de criação

```json
{
  "message": "Prazo cadastrado com sucesso!",
  "id": 3
}
```

### Códigos de resposta

- `200`: consulta bem-sucedida.
- `201`: registro criado.
- `400`: falha de validação.
- `404`: recurso ou endpoint inexistente.
- `500`: erro de banco ou erro interno.

Erros usam a chave `error`.

## 8. Validações existentes

- Nome e e-mail obrigatórios no cadastro de cliente.
- Identificadores positivos.
- Verificação da existência do cliente ou contrato relacionado.
- Datas no formato ISO.
- Término do contrato não anterior ao início.
- Valores monetários finitos e não negativos.

Limitações:

- E-mail não possui validação completa de formato.
- CPF/CNPJ não possui validação de dígitos.
- Nem todos os limites de tamanho são validados antes do banco.
- Regras de status dependem também dos tipos definidos no banco.
- Há operações que podem resultar em erro de banco mesmo após a validação inicial.

## 9. Persistência e transações

O gerenciador `banco()` abre conexão e cursor por operação.

- Gravações bem-sucedidas executam `commit`.
- Exceções dentro do contexto provocam tentativa de `rollback`.
- Cursor e conexão são fechados ao final.

Os valores de entrada são enviados como parâmetros SQL. Nomes de tabelas usados na função auxiliar são definidos pelo próprio código, não pelo usuário.

## 10. Serialização

- Datas e horários: formato ISO.
- Valores `Decimal`: convertidos para número na resposta JSON.
- Valores monetários recebidos: tratados com `Decimal` antes da gravação.
- Formatação visual de moeda: feita no frontend.

`cast()` no dashboard auxilia o analisador de tipos; não valida o resultado do banco em execução.

## 11. Dashboard

- Novos clientes: mês corrente, não últimos 30 dias.
- Contratos recentes: ordenação por identificador decrescente.
- Prazos próximos: intervalo de hoje, inclusive, até hoje mais 7 dias, exclusive.
- Atrasados: data anterior a hoje e status diferente de `Concluído`.
- Gastos: agrupados pelo mês da coluna `data_gasto`.

Um prazo pode aparecer visualmente como atrasado sem alterar o status persistido no banco.

## 12. Empacotamento

O PyInstaller inclui o frontend no pacote e produz uma distribuição em pasta.

Caminhos:

- `BASE_DIR`: localização dos recursos do programa.
- `CONFIG_DIR`: pasta do executável quando empacotado.
- `.env`: configuração externa.

O conector utiliza `use_pure=True`. O pacote coleta `mysql.connector` para incluir seus módulos e recursos.

Não mover somente o `.exe`.

## 13. Segurança e limitações

A versão atual:

- Não autentica chamadas às APIs.
- Não implementa autorização por usuário.
- Mantém credenciais de banco no `.env`.
- Pode retornar detalhes de erros MySQL ao cliente.
- Não possui auditoria de alterações.
- Não executa backup automático.
- Usa a configuração padrão do ambiente de desenvolvimento como ponto de partida, não como política de produção.

Recomendações de evolução:

1. Usuário de banco dedicado e com permissões mínimas.
2. Autenticação e autorização antes de qualquer exposição em rede.
3. Logs em arquivo com proteção de dados sensíveis.
4. Mensagens públicas de erro sem detalhes internos.
5. Migrações e esquema versionado sem dados pessoais.
6. Testes automatizados.
7. Backup e restauração testados.
8. Separação de rotas, serviços e acesso a dados.

## 14. Verificação de uma nova versão

- Abrir pelo Python.
- Abrir pelo executável.
- Testar leitura dos quatro módulos.
- Cadastrar registros relacionados em ambiente de teste.
- Reabrir e verificar persistência.
- Validar datas e valores.
- Conferir ausência de credenciais nos arquivos versionados.
- Testar atalho.
- Documentar versões das dependências e do Python.

A validação manual realizada não substitui uma suíte de testes automatizados.