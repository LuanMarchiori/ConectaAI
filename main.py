import os
from datetime import date
from pathlib import Path

import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="API - Dashboard MEI")

# em produção precisamos trocar o "*" pelo link real.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent


# Cria uma função para conectar ao meu banco do MySQL
def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="r6mc0ilfL@",
            database="mei_dashboard"
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Erro na conexão: {err}")
        return None

# feat: atalho para testar a conexão dos novos blocos
def conectar_ou_erro():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco")
    return conn


# Rota de teste para verificar se a API está de pé
@app.get("/")
def read_root():
    return {"mensagem": "API - Dashboard MEI está funcionando!"}


# pela própria API: acesse http://localhost:8000/app/
app.mount("/app", StaticFiles(directory=BASE_DIR / "frontend", html=True), name="frontend")


# Exemplo da nossa primeira rota de negócio: lista todos os clientes cadastrados no banco de dados
@app.get("/clientes")
def listar_clientes():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro na conectar com o banco de dados")
    
    cursor = conn.cursor(dictionary=True) # Nesse campo fazemos o true retornar um dict, vai nos permitir retornar um json com mais facilidade
    cursor.execute("SELECT id, nome, email, telefone, cnpj_cpf, criado_em FROM Clientes")
    clientes = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return clientes


### Vamos definir o modelo de dados que a API espera receber do Front-End para cadastrar um novo cliente. Para isso, vamos criar uma classe que herda de BaseModel do Pydantic.

### 1. Definindo o modelo de dados para cadastro de clientes
class ClienteCreate(BaseModel):
    nome: str
    email: str
    senha: str
    telefone: str | None = None
    cnpj_cpf: str | None = None

