export async function askOpenAIStream(
  prompt: string,
  {
    signal,
    onToken,
  }: {
    signal?: AbortSignal;
    onToken: (chunk: string) => void;
  }
): Promise<void> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("Missing VITE_OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    if( res.status == 401 ) throw new Error("Incorrect API key");
    else throw new Error(`OpenAI error ${res.status}: ${text || "no body"}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });

    const lines = chunk.split("\n");
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const delta: string =
          json.choices?.[0]?.delta?.content ??
          json.choices?.[0]?.text ??
          "";
        if (delta) onToken(delta);
      } catch {
      }
    }
  }
}
