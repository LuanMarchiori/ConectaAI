import os
import sys
import threading
from contextlib import contextmanager
from datetime import date, datetime, timedelta
from decimal import Decimal
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from werkzeug.exceptions import HTTPException
from werkzeug.security import generate_password_hash
from werkzeug.serving import make_server
from typing import Any, cast

from PySide6.QtCore import QUrl
from PySide6.QtWidgets import QApplication, QMainWindow
from PySide6.QtWebEngineWidgets import QWebEngineView

# HTML, CSS e JavaScript incluídos no aplicativo.
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"

# O .env fica ao lado do executável na versão empacotada.
if getattr(sys, "frozen", False):
    CONFIG_DIR = Path(sys.executable).resolve().parent
else:
    CONFIG_DIR = BASE_DIR

load_dotenv(CONFIG_DIR / ".env")

app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIR),
    static_url_path=""
)

app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "mei_dashboard"),
        connection_timeout=5,
        use_pure=True
    )


@contextmanager
def banco():
    conn = get_db_connection()
    cursor = None

    try:
        cursor = conn.cursor(dictionary=True)
        yield conn, cursor
    except Exception:
        conn.rollback()
        raise
    finally:
        try:
            if cursor is not None:
                cursor.close()
        finally:
            conn.close()


def serializar(valor):
    if isinstance(valor, dict):
        return {k: serializar(v) for k, v in valor.items()}

    if isinstance(valor, (list, tuple)):
        return [serializar(v) for v in valor]

    if isinstance(valor, (datetime, date)):
        return valor.isoformat()

    if isinstance(valor, Decimal):
        return float(valor)

    return valor


def resposta(valor, status=200):
    return jsonify(serializar(valor)), status


def dados_recebidos():
    dados = request.get_json(silent=True)

    if dados is None:
        dados = request.form

    if not hasattr(dados, "get"):
        raise ValueError("Envie um objeto JSON válido.")

    return dados


def texto(dados, chave, padrao=""):
    valor = dados.get(chave)
    return str(valor).strip() if valor is not None else padrao


def obrigatorio(dados, chave, rotulo):
    valor = texto(dados, chave)

    if not valor:
        raise ValueError(f"{rotulo} é obrigatório.")

    return valor


def inteiro_positivo(valor, rotulo):
    try:
        numero = int(valor)
    except (TypeError, ValueError):
        raise ValueError(f"{rotulo} inválido.")

    if numero <= 0:
        raise ValueError(f"{rotulo} inválido.")

    return numero


def data_valida(valor, rotulo, obrigatoria=False):
    if not valor:
        if obrigatoria:
            raise ValueError(f"{rotulo} é obrigatória.")
        return None

    try:
        return date.fromisoformat(str(valor))
    except ValueError:
        raise ValueError(f"{rotulo} deve estar no formato AAAA-MM-DD.")


def dinheiro(valor):
    bruto = str(valor if valor is not None else "").strip()

    if not bruto:
        raise ValueError("Informe o valor.")

    if "," in bruto:
        bruto = bruto.replace(".", "").replace(",", ".")

    try:
        numero = Decimal(bruto)
    except Exception:
        raise ValueError("Valor monetário inválido.")

    if not numero.is_finite() or numero < 0:
        raise ValueError("O valor deve ser um número maior ou igual a zero.")

    return numero.quantize(Decimal("0.01"))


def conferir_registro(cursor, tabela, registro_id, rotulo):
    # Os nomes das tabelas vêm exclusivamente do próprio código.
    cursor.execute(
        f"SELECT id FROM `{tabela}` WHERE id = %s",
        (registro_id,)
    )

    if cursor.fetchone() is None:
        raise ValueError(f"{rotulo} não encontrado.")


@app.after_request
def sem_cache(response):
    response.headers["Cache-Control"] = "no-store"
    return response


@app.errorhandler(ValueError)
def erro_validacao(erro):
    return resposta({"error": str(erro)}, 400)


@app.errorhandler(mysql.connector.Error)
def erro_mysql(erro):
    app.logger.exception("Falha no MySQL")
    return resposta({"error": str(erro)}, 500)


@app.errorhandler(HTTPException)
def erro_http(erro):
    if request.path.startswith("/api/"):
        return resposta({"error": erro.description}, erro.code)

    return erro


@app.errorhandler(Exception)
def erro_inesperado(erro):
    app.logger.exception("Erro inesperado")

    if request.path.startswith("/api/"):
        return resposta({"error": "Erro interno. Consulte o terminal."}, 500)

    return "Erro interno. Consulte o terminal.", 500


# ---------------- PÁGINAS HTML ----------------

@app.route("/")
def pagina_inicial():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<pagina>")
def pagina_html(pagina):
    nome = pagina.removesuffix(".html")

    if nome in {"index", "clientes", "contratos", "prazos", "gastos"}:
        return send_from_directory(FRONTEND_DIR, f"{nome}.html")

    from flask import abort
    abort(404)


# ---------------- CLIENTES ----------------

