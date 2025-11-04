
import { getOracleConnection } from './oracle-db';
import { consultarRegistros } from './sankhya-api';
import { decrypt } from './crypto';

export async function sincronizarEmpresa(empresaId: string) {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 Iniciando sincronização para empresa ${empresaId}`);
    
    const connection = await getOracleConnection();
    
    // Buscar dados da empresa
    const empresaResult = await connection.execute(
      `SELECT 
        ID, NOME, SANKHYA_ENDPOINT, SANKHYA_APP_KEY, 
        SANKHYA_USERNAME, SANKHYA_PASSWORD_ENCRYPTED
      FROM EMPRESAS 
      WHERE ID = :id AND ATIVO = 1`,
      [empresaId],
      { outFormat: 4 }
    );
    
    if (!empresaResult.rows || empresaResult.rows.length === 0) {
      await connection.close();
      throw new Error('Empresa não encontrada ou inativa');
    }
    
    const empresa: any = empresaResult.rows[0];
    const password = decrypt(empresa.SANKHYA_PASSWORD_ENCRYPTED);
    
    const credentials = {
      endpoint: empresa.SANKHYA_ENDPOINT,
      appKey: empresa.SANKHYA_APP_KEY,
      username: empresa.SANKHYA_USERNAME,
      password: password
    };
    
    // Sincronizar parceiros
    const parceiros = await consultarRegistros(credentials, empresaId, 'Parceiro');
    console.log(`✅ Sincronizados ${parceiros.length} parceiros`);
    
    // Atualizar última sincronização
    await connection.execute(
      `UPDATE EMPRESAS SET ULTIMA_SYNC = CURRENT_TIMESTAMP WHERE ID = :id`,
      [empresaId],
      { autoCommit: true }
    );
    
    const duration = Date.now() - startTime;
    
    // Registrar log de sucesso
    const logId = require('crypto').randomUUID();
    await connection.execute(
      `INSERT INTO SYNC_LOGS (
        ID, EMPRESA_ID, TIPO, STATUS, DURACAO, 
        DETALHES, TIMESTAMP
      ) VALUES (
        :id, :empresa_id, :tipo, :status, :duracao, 
        :detalhes, CURRENT_TIMESTAMP
      )`,
      {
        id: logId,
        empresa_id: empresaId,
        tipo: 'SINCRONIZACAO_COMPLETA',
        status: 'SUCESSO',
        duracao: `${duration}ms`,
        detalhes: `Sincronizados ${parceiros.length} registros`
      },
      { autoCommit: true }
    );
    
    await connection.close();
    
    console.log(`✅ Sincronização concluída em ${duration}ms`);
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Erro na sincronização:', error);
    
    try {
      const connection = await getOracleConnection();
      const logId = require('crypto').randomUUID();
      
      await connection.execute(
        `INSERT INTO SYNC_LOGS (
          ID, EMPRESA_ID, TIPO, STATUS, DURACAO, 
          ERRO, TIMESTAMP
        ) VALUES (
          :id, :empresa_id, :tipo, :status, :duracao, 
          :erro, CURRENT_TIMESTAMP
        )`,
        {
          id: logId,
          empresa_id: empresaId,
          tipo: 'SINCRONIZACAO_COMPLETA',
          status: 'ERRO',
          duracao: `${duration}ms`,
          erro: error.message
        },
        { autoCommit: true }
      );
      
      await connection.close();
    } catch (logError) {
      console.error('❌ Erro ao registrar log de erro:', logError);
    }
    
    throw error;
  }
}
