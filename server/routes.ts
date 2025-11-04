import { Router, Request, Response } from "express";
import { verifyToken } from "./auth";
import { getOracleConnection } from './oracle-db';
import type { Empresa } from "@shared/schema";

const router = Router();

// Middleware de autenticação
router.use(verifyToken);

// ========== EMPRESAS ==========

// GET /api/empresas - Listar todas as empresas
router.get("/empresas", async (req: Request, res: Response) => {
  try {
    const connection = await getOracleConnection();

    const result = await connection.execute(
      `SELECT 
        ID,
        NOME,
        ATIVO,
        ULTIMA_SYNC,
        SANKHYA_ENDPOINT,
        SANKHYA_APP_KEY,
        SANKHYA_USERNAME,
        CREATED_AT
      FROM EMPRESAS
      ORDER BY NOME`,
      [],
      { outFormat: 4 } // OBJECT format
    );

    await connection.close();

    const empresas = (result.rows || []).map((row: any) => ({
      id: row.ID,
      nome: row.NOME,
      ativo: row.ATIVO === 1,
      ultima_sync: row.ULTIMA_SYNC,
      sankhya_endpoint: row.SANKHYA_ENDPOINT,
      sankhya_app_key: row.SANKHYA_APP_KEY,
      sankhya_username: row.SANKHYA_USERNAME,
      created_at: row.CREATED_AT,
    }));

    res.json(empresas);
  } catch (error: any) {
    console.error("Erro ao buscar empresas:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/empresas/:id - Buscar empresa por ID
router.get("/empresas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await getOracleConnection();

    const result = await connection.execute(
      `SELECT 
        ID,
        NOME,
        ATIVO,
        ULTIMA_SYNC,
        SANKHYA_ENDPOINT,
        SANKHYA_APP_KEY,
        SANKHYA_USERNAME,
        CREATED_AT
      FROM EMPRESAS
      WHERE ID = :id`,
      [id],
      { outFormat: 4 }
    );

    await connection.close();

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "Empresa não encontrada" });
    }

    const row: any = result.rows[0];
    const empresa = {
      id: row.ID,
      nome: row.NOME,
      ativo: row.ATIVO === 1,
      ultima_sync: row.ULTIMA_SYNC,
      sankhya_endpoint: row.SANKHYA_ENDPOINT,
      sankhya_app_key: row.SANKHYA_APP_KEY,
      sankhya_username: row.SANKHYA_USERNAME,
      created_at: row.CREATED_AT,
    };

    res.json(empresa);
  } catch (error: any) {
    console.error("Erro ao buscar empresa:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/empresas - Criar nova empresa
router.post("/empresas", async (req: Request, res: Response) => {
  try {
    const { nome, ativo, sankhya_endpoint, sankhya_app_key, sankhya_username, sankhya_password_encrypted } = req.body;
    const id = require('crypto').randomUUID();

    const connection = await getOracleConnection();

    await connection.execute(
      `INSERT INTO EMPRESAS (
        ID, NOME, ATIVO, SANKHYA_ENDPOINT, SANKHYA_APP_KEY, 
        SANKHYA_USERNAME, SANKHYA_PASSWORD_ENCRYPTED
      ) VALUES (
        :id, :nome, :ativo, :endpoint, :app_key, :username, :password
      )`,
      {
        id,
        nome,
        ativo: ativo ? 1 : 0,
        endpoint: sankhya_endpoint,
        app_key: sankhya_app_key,
        username: sankhya_username,
        password: sankhya_password_encrypted
      },
      { autoCommit: true }
    );

    await connection.close();

    res.status(201).json({
      id,
      nome,
      ativo,
      sankhya_endpoint,
      sankhya_app_key,
      sankhya_username,
      created_at: new Date()
    });
  } catch (error: any) {
    console.error("Erro ao criar empresa:", error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/empresas/:id - Atualizar empresa
router.put("/empresas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const connection = await getOracleConnection();

    const setClauses: string[] = [];
    const binds: any = { id };

    if (updates.nome !== undefined) {
      setClauses.push("NOME = :nome");
      binds.nome = updates.nome;
    }
    if (updates.ativo !== undefined) {
      setClauses.push("ATIVO = :ativo");
      binds.ativo = updates.ativo ? 1 : 0;
    }
    if (updates.sankhya_endpoint !== undefined) {
      setClauses.push("SANKHYA_ENDPOINT = :endpoint");
      binds.endpoint = updates.sankhya_endpoint;
    }
    if (updates.sankhya_app_key !== undefined) {
      setClauses.push("SANKHYA_APP_KEY = :app_key");
      binds.app_key = updates.sankhya_app_key;
    }
    if (updates.sankhya_username !== undefined) {
      setClauses.push("SANKHYA_USERNAME = :username");
      binds.username = updates.sankhya_username;
    }
    if (updates.sankhya_password_encrypted !== undefined) {
      setClauses.push("SANKHYA_PASSWORD_ENCRYPTED = :password");
      binds.password = updates.sankhya_password_encrypted;
    }

    if (setClauses.length === 0) {
      await connection.close();
      return res.status(400).json({ message: "Nenhum campo para atualizar" });
    }

    await connection.execute(
      `UPDATE EMPRESAS SET ${setClauses.join(", ")} WHERE ID = :id`,
      binds,
      { autoCommit: true }
    );

    await connection.close();

    res.json({ message: "Empresa atualizada com sucesso" });
  } catch (error: any) {
    console.error("Erro ao atualizar empresa:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/empresas/:id - Deletar empresa
router.delete("/empresas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await getOracleConnection();

    await connection.execute(
      `DELETE FROM EMPRESAS WHERE ID = :id`,
      [id],
      { autoCommit: true }
    );

    await connection.close();

    res.json({ message: "Empresa deletada com sucesso" });
  } catch (error: any) {
    console.error("Erro ao deletar empresa:", error);
    res.status(500).json({ message: error.message });
  }
});

// ========== LOGS ==========

// GET /api/logs - Listar logs de sincronização
router.get("/logs", async (req: Request, res: Response) => {
  try {
    const connection = await getOracleConnection();

    const result = await connection.execute(
      `SELECT 
        ID, EMPRESA_ID, TIPO, STATUS, DURACAO, DETALHES, ERRO, TIMESTAMP
      FROM SYNC_LOGS
      ORDER BY TIMESTAMP DESC`,
      [],
      { outFormat: 4 }
    );

    await connection.close();

    res.json(result.rows || []);
  } catch (error: any) {
    console.error("Erro ao buscar logs:", error);
    res.status(500).json({ message: error.message });
  }
});

// ========== CONFIGURAÇÕES ==========

// GET /api/configuracoes - Listar todas as configurações
router.get("/configuracoes", async (req: Request, res: Response) => {
  try {
    const connection = await getOracleConnection();

    const result = await connection.execute(
      `SELECT ID, CHAVE, VALOR, UPDATED_AT FROM CONFIGURACOES`,
      [],
      { outFormat: 4 }
    );

    await connection.close();

    res.json(result.rows || []);
  } catch (error: any) {
    console.error("Erro ao buscar configurações:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;