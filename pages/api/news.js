import { getNewsFeed } from "../../lib/news";

export default async function handler(req, res) {
  try {
    res.setHeader("Cache-Control", "s-maxage=45, stale-while-revalidate=120");
    res.status(200).json(
      await getNewsFeed({
        symbol: req.query.symbol,
        category: req.query.category,
        limit: req.query.limit || 40
      })
    );
  } catch (error) {
    res.status(200).json({ news: [], error: error.message, updatedAt: new Date().toISOString() });
  }
}
