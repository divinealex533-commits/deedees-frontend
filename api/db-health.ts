import { pool } from "../src/server/db";

export default async function handler(
  _req: any,
  res: any
) {
  try {
    const result = await pool.query(
      "SELECT NOW() AS database_time"
    );

    return res.status(200).json({
      ok: true,
      database: "connected",
      platform: "Vercel",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return res.status(500).json({
      ok: false,
      database: "connection_failed",
      error: "Database connection failed",
    });
  }
}