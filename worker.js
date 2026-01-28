export default {
  async fetch(req, env) {
    if (req.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    const url = new URL(req.url);
    if (url.pathname !== "/chat") {
      return new Response("Not found", { status: 404 });
    }

    const { system, messages } = await req.json();

    // ---- 会話履歴は直近10往復（20件）に制限 ----
    const trimmedMessages = messages.slice(-20);

    const response = await env.AI.run(
      "@cf/meta/llama-3.2-3b-instruct",
      {
        messages: [
          { role: "system", content: system },
          ...trimmedMessages
        ],
        temperature: 0.7,
        max_tokens: 512
      }
    );

    return new Response(
      JSON.stringify({
        reply: response.response
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

