import { getProducts } from "../../lib/sheets";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const products = await getProducts();
  return res.status(200).json({ products });
}