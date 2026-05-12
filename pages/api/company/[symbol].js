import { getCompany } from "../../../lib/company";
export default async function handler(req, res) { try { res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=180"); res.status(200).json(await getCompany(req.query.symbol)); } catch (error) { res.status(200).json({ symbol: req.query.symbol, news: [], error: error.message, updatedAt: new Date().toISOString() }); } }
