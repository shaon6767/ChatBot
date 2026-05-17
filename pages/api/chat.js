import { getProducts, formatProductsForAI } from "../../lib/sheets";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, businessName, businessLang, businessRules } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const products = await getProducts();
  const productList = formatProductsForAI(products);

  const systemPrompt = `You are a customer service and sales agent for "${businessName || "this business"}".

LIVE PRODUCT LIST:
${productList}

EXTRA BUSINESS INFO:
${businessRules || ""}

LANGUAGE RULES:
- If customer writes Bangla script: reply in Bangla script
- If customer writes English: reply in English
- If customer writes Banglish: reply in proper Bangla script
- NEVER write Bangla words in English letters

PHOTO RULES:
- If customer asks for photo or ছবি, put URL on its own line exactly: PHOTO:https://...
- Only send photo if URL exists in product list
- If no photo: দুঃখিত, এই পণ্যের ছবি এখন নেই

STOCK RULES:
- If product is ❌ Out of stock, tell customer it is unavailable
- Suggest similar in-stock products if possible

ORDER COLLECTION RULES:
- When customer wants to buy, collect these one by one:
  1. Which product and quantity
  2. Full name
  3. Phone number
  4. Delivery address
- After collecting all 4, show a summary and ask for confirmation ONCE
- When showing summary, output a JSON block EXACTLY like this on its own line:
  ORDERDATA:{"product":"ACTUAL_PRODUCT","quantity":"ACTUAL_QTY","name":"ACTUAL_NAME","phone":"ACTUAL_PHONE","address":"ACTUAL_ADDRESS","total":"ACTUAL_TOTAL"}
- After showing summary, ask ONCE: "আপনি কি অর্ডার confirm করতে চান?"
- If buyer says হ্যাঁ/yes/confirm/ji: reply with ORDER_CONFIRMED then say "আপনার অর্ডার নেওয়া হয়েছে! আমরা শীঘ্রই যোগাযোগ করব। ধন্যবাদ 🎉"
- If buyer says না/no/nah/cancel or anything negative: say "ঠিক আছে, কোনো সমস্যা নেই। অন্য কিছু জানতে চাইলে বলুন 😊" then STOP asking about the order
- NEVER repeat the order confirmation question after the buyer said no
- NEVER ask for confirmation more than once
- If buyer asks to see their order again, review their order, or says "order dekhao/order ta dekhan/order confirm korte chai" — show the ORDERDATA again with the same details and ask for confirmation
- Keep track of the order details throughout the conversation

YOUR JOB:
- Answer questions about products, prices, delivery
- Negotiate politely — never go below minimum price
- Be friendly and short (2-4 sentences)
- Never reveal you are an AI unless directly asked
- Guide interested buyers through the order process`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    if (response.status === 429) {
      // Wait 3 seconds and retry once automatically
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const retryResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 400,
          temperature: 0.7,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      });

      const retryData = await retryResponse.json();

      if (retryResponse.status === 429 || retryData.error) {
        return res.status(200).json({
          reply: "একটু ব্যস্ত আছি, ৩০ সেকেন্ড পর আবার চেষ্টা করুন। 🙏",
          orderData: null,
          isConfirmed: false,
        });
      }

      const retryReply = retryData.choices?.[0]?.message?.content || "Sorry, no response.";
      return res.status(200).json({
        reply: retryReply,
        orderData: null,
        isConfirmed: false,
      });
    }

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, no response.";

    // Flexible order data extraction
    let orderData = null;
    const orderMatch = reply.match(/ORDERDATA:\s*({[\s\S]+?})/);
    if (orderMatch) {
      try {
        orderData = JSON.parse(orderMatch[1]);
      } catch (e) {
        const product = reply.match(/"product"\s*:\s*"([^"]+)"/)?.[1];
        const quantity = reply.match(/"quantity"\s*:\s*"([^"]+)"/)?.[1];
        const name = reply.match(/"name"\s*:\s*"([^"]+)"/)?.[1];
        const phone = reply.match(/"phone"\s*:\s*"([^"]+)"/)?.[1];
        const address = reply.match(/"address"\s*:\s*"([^"]+)"/)?.[1];
        const total = reply.match(/"total"\s*:\s*"([^"]+)"/)?.[1];
        if (product && name && phone) {
          orderData = { product, quantity, name, phone, address, total };
        }
      }
    }

    const isConfirmed = reply.includes("ORDER_CONFIRMED");

    const cleanReply = reply
      .replace(/ORDERDATA:\s*{[\s\S]+?}/, "")
      .replace("ORDER_CONFIRMED", "")
      .trim();

    return res.status(200).json({ reply: cleanReply, orderData, isConfirmed });

  } catch (error) {
    return res.status(500).json({ error: "Failed to contact AI" });
  }
}