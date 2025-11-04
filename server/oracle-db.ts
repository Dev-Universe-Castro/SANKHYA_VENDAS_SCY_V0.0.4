
import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.ORACLE_USER || 'SYSTEM',
  password: process.env.ORACLE_PASSWORD || 'Castro135!',
  connectString: process.env.ORACLE_CONNECTION_STRING || 'crescimentoerp.nuvemdatacom.com.br:9568/FREEPDB1'
};

let pool: oracledb.Pool | null = null;

export async function getOracleConnection() {
  if (!pool) {
    pool = await oracledb.createPool({
      ...dbConfig,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
      poolTimeout: 60
    });
    console.log('✅ Oracle connection pool created');
  }
  return pool.getConnection();
}

export async function closeOraclePool() {
  if (pool) {
    await pool.close(10);
    pool = null;
    console.log('🔒 Oracle connection pool closed');
  }
}
