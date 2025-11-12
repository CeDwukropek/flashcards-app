import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Header } from "./components/Header";
import { Stats } from "./components/Stats";
import { TabSelector } from "./components/TabSelector";
import BottomBar from "./components/BottomBar";
import { FlipCard } from "./components/FlipCard";
import { SubsetSelector } from "./components/SubsetSelector";
import { shuffle, normalizeJson } from "./utils/helpers";
import { DEMO_FLASHCARDS } from "./utils/constants";
import {
  saveDeck,
  loadDeck,
  saveProgress,
  loadProgress,
  generateDeckId,
} from "./utils/firebase";

// --- Helpers ---
const uuid = (() => {
  let c = 0;
  return () => `${Date.now()}_${c++}`;
})();

export default function FlashcardsApp() {
  // Data
  const [allCards, setAllCards] = useState(DEMO_FLASHCARDS);
  const [studyPool, setStudyPool] = useState(DEMO_FLASHCARDS);
  const [currentDeckId, setCurrentDeckId] = useState(null); // Track which deck is being studied

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

  const handleAnswer = useCallback(
    (correct) => {
      if (finished) return;
      const id = studyPool[idx]?.id;
      if (!id) return;

      let updatedCorrectIds = correctIds;
      let updatedWrongIds = wrongIds;

      if (correct) {
        updatedCorrectIds = correctIds.includes(id)
          ? correctIds
          : [...correctIds, id];
        setCorrectIds(updatedCorrectIds);
      } else {
        updatedWrongIds = wrongIds.includes(id) ? wrongIds : [...wrongIds, id];
        setWrongIds(updatedWrongIds);
      }

      // Save progress to localStorage (and eventually sync to Firebase if deckId exists)
      if (currentDeckId) {
        saveProgress(currentDeckId, updatedCorrectIds, updatedWrongIds);
      }

      setIdx((i) => i + 1);
      setShowBack(false);
    },
    [finished, studyPool, idx, correctIds, wrongIds, currentDeckId]
  );

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
  }, [tab, isRunning, handleAnswer]);

  // Selection (segregacja)
  const [selection, setSelection] = useState({}); // id -> boolean
  const selectedCount = useMemo(
    () => Object.values(selection).filter(Boolean).length,
    [selection]
  );

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
      const deckId = generateDeckId();

      // Save to Firebase
      try {
        await saveDeck(
          deckId,
          withIds,
          `Uploaded Deck ${new Date().toLocaleDateString()}`
        );
        console.log("Deck saved to Firebase with ID:", deckId);
      } catch (error) {
        console.error("Failed to save deck to Firebase:", error);
      }

      setCurrentDeckId(deckId);
      setAllCards(withIds);
      startWith(withIds);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 pb-24 sm:pb-6 relative">
      <div className="mx-auto max-w-5xl absolute left-6 right-6 bottom-24 sm:static">
        {/* top area: hidden on small screens — moved to BottomBar on mobile */}
        <div className="hidden sm:block">
          <Header
            onUploadFiles={onUploadFiles}
            onLoadDemo={() => {
              const withIds = DEMO_FLASHCARDS.map((c) => ({
                ...c,
                id: uuid(),
              }));
              setAllCards(withIds);
              startWith(withIds);
            }}
          />

          <Stats
            correctCount={correctIds.length}
            wrongCount={wrongIds.length}
            progress={progress}
            isRunning={isRunning}
            onToggleRunning={() => setIsRunning((s) => !s)}
            onReset={resetAll}
            totalCards={allCards.length}
            poolSize={studyPool.length}
          />

          <TabSelector currentTab={tab} onTabChange={setTab} />
        </div>

        {/* Floating mobile bottom bar (visible below sm) */}
        <BottomBar
          currentTab={tab}
          onTabChange={setTab}
          onUploadFiles={onUploadFiles}
          isRunning={isRunning}
          onToggleRunning={() => setIsRunning((s) => !s)}
          onReset={resetAll}
          onLoadDemo={() => {
            const withIds = DEMO_FLASHCARDS.map((c) => ({ ...c, id: uuid() }));
            setAllCards(withIds);
            startWith(withIds);
          }}
          onContinueWithWrongs={continueWithWrongs}
          wrongCount={wrongIds.length}
        />

        {/* Learn Tab */}
        {tab === "learn" && (
          <div className="mt-6">
            {!finished ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                {/* Card */}

                <FlipCard
                  term={current?.term}
                  definition={current?.definition}
                  showBack={showBack}
                  onFlip={(maybeBool) => {
                    if (typeof maybeBool === "boolean") handleAnswer(maybeBool);
                    else setShowBack((s) => !s);
                  }}
                  currentIndex={idx}
                  totalCards={studyPool.length}
                />
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
          <SubsetSelector
            cards={allCards}
            selection={selection}
            onSelectionChange={(id, value) =>
              setSelection((s) => ({ ...s, [id]: value }))
            }
            onClearSelection={() => setSelection({})}
            onSelectAll={() =>
              setSelection(
                Object.fromEntries(allCards.map((c) => [c.id, true]))
              )
            }
            onStartSelected={() => {
              const chosen = allCards.filter((c) => selection[c.id]);
              if (chosen.length > 0) startWith(chosen);
            }}
            selectedCount={selectedCount}
            onQuickFocus={() => {
              const top5 = Object.fromEntries(
                allCards.slice(0, 5).map((c) => [c.id, true])
              );
              setSelection(top5);
            }}
          />
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          Made with ❤️ — tryb demo działa bez pliku JSON
        </div>
      </div>
    </div>
  );
}
