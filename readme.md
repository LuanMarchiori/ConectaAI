# Conecta.ai — Sistema de Gestão MEI

Aplicação desktop para organizar clientes, contratos, prazos e gastos de uma microempresa.

O sistema reúne uma interface HTML/CSS/JavaScript em uma janela PySide6. Um servidor Flask local recebe as solicitações da interface e consulta um banco MySQL/MariaDB.

## Funcionalidades

- Cadastro e consulta de clientes.
- Cadastro e consulta de contratos vinculados a clientes.
- Filtro de contratos por cliente.
- Cadastro e consulta de prazos vinculados a contratos.
- Identificação visual de prazos atrasados.
- Cadastro de gastos vinculados a contratos.
- Registro de links de minutas e comprovantes.
- Dashboard com indicadores e contratos recentes.
- Execução no Windows por arquivo executável e atalho.

## Limitações da versão atual

- Não há edição ou exclusão de registros pela interface.
- Não há tela funcional de login ou controle de permissões.
- O cadastro armazena um hash da senha informada, mas isso não representa um portal de acesso implementado.
- O assistente de IA não está integrado a um serviço de inteligência artificial.
- Links de minutas e comprovantes são referências externas; os arquivos não são enviados nem armazenados pelo aplicativo.
- Não há emissão de notas fiscais, cálculo de tributos ou integração bancária.
- O executável não instala nem inicia o servidor de banco automaticamente.
- A aplicação foi validada em ambiente local; uso em rede exige revisão de implantação e segurança.

## Tecnologias

| Componente | Tecnologia |
|---|---|
| Interface | HTML, CSS e JavaScript |
| Janela desktop | PySide6 / Qt WebEngine |
| API local | Flask |
| Persistência | MySQL ou MariaDB |
| Acesso ao banco | mysql-connector-python |
| Configuração | python-dotenv |
| Hash de senha | Werkzeug |
| Empacotamento | PyInstaller |

## Estrutura do projeto

```text
.
├── main.py
├── GestaoMEI.spec
├── requirements.txt
├── .env                  # Local; não versionar
├── .gitignore
├── README.md
├── docs/
│   ├── ARQUITETURA.md
│   ├── MANUAL_OPERACIONAL.md
│   └── TREINAMENTO_MEI.md
└── frontend/
    ├── index.html
    ├── clientes.html
    ├── contratos.html
    ├── prazos.html
    ├── gastos.html
    ├── css/
    │   └── style.css
    └── js/
        ├── common.js
        ├── index.js
        ├── clientes.js
        ├── contratos.js
        ├── prazos.js
        └── gastos.js
```

## Requisitos para desenvolvimento

- Windows.
- Python compatível com as versões das dependências do projeto.
- Banco MySQL/MariaDB disponível.
- Banco `mei_dashboard` com estrutura compatível com as consultas.
- Porta local 5000 disponível.

A versão exata do Python e das dependências deve ser registrada a partir do ambiente que gerou o executável validado.

## Preparação do ambiente

No PowerShell, na raiz do projeto:

```powershell
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

Crie um arquivo `.env` na raiz:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=usuario_da_aplicacao
DB_PASSWORD=preencha_localmente
DB_NAME=mei_dashboard
```

Use credenciais válidas para seu ambiente. Não envie esse arquivo ao GitHub.

O banco precisa existir antes da execução. O aplicativo não cria suas tabelas automaticamente.

Para uma nova instalação, obtenha uma exportação confiável da estrutura do banco. Não use um backup com dados pessoais como arquivo público de instalação.

## Executar em desenvolvimento

Inicie o MySQL/MariaDB e execute:

```powershell
.\venv\Scripts\python.exe main.py
```

A janela abre a interface servida em:

```text
http://127.0.0.1:5000/
```

Não execute duas instâncias simultâneas usando a mesma porta.

## Gerar o executável Windows

Instale o PyInstaller:

```powershell
.\venv\Scripts\python.exe -m pip install pyinstaller
```

Gere uma versão com console para diagnóstico:

```powershell
.\venv\Scripts\python.exe -m PyInstaller --noconfirm --clean --onedir --name GestaoMEI --add-data "frontend:frontend" --collect-all mysql.connector main.py
```

Depois de validar, gere a versão sem console:

```powershell
.\venv\Scripts\python.exe -m PyInstaller --noconfirm --clean --onedir --windowed --name GestaoMEI --add-data "frontend:frontend" --collect-all mysql.connector main.py
```

Copie a configuração local:

```powershell
Copy-Item .env dist\GestaoMEI\.env -Force
```

A versão final também pode ser reconstruída pelo arquivo de configuração validado:

```powershell
.\venv\Scripts\python.exe -m PyInstaller --noconfirm --clean GestaoMEI.spec
```

Após reconstruir, confira novamente a presença do `.env` na pasta de saída.

O projeto usa `use_pure=True` na conexão para selecionar a implementação Python do conector.

## Executar a versão empacotada

Abra:

```text
dist\GestaoMEI\GestaoMEI.exe
```

Mantenha toda a pasta do aplicativo, incluindo `_internal` e `.env`.

Crie um atalho para o executável, sem mover somente o arquivo `.exe`.

O servidor MySQL/MariaDB precisa estar iniciado e acessível conforme o `.env`.

## Persistência e atualização

Os registros ficam no banco, não no executável.

- Cadastrar dados não exige recompilar.
- Alterar código ou recursos incluídos exige gerar outro pacote.
- Alterar o `.env` exige reiniciar o aplicativo.
- Copiar a pasta do programa não equivale a fazer backup do banco.

Antes de atualizar, feche o aplicativo, preserve a configuração local e faça backup do banco.

## Indicadores do dashboard

- Clientes: total cadastrado.
- Novos clientes: cadastros no mês corrente.
- Contratos em andamento: status `Em Análise`, `Ativo` ou `Em Andamento`.
- Encerramentos próximos: contratos nesses status com término entre hoje e 30 dias.
- Prazos próximos: não concluídos, de hoje até antes da data de hoje mais 7 dias.
- Prazos atrasados: não concluídos, com data limite anterior a hoje.
- Gastos do mês: soma dos gastos com data no mês corrente.

As datas do dashboard usam o relógio do computador que executa o backend.

## Verificação das APIs

Com a aplicação aberta:

```text
GET /api/clientes
GET /api/contratos
GET /api/prazos
GET /api/gastos
GET /api/dashboard
```

O endereço-base é `http://127.0.0.1:5000`.

## Segurança e versionamento

Não publique:

- `.env`;
- backups contendo dados pessoais ou hashes de senha;
- `venv/`;
- `build/`;
- `dist/`;
- logs contendo informações sensíveis.

O aplicativo não possui autenticação implementada nas APIs. Mantenha o servidor vinculado a `127.0.0.1`; não o exponha à rede sem implementar controles adequados.

## Documentação complementar

- [Arquitetura](docs/ARQUITETURA.md)
- [Manual operacional](docs/MANUAL_OPERACIONAL.md)
- [Treinamento do MEI](docs/TREINAMENTO_MEI.md)