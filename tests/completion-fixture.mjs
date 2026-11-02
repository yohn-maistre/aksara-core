// Scripted OpenAI-compatible HTTP fixture. Durable Mastra drains streaming
// responses even through generate(); keep synthetic tools and text as real SSE.
export function streamingCompletionFixture(res) {
  const end = res.end.bind(res);
  res.end = (body, ...rest) => {
    let data;
    try {
      data = JSON.parse(String(body));
    } catch {
      return end(body, ...rest);
    }
    if (data.object !== "chat.completion") return end(body, ...rest);
    const choice = data.choices[0];
    const delta = { ...choice.message };
    if (delta.tool_calls)
      delta.tool_calls = delta.tool_calls.map((call, index) => ({
        index,
        ...call,
      }));
    const chunk = (delta, finish_reason = null) => ({
      ...data,
      object: "chat.completion.chunk",
      choices: [{ index: 0, delta, finish_reason }],
    });
    res.setHeader("content-type", "text/event-stream");
    return end(
      `data: ${JSON.stringify(chunk(delta))}\n\ndata: ${JSON.stringify(chunk({}, choice.finish_reason))}\n\ndata: [DONE]\n\n`,
    );
  };
}
