import { runScreener } from "../../lib/screener";

export default async function handler(req, res) {
  try {
    const mode = req.query.mode === "discount" ? "discount" : "market";
    const limit = Number(req.query.limit || 10);
    const result = await runScreener({ mode, limit });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "screener_unavailable", message: error.message });
  }
}
