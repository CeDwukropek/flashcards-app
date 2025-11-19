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
  saveProgress,
  generateDeckId,
  getAllDecks,
  loadDeck,
  saveSession,
  loadSession,
  clearSession,
  saveSubsetSelection,
  loadSubsetSelection,
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
  const [savedDecks, setSavedDecks] = useState([]); // List of decks from Firebase
  const [isLoadingDeck, setIsLoadingDeck] = useState(false); // Loading state for deck

  // UI Theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

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

  // Load saved decks from Firebase on mount
  useEffect(() => {
    async function loadSavedDecks() {
      try {
        const decks = await getAllDecks();
        setSavedDecks(decks);
      } catch (error) {
        console.error("Failed to load decks:", error);
      }
    }
    loadSavedDecks();
  }, []);

  // Restore session on mount
  useEffect(() => {
    const session = loadSession();
    if (session && session.deckId) {
      // Try to restore the previous session
      async function restoreSession() {
        try {
          setIsLoadingDeck(true);
          const deck = await loadDeck(session.deckId);
          if (deck && deck.cards) {
            setCurrentDeckId(session.deckId);
            setAllCards(deck.cards);
            setStudyPool(shuffle(deck.cards, session.idx || 0)); // Use seed for consistency
            setIdx(session.idx || 0);
            setCorrectIds(session.correctIds || []);
            setWrongIds(session.wrongIds || []);
            setIsRunning(true);
            setTab("learn");
            console.log("Session restored:", session.deckId);
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          // Clear invalid session
          clearSession();
        } finally {
          setIsLoadingDeck(false);
        }
      }
      restoreSession();
    }
  }, []); // Only run on mount

  // Selection (segregaja)
  const [selection, setSelection] = useState(() => {
    // Try to load saved subset selection on mount
    const lastDeckId = loadSession()?.deckId;
    if (lastDeckId) {
      return loadSubsetSelection(lastDeckId);
    }
    return {};
  }); // id -> boolean
  const selectedCount = useMemo(
    () => Object.values(selection).filter(Boolean).length,
    [selection]
  );

  // Auto-save subset selection when it changes
  useEffect(() => {
    if (currentDeckId && Object.keys(selection).length > 0) {
      saveSubsetSelection(currentDeckId, selection);
    }
  }, [selection, currentDeckId]);

  // Auto-save session when progress changes
  useEffect(() => {
    if (currentDeckId) {
      saveSession(currentDeckId, idx, correctIds, wrongIds);
    }
  }, [idx, correctIds, wrongIds, currentDeckId]);

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

  function continueWithSelected() {
    const selectedCards = allCards.filter((c) => selection[c.id]);
    if (selectedCards.length === 0) return;
    startWith(selectedCards);
  }

  async function onUploadFiles(files) {
    if (!files || !files.length) return;
    const contents = [];

    // Derive a suggested name from the first file's JSON (name/title/deckName)
    // or the filename when a single file is uploaded.
    let suggestedName = undefined;

    for (const f of Array.from(files)) {
      const text = await f.text();
      try {
        const parsed = JSON.parse(text);
        contents.push(...normalizeJson(parsed));

        if (!suggestedName && parsed && typeof parsed === "object") {
          if (parsed.name) suggestedName = parsed.name;
          else if (parsed.title) suggestedName = parsed.title;
          else if (parsed.deckName) suggestedName = parsed.deckName;
        }

        if (!suggestedName && files.length === 1) {
          suggestedName = f.name.replace(/\.[^/.]+$/, "");
        }
      } catch (e) {
        console.error("Invalid JSON in", f.name, e);
      }
    }

    if (!contents.length) return;

    // Attach stable ids
    const withIds = contents.map((c) => ({ ...c, id: uuid() }));

    if (!suggestedName)
      suggestedName = `Uploaded Deck ${new Date().toLocaleDateString()}`;

    const deckId = generateDeckId();
    try {
      await saveDeck(deckId, withIds, suggestedName);
      // Refresh saved decks list
      const decks = await getAllDecks();
      setSavedDecks(decks);
    } catch (error) {
      console.error("Failed to save deck to Firebase:", error);
    }

    setCurrentDeckId(deckId);
    setAllCards(withIds);
    // Clear selection for new deck
    setSelection({});
    startWith(withIds);
  }

  async function loadSavedDeck(deckId) {
    try {
      setIsLoadingDeck(true);
      const deck = await loadDeck(deckId);
      if (deck && deck.cards) {
        setCurrentDeckId(deckId);
        setAllCards(deck.cards);
        // Clear selection when loading a new deck
        setSelection({});
        // Load saved subset selection for this deck
        const savedSelection = loadSubsetSelection(deckId);
        if (Object.keys(savedSelection).length > 0) {
          setSelection(savedSelection);
        }
        startWith(deck.cards);
      }
    } catch (error) {
      console.error("Failed to load deck:", error);
      alert("Could not load deck. Please try again.");
    } finally {
      setIsLoadingDeck(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 pb-24 sm:pb-6 relative flex justify-end">
      <div className="mx-auto max-w-5xl left-6 right-6 bottom-24 sm:static flex justify-end flex-col">
        {/* top area: hidden on small screens — moved to BottomBar on mobile */}
        <div className="hidden sm:block">
          <Header
            onUploadFiles={onUploadFiles}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
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
          savedDecks={savedDecks}
          onLoadDeck={loadSavedDeck}
          currentDeckId={currentDeckId}
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
                  isLoading={isLoadingDeck}
                />
              </div>
            ) : (
              <div className="mt-6">
                <div className="rounded-2xl shadow-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-6">
                  <h2 className="text-xl font-semibold dark:text-white">
                    Koniec rundy
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Wynik: <strong>{correctIds.length}</strong> dobrze,{" "}
                    <strong>{wrongIds.length}</strong> źle.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={resetAll}
                      className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                      Zacznij od nowa (cały zestaw)
                    </button>
                    {wrongIds.length > 0 && (
                      <button
                        onClick={continueWithWrongs}
                        className="px-4 py-2 rounded-xl bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
                      >
                        Kontynuuj naukę (tylko błędne - {wrongIds.length})
                      </button>
                    )}
                    {selectedCount > 0 && (
                      <button
                        onClick={continueWithSelected}
                        className="px-4 py-2 rounded-xl bg-purple-600 dark:bg-purple-700 text-white hover:bg-purple-700 dark:hover:bg-purple-800"
                      >
                        Nauka (wybrane - {selectedCount})
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
        <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          Made with ❤️ — tryb demo działa bez pliku JSON
        </div>
      </div>
    </div>
  );
}
