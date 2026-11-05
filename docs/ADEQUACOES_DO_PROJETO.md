# Conecta.ai — Relatório de Adequações do Planejamento e Consolidação da Entrega

## 1. Finalidade

Este documento registra as diferenças entre o planejamento aprovado e a implementação realizada no projeto Conecta.ai.

Seu objetivo é apresentar de forma transparente:

- O propósito mantido.
- As entregas efetivamente realizadas.
- As dificuldades encontradas.
- As decisões de adaptação.
- As funcionalidades não implementadas.
- Os limites da versão final.

As alterações aqui descritas não modificam retroativamente o planejamento aprovado. Elas constituem o registro da execução e de suas adequações, para avaliação acadêmica.

## 2. Proposta inicial

O planejamento previa uma plataforma web para centralizar informações operacionais de uma microempresa prestadora de serviços.

A proposta contemplava:

- Cadastro e gestão de clientes.
- Gestão de contratos, prazos e gastos.
- Dashboard em HTML, CSS e JavaScript.
- API em Python, inicialmente prevista com FastAPI.
- Banco relacional MySQL.
- Upload e armazenamento de documentos no Azure Blob Storage.
- Hospedagem no Azure App Service.
- Assistente virtual integrado ao Google Gemini.
- Acesso administrativo e acesso de clientes.
- Operações de criação, consulta, atualização e exclusão de registros.

## 3. Propósito preservado

Foi mantido o propósito de reunir informações operacionais em uma interface centralizada, permitindo ao responsável pela microempresa registrar e consultar clientes, contratos, prazos e despesas.

A entrega foi concentrada em uma aplicação de uso administrativo local, executada no computador destinado à utilização do sistema.

Assim, a necessidade de organização interna permaneceu como foco, enquanto os recursos de atendimento externo e infraestrutura em nuvem não integraram a versão entregue.

Essa mudança representa uma redução do alcance funcional inicialmente previsto, e não a execução integral de todos os objetivos originais.

## 4. Dificuldade de implantação no Azure

Durante a execução, não foi possível viabilizar a hospedagem no ambiente Azure para estudantes disponível ao desenvolvedor.

Diante dessa limitação, foi adotada uma alternativa de implantação local, permitindo executar a aplicação no computador de uso do sistema, sem depender da disponibilização da infraestrutura originalmente planejada.

A solução passou a utilizar:

- Servidor Flask vinculado ao endereço local 127.0.0.1.
- Interface apresentada em janela desktop com PySide6.
- Banco MySQL/MariaDB acessado pela aplicação.
- Distribuição Windows gerada com PyInstaller.
- Atalho na área de trabalho para abertura do programa.

A dificuldade relatada refere-se ao ambiente e aos recursos disponíveis durante o projeto. Não se afirma que a plataforma Azure seja, de forma geral, incompatível com essa aplicação.

Quando disponíveis, registros das tentativas de implantação devem ser anexados ao relato como evidência da dificuldade encontrada.

## 5. Decisão sobre o assistente Google Gemini

A integração com Google Gemini foi retirada da entrega após a priorização do uso administrativo local.

Na proposta original, o assistente apoiaria o atendimento de dúvidas de clientes em um portal. Com a entrega concentrada na organização interna da microempresa, decidiu-se não implementar essa camada de atendimento.

A decisão foi de escopo e prioridade: a execução local não impede tecnicamente o uso de uma API de inteligência artificial.

Consequentemente:

- Não há integração funcional com o Google Gemini.
- Não houve validação de respostas de um modelo de linguagem.
- Não se apresenta engenharia de prompt ou atendimento automatizado como resultado alcançado.
- Um elemento visual de chat, caso permaneça na interface, não deve ser considerado evidência de integração com IA.

A relação prática com conteúdos de inteligência artificial prevista originalmente não foi concretizada nessa entrega. O relato reflexivo deve reconhecer essa diferença.

## 6. Alterações técnicas

### 6.1 FastAPI para Flask

O backend foi implementado com Flask, em substituição ao FastAPI previsto inicialmente.

A implementação realizada disponibiliza as rotas de consulta e cadastro utilizadas pelo frontend e atende à arquitetura local adotada.

Trata-se de uma alteração de ferramenta. Não se atribui a escolha a limitações do FastAPI, nem se afirma superioridade geral de uma tecnologia sobre a outra.

### 6.2 Plataforma hospedada para aplicação desktop local

A interface continuou utilizando tecnologias web, mas passou a ser apresentada em uma janela desktop por meio do PySide6.

O frontend se comunica com a API local por HTTP, e o backend realiza as operações no banco.

O executável simplifica a abertura do aplicativo, mas não incorpora nem instala automaticamente o servidor MySQL/MariaDB.

### 6.3 Documentos por referência de link

A versão entregue permite registrar links de minutas de contratos e comprovantes.

Não foi implementado o upload ou o gerenciamento de arquivos no Azure Blob Storage.

Portanto, cadastrar um link não equivale a armazenar o documento no aplicativo, controlar suas permissões ou garantir sua disponibilidade.

## 7. Consolidação das entregas

| Componente | Entrega realizada |
|---|---|
| Clientes | Cadastro e consulta de registros |
| Contratos | Cadastro e consulta, com vínculo ao cliente |
| Filtro de contratos | Consulta por cliente na interface |
| Prazos | Cadastro e consulta, com vínculo ao contrato |
| Atrasos | Identificação visual conforme data e status |
| Gastos | Cadastro e consulta, com vínculo ao contrato |
| Documentos | Registro de links externos |
| Dashboard | Indicadores e visualização resumida |
| Persistência | Gravação e consulta no MySQL/MariaDB |
| Interface | HTML, CSS e JavaScript |
| Backend | Flask em Python |
| Janela desktop | PySide6 / Qt WebEngine |
| Distribuição | Executável Windows em pasta |
| Acesso ao aplicativo | Atalho na área de trabalho |
| Documentação | README, guia de arquitetura, manual e roteiro de treinamento |

