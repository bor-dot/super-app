import { getChartData } from "../../lib/chart";

export default async function handler(req, res) {
  try {
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=90");
    res.status(200).json(
      await getChartData({
        symbol: req.query.symbol || "BIST100",
        range: req.query.range || "6mo",
        interval: req.query.interval || "1d"
      })
    );
  } catch (error) {
    res.status(200).json({ candles: [], error: error.message, updatedAt: new Date().toISOString() });
  }
}
