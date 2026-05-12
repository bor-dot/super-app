import { runAlarmEngine } from "../../lib/alarms";
export default async function handler(_req, res) { try { res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60"); res.status(200).json(await runAlarmEngine()); } catch (error) { res.status(200).json({ rules: [], alerts: [], error: error.message, updatedAt: new Date().toISOString() }); } }
