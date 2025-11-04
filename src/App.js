import React, { useEffect, useMemo, useState } from "react";

// ===============================
// Flashcards 2.0 — czysty React + Tailwind
// Funkcje: licznik, kontynuacja tylko błędnych (≤10), podzbiory (segregacja),
// upload JSON, DEMO, klawisze (Spacja/J/K/←/→), flip 3D bez bibliotek UI.
// ===============================

// --- Demo ---
const DEMO = [
  { id: "1", term: "apple", definition: "jabłko" },
  { id: "2", term: "book", definition: "książka" },
  { id: "3", term: "chair", definition: "krzesło" },
  { id: "4", term: "to learn", definition: "uczyć się" },
  { id: "5", term: "to remember", definition: "zapamiętać" },
  { id: "6", term: "to forget", definition: "zapomnieć" },
  { id: "7", term: "morning", definition: "poranek" },
  { id: "8", term: "evening", definition: "wieczór" },
  { id: "9", term: "question", definition: "pytanie" },
  { id: "10", term: "answer", definition: "odpowiedź" },
];

// --- Helpers ---
const uuid = (() => {
  let c = 0;
  return () => `${Date.now()}_${c++}`;
})();

function normalizeJson(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : raw.items || raw.cards || [];
  const out = [];
  for (const it of arr) {
    let term = "";
    let definition = "";
    if (typeof it === "string") {
      const [a, b] = it.split(/\s*[-–:]\s*/);
      term = a || it;
      definition = b || "";
    } else if (it) {
      term = it.term || it.front || it.word || "";
      definition = it.definition || it.back || it.translation || "";
    }
    if (!term) continue;
    out.push({
      id: uuid(),
      term: String(term),
      definition: String(definition || ""),
    });
  }
  return out;
}

