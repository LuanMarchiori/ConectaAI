from datetime import date
from fastapi import FastAPI, HTTPException
import mysql.connector
from pydantic import BaseModel


app = FastAPI(title="API - Dashboard MEI")

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
    
# Rota de teste para verificar se a API está de pé

@app.get("/")
def read_root():
    return {"mensagem": "API - Dashboard MEI está funcionando!"}

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
    # Vamos implementar posteriormente uma biblioteca "bycrypt" para gerar um hash seguro.
    
    senha_simulada_hash = f"hash_seguro_de_{cliente.senha}"
    
    valores = (cliente.nome, cliente.email, senha_simulada_hash, cliente.telefone, cliente.cnpj_cpf)
    
    try:
        cursor.execute(sql, valores)
        conn.commit() # Confirma a gravação no banco
        novo_id = cursor.lastrowid
    except mysql.connector.IntegrityError as err:
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
        contrato.link_minuta
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
    status: str = "Pendente" # Valor padrão

class GastoCreate(BaseModel):
    contrato_id: int
    descricao: str
    valor: float
    data_gasto: date
    comprovante_url: str | None = None

### ========================================== ###
### ROTAS DE PRAZOS ###
### ========================================== ###
@app.post("/prazos", status_code=201)
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