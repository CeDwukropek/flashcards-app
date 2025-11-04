export const uuid = (() => {
  let c = 0;
  return () => `${Date.now()}_${c++}`;
})();

export function normalizeJson(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : raw.items || raw.cards || [];
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