function shuffle(arr, seed) {
  const a = [...arr];
  // proste LCG, by zachować deterministyczny shuffle (opcjonalnie)
  let s = seed ?? Date.now();
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsApp() {
  // Data
  const [allCards, setAllCards] = useState(DEMO);
  const [studyPool, setStudyPool] = useState(DEMO);

  // Flow/UI
  const [idx, setIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [tab, setTab] = useState("learn"); // "learn" | "subset"
  const [isRunning, setIsRunning] = useState(true);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));

  // Stats
  const [correctIds, setCorrectIds] = useState([]);
  const [wrongIds, setWrongIds] = useState([]);

  const current = studyPool[idx];
  const finished = idx >= studyPool.length;
  const progress = useMemo(() => {
    const total = studyPool.length || 1;
    const done = Math.min(idx, total);
    return Math.round((done / total) * 100);
  }, [idx, studyPool.length]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (tab !== "learn" || !isRunning) return;
      if (e.key === " ") {
        e.preventDefault();
        setShowBack((s) => !s);
      } else if (e.key.toLowerCase() === "j" || e.key === "ArrowLeft") {
        handleAnswer(false);
      } else if (e.key.toLowerCase() === "k" || e.key === "ArrowRight") {
        handleAnswer(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tab, isRunning, idx, studyPool]);

  // Selection (segregacja)
  const [selection, setSelection] = useState({}); // id -> boolean
  const selectedCount = useMemo(
    () => Object.values(selection).filter(Boolean).length,
    [selection]
  );

  function toggleSelect(id, value) {
    setSelection((s) => ({ ...s, [id]: value ?? !s[id] }));
  }

  // Handlers
  function startWith(cards) {
    const shuffled = shuffle(cards, seed);
    setStudyPool(shuffled);
    setIdx(0);
    setShowBack(false);
    setCorrectIds([]);
    setWrongIds([]);
    setIsRunning(true);
    setTab("learn");
  }

  function handleAnswer(correct) {
    if (finished) return;
    const id = studyPool[idx]?.id;
    if (!id) return;
    if (correct) setCorrectIds((s) => (s.includes(id) ? s : [...s, id]));
    else setWrongIds((s) => (s.includes(id) ? s : [...s, id]));
    setIdx((i) => i + 1);
    setShowBack(false);
  }

  function resetAll() {
    setSeed(Math.floor(Math.random() * 1e9));
    startWith(allCards);
  }

  function continueWithWrongs() {
    const wrongOnly = allCards.filter((c) => wrongIds.includes(c.id));
    if (wrongOnly.length === 0) return;
    startWith(wrongOnly);
  }

  async function onUploadFiles(files) {
    if (!files || !files.length) return;
    const contents = [];
    for (const f of Array.from(files)) {
      const text = await f.text();
      try {
        contents.push(...normalizeJson(JSON.parse(text)));
      } catch (e) {
        console.error("Invalid JSON in", f.name, e);
      }
    }
    if (contents.length) {
      const withIds = contents.map((c) => ({ ...c, id: uuid() }));
      setAllCards(withIds);
      startWith(withIds);
    }
  }

  function startWithSelected() {
    const chosen = allCards.filter((c) => selection[c.id]);
    if (chosen.length > 0) startWith(chosen);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">EN Flashcards</h1>
            <p className="text-slate-600">
              Wybierz zestaw (JSON) i ucz się fiszkami. Spacja — odwróć, J/←
              źle, K/→ dobrze.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <span className="px-2 py-1 rounded bg-slate-100">Wgraj JSON</span>
              <input
                type="file"
                accept="application/json"
                multiple
                onChange={(e) => onUploadFiles(e.target.files)}
                className="hidden"
                id="fileup"
              />
              <label
                htmlFor="fileup"
                className="px-3 py-2 rounded bg-slate-100 cursor-pointer"
              >
                Wybierz pliki
              </label>
            </label>
            <button
              className="px-3 py-2 rounded border bg-white hover:bg-slate-50"
              onClick={() => {
                const withIds = DEMO.map((c) => ({ ...c, id: uuid() }));
                setAllCards(withIds);
                startWith(withIds);
              }}
            >
              Załaduj DEMO
            </button>
          </div>
        </div>

        {/* Stats + Controls */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <span className="rounded-2xl px-3 py-1 bg-green-100">
              Dobrze: {correctIds.length}
            </span>
            <span className="rounded-2xl px-3 py-1 bg-red-100">
              Źle: {wrongIds.length}
            </span>
            <span className="rounded-2xl px-3 py-1 bg-slate-100">
              Postęp: {progress}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning((s) => !s)}
              className="px-3 py-2 rounded border bg-white hover:bg-slate-50"
            >
              {isRunning ? "Pauza" : "Start"}
            </button>
            <button
              onClick={resetAll}
              className="px-3 py-2 rounded border bg-white hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
          <div className="flex items-center gap-2 justify-start sm:justify-end">
            <span className="rounded-2xl px-3 py-1 bg-slate-100">
              Karty: {studyPool.length}
            </span>
            <span className="rounded-2xl px-3 py-1 bg-slate-100">
              Zestaw: {allCards.length}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <div className="inline-flex rounded-xl border bg-white p-1">
            <button
              className={`px-4 py-2 rounded-lg ${
                tab === "learn"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => setTab("learn")}
            >
              Nauka
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                tab === "subset"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => setTab("subset")}
            >
              Podzbiory
            </button>
          </div>
        </div>

        {/* Learn Tab */}
        {tab === "learn" && (
          <div className="mt-6">
            {!finished ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Card */}
                <div className="md:col-span-2">
                  <div className="rounded-2xl shadow-lg border bg-white p-6">
                    <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
                      <div>
                        {Math.min(idx + 1, studyPool.length)} /{" "}
                        {studyPool.length}
                      </div>
                      <div>Kliknij kartę lub wciśnij Spację</div>
                    </div>

                    {/* Flip card */}
                    <div style={{ perspective: "1000px" }}>
                      <div
                        onClick={() => setShowBack((s) => !s)}
                        className="relative h-56 md:h-64 cursor-pointer select-none"
                        style={{
                          transformStyle: "preserve-3d",
                          transition:
                            "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)",
                          transform: `rotateY(${showBack ? 180 : 0}deg)`,
                        }}
                      >
                        {/* Front */}
                        <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold [backface-visibility:hidden]">
                          {current?.term}
                        </div>
                        {/* Back */}
                        <div
                          className="absolute inset-0 flex items-center justify-center text-2xl font-medium [backface-visibility:hidden]"
                          style={{ transform: "rotateY(180deg)" }}
                        >
                          {current?.definition || (
                            <span className="text-slate-400">
                              (brak tłumaczenia)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAnswer(false)}
                        className="px-4 py-3 rounded-xl bg-red-500 text-white font-medium"
                      >
                        Źle (J/←)
                      </button>
                      <button
                        onClick={() => handleAnswer(true)}
                        className="px-4 py-3 rounded-xl bg-green-600 text-white font-medium"
                      >
                        Dobrze (K/→)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="rounded-2xl shadow-lg border bg-white p-6">
                  <h2 className="text-xl font-semibold">Koniec rundy</h2>
                  <p className="text-slate-600 mt-1">
                    Wynik: <strong>{correctIds.length}</strong> dobrze,{" "}
                    <strong>{wrongIds.length}</strong> źle.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={resetAll}
                      className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50"
                    >
                      Zacznij od nowa (cały zestaw)
                    </button>
                    {wrongIds.length > 0 && wrongIds.length <= 10 && (
                      <button
                        onClick={continueWithWrongs}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white"
                      >
                        Kontynuuj naukę (tylko błędne)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subset Tab */}
        {tab === "subset" && (
          <div className="mt-6">
            <div className="rounded-2xl shadow-md border bg-white p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <button
                  className="px-3 py-2 rounded border bg-white hover:bg-slate-50"
                  onClick={() => setSelection({})}
                >
                  Wyczyść wybór
                </button>
                <button
                  className="px-3 py-2 rounded border bg-white hover:bg-slate-50"
                  onClick={() =>
                    setSelection(
                      Object.fromEntries(allCards.map((c) => [c.id, true]))
                    )
                  }
                >
                  Zaznacz wszystko
                </button>
                <button
                  className="px-3 py-2 rounded bg-slate-900 text-white"
                  onClick={startWithSelected}
                >
                  Start z zaznaczonych ({selectedCount})
                </button>
                <button
                  className="px-3 py-2 rounded border bg-white hover:bg-slate-50"
                  onClick={() => {
                    const top5 = Object.fromEntries(
                      allCards.slice(0, 5).map((c) => [c.id, true])
                    );
                    setSelection(top5);
                  }}
                >
                  Szybki fokus: 5 pierwszych
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-auto pr-1">
                {allCards.map((c, i) => (
                  <label
                    key={c.id}
                    className="flex items-start gap-3 rounded-xl border p-3 hover:shadow-sm"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={!!selection[c.id]}
                      onChange={(e) => toggleSelect(c.id, e.target.checked)}
                    />
                    <div>
                      <div className="font-medium">
                        {c.term}{" "}
                        <span className="text-slate-400 text-sm">#{i + 1}</span>
                      </div>
                      <div className="text-slate-600">
                        {c.definition || (
                          <span className="text-slate-400">
                            (brak tłumaczenia)
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Tip: Możesz wgrać własny plik JSON z polami: <code>term</code>/
                <code>front</code>/<code>word</code> i <code>definition</code>/
                <code>back</code>/<code>translation</code>, albo prostą tablicę
                stringów typu "front - back".
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          Made with ❤️ — tryb demo działa bez pliku JSON
        </div>
      </div>
    </div>
  );
}
