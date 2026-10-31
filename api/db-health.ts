export default async function handler(
  _req: any,
  res: any
) {
  try {
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

    if (!hasDatabaseUrl) {
      return res.status(500).json({
        ok: false,
        database: "not_configured",
        hasDatabaseUrl: false,
        platform: "Vercel",
      });
    }

    const { Pool } = await import("pg");

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 10000,
    });

    const result = await pool.query(
      "SELECT NOW() AS database_time"
    );

    await pool.end();

    return res.status(200).json({
      ok: true,
      database: "connected",
      hasDatabaseUrl: true,
      platform: "Vercel",
      databaseTime: result.rows[0]?.database_time ?? null,
    });
  } catch (error: any) {
    console.error("DB HEALTH ERROR:", error);

    return res.status(500).json({
      ok: false,
      database: "connection_failed",
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      platform: "Vercel",
      error: error?.message || "Unknown database error",
    });
  }
}