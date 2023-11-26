export function formatHistory(messages: string[]) {
  return messages
    .map((message, i) => {
      if (i % 2 === 0) return `Human: ${message}`;
      return `AI: ${message}`;
    })
    .join("\n");
}
