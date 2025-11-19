export const uuid = (() => {
  let c = 0;
  return () => `${Date.now()}_${c++}`;
})();

export function normalizeJson(raw) {
  if (!raw) return [];
  // Accept multiple shapes:
  // - an array of cards
  // - an object with `items` or `cards` arrays
  // - a single card object with `front`/`back` or `term`/`definition`
  let arr;
  if (Array.isArray(raw)) arr = raw;
  else if (raw.items) arr = raw.items;
  else if (raw.cards) arr = raw.cards;
  else if (raw.front || raw.back || raw.term || raw.definition) arr = [raw];
  else arr = [];
  return arr.map((it) => {
    if (typeof it === "string") {
      const [term, definition] = it.split(/\s*[-–:]\s*/);
      return { id: uuid(), term, definition };
    }
    return {
      id: uuid(),
      term: it.term || it.front || it.word || "",
      definition: it.definition || it.back || it.translation || "",
    };
  });
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
