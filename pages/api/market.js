import { getMarketQuotes } from "../../lib/market";
export default async function handler(_req, res) { try { res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60"); res.status(200).json(await getMarketQuotes()); } catch (error) { res.status(200).json({ quotes: [], error: error.message, updatedAt: new Date().toISOString() }); } }
