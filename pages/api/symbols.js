import { getBistSymbols } from "../../lib/symbols";

export default async function handler(_req, res) {
  try {
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
    res.status(200).json(await getBistSymbols());
  } catch (error) {
    res.status(200).json({ symbols: [], error: error.message, updatedAt: new Date().toISOString() });
  }
}
