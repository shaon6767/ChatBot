export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl = process.env.ORDERS_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: "Webhook URL not configured" });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(req.body),
    });

    await response.text();
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}