module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { symptom, services } = req.body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 200,
        messages: [{ role: "user", content: `Dental patient says: "${symptom}". Recommend ONE of: ${services}. Reply in 1-2 friendly sentences.` }]
      })
    });

    const data = await response.json();
    res.status(200).json({ result: data.content[0].text });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}