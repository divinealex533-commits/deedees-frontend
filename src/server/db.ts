import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const TABLES = new Set([
  "users",
  "items",
  "deposits",
  "purchases",
  "categories",
  "tickets",
  "seller_storefronts",
  "seller_subscriptions",
  "seller_orders",
  "seller_withdrawals",
]);

function validateTable(table: string) {
  if (!TABLES.has(table)) {
    throw new Error(`Invalid database table: ${table}`);
  }
}

export async function readTable<T = any>(
  table: string
): Promise<T[]> {
  validateTable(table);

  const result = await pool.query(
    `SELECT id, data FROM ${table} ORDER BY id ASC`
  );

  return result.rows.map((row) => row.data as T);
}

export async function findUserByEmail(
  email: string
) {
  const result = await pool.query(
    `SELECT id, data
     FROM users
     WHERE LOWER(data->>'email') = LOWER($1)
     LIMIT 1`,
    [email]
  );

  return result.rows[0]?.data ?? null;
}

export async function findUserById(
  id: string
) {
  const result = await pool.query(
    `SELECT id, data
     FROM users
     WHERE data->>'id' = $1
     LIMIT 1`,
    [id]
  );

  return result.rows[0]?.data ?? null;
}

export async function insertUser(
  user: Record<string, any>
) {
  await pool.query(
    `INSERT INTO users (data)
     VALUES ($1::jsonb)`,
    [JSON.stringify(user)]
  );

  return user;
}

export async function updateUserById(
  id: string,
  user: Record<string, any>
) {
  const result = await pool.query(
    `UPDATE users
     SET data = $1::jsonb
     WHERE data->>'id' = $2`,
    [JSON.stringify(user), id]
  );

  return result.rowCount > 0;
}
