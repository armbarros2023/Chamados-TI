import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config()
const dbSslEnabled = process.env.DB_SSL_ENABLED === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: dbSslEnabled ? {rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'} : false,
});

pool.on("connect", () => {
  console.log("Conectado ao banco de dados PostgreSQL!")
})

pool.on("error", (err) => {
  console.error("Erro inesperado no cliente do banco de dados", err)
  process.exit(-1)
})

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
}
