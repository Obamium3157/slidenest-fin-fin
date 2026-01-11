function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function plainTextToHtml(text: string): string {
  const escaped = escapeHtml(text).replace(/\n/g, "<br />");
  return `<p>${escaped}</p>`;
}
