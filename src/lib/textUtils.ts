// textUtils — small pure helpers for text coming from the CMS.

// Splits a CMS info field into display lines. The Decap markdown editor saves
// a Shift+Enter line break as a trailing "\" (Markdown hard break), but we
// render these lines as plain text, so the "\" must be removed.
export function splitInfoLines(text: string): string[] {
  return text
    .trim()
    .split("\n")
    .map((line) => line.replace(/\\\s*$/, "").trimEnd())
    .filter(Boolean);
}