A elaboração de um roteiro de treinamento não comprova sua aplicação. A realização da orientação ao responsável deve ser registrada separadamente, caso tenha ocorrido.

## 8. Recursos retirados da versão entregue

| Recurso originalmente previsto | Situação e impacto |
|---|---|
| Hospedagem no Azure App Service | Substituída por execução local após a dificuldade de implantação relatada |
| Azure Blob Storage | Não implementado; documentos são referenciados por links |
| Assistente Gemini | Retirado após priorização da gestão administrativa local |
| Portal de clientes | Não implementado; a interface entregue é de uso administrativo |
| Níveis de acesso ADM/cliente | Não implementados; não há controle de acesso por perfil |
| Atualização de registros | Não disponível pela interface |
| Exclusão de registros | Não disponível pela interface |
| Testes de segurança do portal remoto | Não realizados como etapa de um portal hospedado, pois essa implantação não foi entregue |

O CRUD originalmente previsto foi atendido apenas nas operações de criação e consulta.

A retirada das operações de atualização e exclusão deve ser apresentada como redução de escopo. Não há, neste registro, uma restrição técnica específica que comprove a impossibilidade de implementá-las.

## 9. Limitações operacionais

A versão atual apresenta os seguintes limites:

- O servidor de banco precisa estar iniciado e acessível.
- Não há edição ou exclusão pela interface.
- Não há operação para concluir um prazo existente pela interface.
- Não há login funcional ou autorização por usuário.
- O campo de senha do cadastro não constitui um portal de acesso implementado.
- Não há atendimento automatizado por IA.
- Não há upload de arquivos.
- Não há backup automático.
- Não foi validada uma implantação para acesso externo.
- A aplicação não deve ser apresentada como comprovadamente segura ou escalável apenas por utilizar banco de dados e execução local.

O uso local reduz o alcance de acesso previsto originalmente, mas não dispensa cuidados com credenciais, dados pessoais, backups e acesso ao computador.

## 10. Validação técnica realizada

Durante o desenvolvimento foram realizados:

- Testes de consulta às APIs.
- Conferência da existência dos registros no banco.
- Correção dos nomes de campos utilizados nas consultas.
- Ajustes na comunicação entre frontend e backend.
- Validação do carregamento do dashboard.
- Diagnóstico de falha de conexão na versão empacotada.
- Ajuste do conector MySQL para a implementação Python.
- Execução do aplicativo empacotado com carregamento dos dados.
- Criação do atalho de acesso.

Essas verificações demonstram o funcionamento observado no ambiente utilizado. Não substituem testes automatizados, testes completos de segurança ou validação em todos os ambientes.

Testes adicionais de cadastro, persistência e uso pelo responsável devem ser registrados com data e resultado, quando executados.

## 11. Resultados e contribuições

A contribuição técnica entregue consiste em uma ferramenta local que centraliza o cadastro e a consulta das informações operacionais contempladas na versão final.

Foram produzidos:

- Código-fonte organizado em repositório.
- Interface de gestão.
- Integração com banco relacional.
- Aplicativo executável para Windows.
- Configuração de empacotamento.
- Documentação técnica e operacional.

Ganhos como redução de tempo, diminuição de erros, melhoria de produtividade ou adoção diária não devem ser afirmados sem observação, medição ou feedback que os sustente.

A percepção da empresa e a contribuição efetiva para sua rotina deverão constar do registro de validação e do Feedback da Comunidade.

## 12. Aprendizados e reflexão

A execução permitiu trabalhar conhecimentos de:

- Programação em Python.
- Desenvolvimento de APIs.
- Banco de dados relacional.
- Comunicação entre frontend e backend.
- Validação e serialização de dados.
- Diagnóstico por logs.
- Empacotamento de aplicações desktop.
- Versionamento com Git.
- Documentação e orientação de uso.

Os obstáculos de infraestrutura e empacotamento evidenciaram a necessidade de adaptar decisões técnicas às condições disponíveis e verificar as diferenças entre executar o código no ambiente de desenvolvimento e distribuir um aplicativo.

A reflexão individual deve complementar este registro, explicando a participação do estudante e os conhecimentos efetivamente mobilizados.

## 13. Evidências e avaliação acadêmica

Este documento não substitui:

- O registro da interação presencial.
- As evidências de participação na empresa.
- O relato individual da execução.
- O Feedback da Comunidade preenchido e assinado.
- Os termos institucionais aplicáveis.
- O preenchimento da plataforma Conecta.

A versão final mantém parte central da proposta de organização administrativa, mas não executa integralmente o planejamento original.

As alterações e reduções de escopo são apresentadas para apreciação do professor, sem pressupor aprovação prévia.

## 14. Conclusão

O Conecta.ai foi entregue como aplicação administrativa local, preservando o objetivo de centralizar registros de clientes, contratos, prazos e gastos.

A estratégia inicialmente baseada em hospedagem em nuvem e atendimento automatizado foi substituída por uma implementação desktop, considerando a dificuldade de implantação no ambiente Azure disponível e a decisão de priorizar o uso interno.

A entrega deve ser avaliada a partir do que foi efetivamente implementado, das justificativas registradas e das evidências da atividade, reconhecendo explicitamente os recursos não realizados.