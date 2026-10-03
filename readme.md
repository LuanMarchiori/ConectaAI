# Dashboard MEI - Sistema de Gestão 🚀

Projeto extensionista desenvolvido para o curso de Inteligência Artificial da PUCPR. O objetivo é fornecer uma solução tecnológica e segura para microempreendedores individuais (MEIs) gerenciarem contratos, prazos e gastos com total transparência para seus clientes.

## Tecnologias Utilizadas até o Momento
* **Backend:** Python, FastAPI, Uvicorn, Pydantic.
* **Banco de Dados:** MySQL (Arquitetura Relacional).

## O que já foi desenvolvido (Fase 1: API RESTful)
O núcleo do sistema (Backend) já está estruturado com as regras de negócio e validações:
- Modelagem física do banco de dados garantindo integridade referencial.
- Criação dos endpoints principais para comunicação com o banco:
  - `POST /clientes`: Cadastro seguro de novos clientes.
  - `POST /contratos` e `GET /contratos/{id}`: Criação de contratos e listagem filtrada por cliente.
  - `POST /prazos`: Registro de etapas e datas limite de entregas.
  - `POST /gastos`: Lançamento de despesas vinculadas aos contratos.

## Próximos Passos (Pendências)
- [ ] **Integração Cloud (Azure Blob Storage):** Desenvolver o script de upload para armazenar minutas de contratos e PDFs de comprovantes na nuvem da Microsoft, substituindo links fictícios por URLs reais e seguras.

- [ ] **Frontend (Interface do Usuário):** Construir o Dashboard interativo utilizando HTML5, CSS3, Vanilla JavaScript e Bootstrap para consumir nossa API.
- [ ] **Camada de Inteligência (IA):** Integração com LLM via API (Google Gemini) configurando o System Prompt para atuar como assistente de dúvidas do sistema.
- [ ] **Segurança e Deploy:** Implementar hash de senhas (bcrypt), autenticação e realizar o deploy do banco e da API no Azure App Service.
