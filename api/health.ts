export default function handler(
  _req: any,
  res: any
) {
  return res.status(200).json({
    ok: true,
    service: "DeeDee API",
    platform: "Vercel",
    message: "DeeDee backend is running on Vercel.",
    timestamp: new Date().toISOString(),
  });
}
