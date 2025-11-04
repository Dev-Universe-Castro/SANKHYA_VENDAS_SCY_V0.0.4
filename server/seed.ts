import { getOracleConnection } from "./oracle-db";
import { hashPassword } from "./auth";

async function seed() {
  console.log("🌱 Iniciando seed do banco Oracle...");

  try {
    const connection = await getOracleConnection();

    // Verificar se usuário admin já existe
    const checkResult = await connection.execute(
      `SELECT ID FROM USERS WHERE EMAIL = :email`,
      ['admin@sistema.com'],
      { outFormat: 4 }
    );

    if (checkResult.rows && checkResult.rows.length > 0) {
      console.log("ℹ️ Usuário admin já existe");
      await connection.close();
      return;
    }

    // Criar usuário admin
    const hashedPassword = await hashPassword("admin123");
    const id = require('crypto').randomUUID();

    await connection.execute(
      `INSERT INTO USERS (ID, EMAIL, PASSWORD, NOME, PERFIL) 
      VALUES (:id, :email, :password, :nome, :perfil)`,
      {
        id,
        email: 'admin@sistema.com',
        password: hashedPassword,
        nome: 'Administrador',
        perfil: 'ADM'
      },
      { autoCommit: true }
    );

    await connection.close();

    console.log("✅ Seed concluído!");
    console.log("📧 Email: admin@sistema.com");
    console.log("🔑 Senha: admin123");
  } catch (error) {
    console.error("❌ Erro no seed:", error);
    throw error;
  }
}

seed();