# 2. Criamos o endpoint POST
@app.post("/clientes", status_code=201)
def criar_cliente(cliente: ClienteCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco")
    
    cursor = conn.cursor()

    # Query parametrizada (%s) para evitar SQL Injection (Segurança em 1º lugar!)
    sql = """
        INSERT INTO Clientes (nome, email, senha_hash, telefone, cnpj_cpf)
        VALUES (%s, %s, %s, %s, %s)
    """

    # Para este passo inicial, vamos simular um hash apenas para preencher o banco.
    # Vamos implementar posteriormente uma biblioteca "bcrypt" para gerar um hash seguro.
    senha_simulada_hash = f"hash_seguro_de_{cliente.senha}"

    valores = (cliente.nome, cliente.email, senha_simulada_hash, cliente.telefone, cliente.cnpj_cpf)

    try:
        cursor.execute(sql, valores)
        conn.commit()  # Confirma a gravação no banco
        novo_id = cursor.lastrowid
    except mysql.connector.IntegrityError:
        conn.rollback()
        # Captura erros como "E-mail já cadastrado" (porque colocamos UNIQUE lá no SQL)
        raise HTTPException(status_code=400, detail="E-mail ou Documento já cadastrado.")
    except Exception as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno: {err}")
    finally:
        cursor.close()
        conn.close()

    return {"mensagem": "Cliente cadastrado com sucesso!", "id_cliente": novo_id}


#### 1. Modelo Pydantic para validar os dados do Contrato
class ContratoCreate(BaseModel):
    cliente_id: int
    titulo: str
    descricao: str | None = None
    valor_total: float
    data_inicio: date | None = None
    data_termino: date | None = None
    link_minuta: str | None = None

# 2. Endpoint POST para criar o Contrato
@app.post("/contratos", status_code=201)
def criar_contrato(contrato: ContratoCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco")
    
    cursor = conn.cursor()

    sql = """
        INSERT INTO Contratos
        (cliente_id, titulo, descricao, valor_total, data_inicio, data_termino, link_minuta)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    valores = (
        contrato.cliente_id,
        contrato.titulo,
        contrato.descricao,
        contrato.valor_total,
        contrato.data_inicio,
        contrato.data_termino,
        contrato.link_minuta,
    )

    try:
        cursor.execute(sql, valores)
        conn.commit()
        novo_id = cursor.lastrowid
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao cadastrar contrato: {err}")
    finally:
        cursor.close()
        conn.close()

    return {"mensagem": "Contrato gerado com sucesso!", "id_contrato": novo_id}


# feat: lista todos os contratos (com o nome do cliente). Aceita ?limit=5 para os mais recentes.
@app.get("/contratos")
def listar_contratos(limit: int | None = None):
    conn = conectar_ou_erro()
    cursor = conn.cursor(dictionary=True)

    sql = """
        SELECT c.id, c.cliente_id, cl.nome AS cliente_nome, c.titulo, c.descricao,
               c.valor_total, c.status, c.data_inicio, c.data_termino, c.link_minuta
        FROM Contratos c
        JOIN Clientes cl ON cl.id = c.cliente_id
        ORDER BY c.id DESC
    """
    params = ()
    if limit:
        sql += " LIMIT %s"
        params = (limit,)

    cursor.execute(sql, params)
    contratos = cursor.fetchall()

    cursor.close()
    conn.close()
    return contratos


@app.get("/contratos/{cliente_id}")
def listar_contratos_cliente(cliente_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco")

    ## NAO MEXE, NAO SEI OQ FIZ TA DANDO CERTO E ESTA DEVOLVENDO O JSON DIRETO, MAS NAO SEI OQ FIZ, NAO MEXE ##

    cursor = conn.cursor(dictionary=True)

    ## VAI BUSCAR OS CONTRATOS DA URL EU ACHO, DEVE SER O ID DO CLIENTE ##
    sql = "SELECT id, titulo, descricao, valor_total, status, data_inicio, data_termino, link_minuta FROM Contratos WHERE cliente_id = %s"

    cursor.execute(sql, (cliente_id,))
    contratos = cursor.fetchall()

    cursor.close()
    conn.close()

    ### AQUI SO RETORNA O ERRO 404 SE DAR RUIM ###

    if not contratos:
        raise HTTPException(status_code=404, detail="Nenhum contrato encontrado para este cliente.")

    return contratos


class PrazoCreate(BaseModel):
    contrato_id: int
    descricao: str
    data_limite: date
    status: str = "Pendente"  # Valor padrão


class PrazoStatusUpdate(BaseModel):
    status: str


class GastoCreate(BaseModel):
    contrato_id: int
    descricao: str
    valor: float
    data_gasto: date
    comprovante_url: str | None = None


### ========================================== ###
### ROTAS DE PRAZOS ###
### ========================================== ###
def criar_prazo(prazo: PrazoCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco")

    cursor = conn.cursor()
    sql = "INSERT INTO Prazos (contrato_id, descricao, data_limite, status) VALUES (%s, %s, %s, %s)"
    valores = (prazo.contrato_id, prazo.descricao, prazo.data_limite, prazo.status)

    try:
        cursor.execute(sql, valores)
        conn.commit()
        novo_id = cursor.lastrowid
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao cadastrar prazo: {err}")
    finally:
        cursor.close()
        conn.close()

    return {"mensagem": "Prazo registrado!", "id_prazo": novo_id}


# feat: lista todos os prazos, do mais próximo ao mais distante
@app.get("/prazos")
def listar_prazos():
    conn = conectar_ou_erro()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.id, p.contrato_id, c.titulo AS contrato_titulo,
               p.descricao, p.data_limite, p.status
        FROM Prazos p
        JOIN Contratos c ON c.id = p.contrato_id
        ORDER BY p.data_limite ASC
    """)
    prazos = cursor.fetchall()
    cursor.close()
    conn.close()
    return prazos


# feat: atualiza o status de um prazo (ex.: marcar como Concluído)
@app.patch("/prazos/{prazo_id}")
def atualizar_prazo(prazo_id: int, dados: PrazoStatusUpdate):
    conn = conectar_ou_erro()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE Prazos SET status = %s WHERE id = %s", (dados.status, prazo_id))
        conn.commit()
        if cursor.rowcount == 0:
            # rowcount 0 também ocorre se o status já era o mesmo; confirmamos se o prazo existe
            cursor.execute("SELECT id FROM Prazos WHERE id = %s", (prazo_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Prazo não encontrado.")
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar prazo: {err}")
    finally:
        cursor.close()
        conn.close()
    return {"mensagem": "Prazo atualizado!"}


### ========================================== ###
### ROTAS DE GASTOS ###
### ========================================== ###
@app.post("/gastos", status_code=201)
def criar_gasto(gasto: GastoCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco")

    cursor = conn.cursor()
    sql = "INSERT INTO Gastos (contrato_id, descricao, valor, data_gasto, comprovante_url) VALUES (%s, %s, %s, %s, %s)"
    valores = (gasto.contrato_id, gasto.descricao, gasto.valor, gasto.data_gasto, gasto.comprovante_url)

    try:
        cursor.execute(sql, valores)
        conn.commit()
        novo_id = cursor.lastrowid
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao cadastrar gasto: {err}")
    finally:
        cursor.close()
        conn.close()

    return {"mensagem": "Gasto registrado com sucesso!", "id_gasto": novo_id}


# feat: lista os gastos mais recentes
@app.get("/gastos")
def listar_gastos():
    conn = conectar_ou_erro()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT g.id, g.contrato_id, c.titulo AS contrato_titulo,
               g.descricao, g.valor, g.data_gasto, g.comprovante_url
        FROM Gastos g
        JOIN Contratos c ON c.id = g.contrato_id
        ORDER BY g.data_gasto DESC, g.id DESC
    """)
    gastos = cursor.fetchall()
    cursor.close()
    conn.close()
    return gastos


### ========================================== ###
### VISÃO GERAL (números do painel) ###
### ========================================== ###
@app.get("/dashboard")
def resumo_dashboard():
    conn = conectar_ou_erro()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT COUNT(*) AS total,
               COALESCE(SUM(YEAR(criado_em) = YEAR(CURDATE()) AND MONTH(criado_em) = MONTH(CURDATE())), 0) AS novos_mes
        FROM Clientes
    """)
    clientes = cursor.fetchone()

    cursor.execute("""
        SELECT COALESCE(SUM(LOWER(status) LIKE '%andamento%' OR LOWER(status) LIKE '%ativo%'), 0) AS em_andamento,
               COALESCE(SUM((LOWER(status) LIKE '%andamento%' OR LOWER(status) LIKE '%ativo%')
                            AND data_termino BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)), 0) AS encerram_30d
        FROM Contratos
    """)
    contratos = cursor.fetchone()

    cursor.execute("""
        SELECT COALESCE(SUM(status <> 'Concluído' AND data_limite >= CURDATE()), 0) AS proximos,
               COALESCE(SUM(status <> 'Concluído' AND data_limite BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)), 0) AS vencem_semana,
               COALESCE(SUM(status <> 'Concluído' AND data_limite < CURDATE()), 0) AS atrasados
        FROM Prazos
    """)
    prazos = cursor.fetchone()

    cursor.execute("""
        SELECT COALESCE(SUM(CASE WHEN YEAR(data_gasto) = YEAR(CURDATE()) AND MONTH(data_gasto) = MONTH(CURDATE())
                                 THEN valor END), 0) AS mes_atual,
               COALESCE(SUM(CASE WHEN YEAR(data_gasto) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                                  AND MONTH(data_gasto) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                                 THEN valor END), 0) AS mes_anterior
        FROM Gastos
    """)
    gastos = cursor.fetchone()

    cursor.close()
    conn.close()

    return {
        "clientes": {"total": int(clientes["total"]), "novos_mes": int(clientes["novos_mes"])},
        "contratos": {
            "em_andamento": int(contratos["em_andamento"]),
            "encerram_30d": int(contratos["encerram_30d"]),
        },
        "prazos": {
            "proximos": int(prazos["proximos"]),
            "vencem_semana": int(prazos["vencem_semana"]),
            "atrasados": int(prazos["atrasados"]),
        },
        "gastos": {
            "mes_atual": float(gastos["mes_atual"]),
            "mes_anterior": float(gastos["mes_anterior"]),
        },
    }