@app.route("/api/clientes", methods=["GET", "POST"])
def api_clientes():
    with banco() as (conn, cursor):
        if request.method == "POST":
            dados = dados_recebidos()

            nome = obrigatorio(dados, "nome", "Nome")
            email = obrigatorio(dados, "email", "E-mail")
            senha = texto(dados, "senha") or texto(dados, "senha_provisoria")

            cursor.execute("""
                INSERT INTO clientes (
                    nome, email, senha_hash, telefone, cnpj_cpf
                )
                VALUES (%s, %s, %s, %s, %s)
            """, (
                nome,
                email,
                generate_password_hash(senha) if senha else "",
                texto(dados, "telefone") or None,
                texto(dados, "cnpj_cpf") or None
            ))

            novo_id = cursor.lastrowid
            conn.commit()

            return resposta({
                "message": "Cliente cadastrado com sucesso!",
                "id": novo_id
            }, 201)

        cursor.execute("""
            SELECT id, nome, email, telefone, cnpj_cpf, criado_em
            FROM clientes
            ORDER BY id DESC
        """)

        return resposta(cursor.fetchall())


# ---------------- CONTRATOS ----------------

@app.route("/api/contratos", methods=["GET", "POST"])
def api_contratos():
    with banco() as (conn, cursor):
        if request.method == "POST":
            dados = dados_recebidos()

            cliente_id = inteiro_positivo(
                dados.get("cliente_id"), "Cliente"
            )
            titulo = obrigatorio(dados, "titulo", "Título")

            inicio = data_valida(
                dados.get("data_inicio"), "Data de início"
            )
            termino = data_valida(
                dados.get("data_termino"), "Data de término"
            )

            if inicio and termino and termino < inicio:
                raise ValueError(
                    "A data de término não pode ser anterior ao início."
                )

            conferir_registro(cursor, "clientes", cliente_id, "Cliente")

            cursor.execute("""
                INSERT INTO contratos (
                    cliente_id, titulo, descricao, valor_total,
                    link_minuta, status, data_inicio, data_termino
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                cliente_id,
                titulo,
                texto(dados, "descricao"),
                dinheiro(dados.get("valor_total") or "0"),
                texto(dados, "link_minuta") or None,
                texto(dados, "status") or "Em Análise",
                inicio,
                termino
            ))

            novo_id = cursor.lastrowid
            conn.commit()

            return resposta({
                "message": "Contrato cadastrado com sucesso!",
                "id": novo_id
            }, 201)

        sql = """
            SELECT c.*, cl.nome AS cliente_nome
            FROM contratos c
            LEFT JOIN clientes cl ON cl.id = c.cliente_id
        """
        parametros = []

        cliente_id = request.args.get("cliente_id")
        if cliente_id:
            sql += " WHERE c.cliente_id = %s"
            parametros.append(inteiro_positivo(cliente_id, "Cliente"))

        sql += " ORDER BY c.id DESC"

        limite = request.args.get("limit")
        if limite:
            limite = min(inteiro_positivo(limite, "Limite"), 500)
            sql += " LIMIT %s"
            parametros.append(limite)

        cursor.execute(sql, tuple(parametros))
        return resposta(cursor.fetchall())


# ---------------- PRAZOS ----------------

@app.route("/api/prazos", methods=["GET", "POST"])
def api_prazos():
    with banco() as (conn, cursor):
        if request.method == "POST":
            dados = dados_recebidos()

            contrato_id = inteiro_positivo(
                dados.get("contrato_id"), "Contrato"
            )
            descricao = obrigatorio(dados, "descricao", "Descrição")
            limite = data_valida(
                dados.get("data_limite"), "Data limite", True
            )

            conferir_registro(cursor, "contratos", contrato_id, "Contrato")

            cursor.execute("""
                INSERT INTO prazos (
                    contrato_id, descricao, data_limite, status
                )
                VALUES (%s, %s, %s, %s)
            """, (
                contrato_id,
                descricao,
                limite,
                texto(dados, "status") or "Pendente"
            ))

            novo_id = cursor.lastrowid
            conn.commit()

            return resposta({
                "message": "Prazo cadastrado com sucesso!",
                "id": novo_id
            }, 201)

        cursor.execute("""
            SELECT p.*, c.titulo AS contrato_titulo
            FROM prazos p
            LEFT JOIN contratos c ON c.id = p.contrato_id
            ORDER BY p.data_limite ASC, p.id DESC
        """)

        return resposta(cursor.fetchall())


# ---------------- GASTOS ----------------

@app.route("/api/gastos", methods=["GET", "POST"])
def api_gastos():
    with banco() as (conn, cursor):
        if request.method == "POST":
            dados = dados_recebidos()

            contrato_id = inteiro_positivo(
                dados.get("contrato_id"), "Contrato"
            )
            descricao = obrigatorio(dados, "descricao", "Descrição")
            data_gasto = data_valida(
                dados.get("data_gasto"), "Data do gasto", True
            )

            conferir_registro(cursor, "contratos", contrato_id, "Contrato")

            cursor.execute("""
                INSERT INTO gastos (
                    contrato_id, descricao, valor,
                    data_gasto, comprovante_url
                )
                VALUES (%s, %s, %s, %s, %s)
            """, (
                contrato_id,
                descricao,
                dinheiro(dados.get("valor")),
                data_gasto,
                texto(dados, "comprovante_url") or None
            ))

            novo_id = cursor.lastrowid
            conn.commit()

            return resposta({
                "message": "Gasto cadastrado com sucesso!",
                "id": novo_id
            }, 201)

        cursor.execute("""
            SELECT g.*, c.titulo AS contrato_titulo
            FROM gastos g
            LEFT JOIN contratos c ON c.id = g.contrato_id
            ORDER BY g.data_gasto DESC, g.id DESC
        """)

        return resposta(cursor.fetchall())


# ---------------- DASHBOARD ----------------

@app.route("/api/dashboard", methods=["GET"])
def api_dashboard():
    hoje = date.today()
    inicio_mes = hoje.replace(day=1)
    inicio_anterior = (inicio_mes - timedelta(days=1)).replace(day=1)

    if hoje.month == 12:
        proximo_mes = date(hoje.year + 1, 1, 1)
    else:
        proximo_mes = date(hoje.year, hoje.month + 1, 1)

    with banco() as (_, cursor):
        cursor.execute("""
            SELECT
                COUNT(*) AS total,
                COALESCE(SUM(
                    criado_em >= %s AND criado_em < %s
                ), 0) AS novos_mes
            FROM clientes
        """, (inicio_mes, proximo_mes))
        clientes = cast(dict[str, Any], cursor.fetchone())

        cursor.execute("""
            SELECT
                COALESCE(SUM(
                    status IN ('Em Análise', 'Ativo', 'Em Andamento')
                ), 0) AS em_andamento,
                COALESCE(SUM(
                    status IN ('Em Análise', 'Ativo', 'Em Andamento')
                    AND data_termino BETWEEN %s AND %s
                ), 0) AS encerram_30d
            FROM contratos
        """, (hoje, hoje + timedelta(days=30)))
        contratos = cast(dict[str, Any], cursor.fetchone())

        cursor.execute("""
            SELECT
                COALESCE(SUM(
                    COALESCE(status, 'Pendente') <> 'Concluído'
                    AND data_limite >= %s
                    AND data_limite < %s
                ), 0) AS proximos,
                COALESCE(SUM(
                    COALESCE(status, 'Pendente') <> 'Concluído'
                    AND data_limite < %s
                ), 0) AS atrasados
            FROM prazos
        """, (hoje, hoje + timedelta(days=7), hoje))
        prazos = cast(dict[str, Any], cursor.fetchone())

        cursor.execute("""
            SELECT
                COALESCE(SUM(CASE
                    WHEN data_gasto >= %s AND data_gasto < %s
                    THEN valor ELSE 0
                END), 0) AS mes_atual,
                COALESCE(SUM(CASE
                    WHEN data_gasto >= %s AND data_gasto < %s
                    THEN valor ELSE 0
                END), 0) AS mes_anterior
            FROM gastos
        """, (
            inicio_mes, proximo_mes,
            inicio_anterior, inicio_mes
        ))
        gastos = cast(dict[str, Any], cursor.fetchone())

    return resposta({
        "clientes": {
            "total": int(clientes["total"]),
            "novos_mes": int(clientes["novos_mes"])
        },
        "contratos": {
            "em_andamento": int(contratos["em_andamento"]),
            "encerram_30d": int(contratos["encerram_30d"])
        },
        "prazos": {
            "proximos": int(prazos["proximos"]),
            "vencem_semana": int(prazos["proximos"]),
            "atrasados": int(prazos["atrasados"])
        },
        "gastos": {
            "mes_atual": float(gastos["mes_atual"]),
            "mes_anterior": float(gastos["mes_anterior"])
        }
    })


# ---------------- JANELA DESKTOP ----------------

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Sistema de Gestão MEI")
        self.resize(1280, 720)

        self.browser = QWebEngineView()
        self.setCentralWidget(self.browser)
        self.browser.setUrl(QUrl("http://127.0.0.1:5000/"))


if __name__ == "__main__":
    if not (FRONTEND_DIR / "index.html").is_file():
        raise SystemExit(
            f"Não encontrei index.html na pasta: {FRONTEND_DIR}"
        )

    # Cria o servidor antes de abrir a janela.
    # Se a porta estiver ocupada, não abre outra janela ligada ao processo antigo.
    servidor = make_server("127.0.0.1", 5000, app, threaded=True)
    thread = threading.Thread(target=servidor.serve_forever, daemon=True)
    thread.start()

    qt_app = QApplication(sys.argv)
    janela = MainWindow()
    janela.show()

    try:
        codigo_saida = qt_app.exec()
    finally:
        servidor.shutdown()
        servidor.server_close()

    sys.exit(codigo_saida)