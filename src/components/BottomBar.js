import React, { useState, useRef } from "react";
import { Upload, Menu } from "lucide-react";

export default function BottomBar({
  currentTab,
  onTabChange,
  onUploadFiles,
  isRunning,
  onToggleRunning,
  onReset,
  onLoadDemo,
  onContinueWithWrongs,
  wrongCount,
  savedDecks = [],
  onLoadDeck,
  currentDeckId,
  startWithBack,
  onToggleStartWithBack,
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  return (
    <div className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-lg p-2 flex items-center justify-between z-50">
      {/* Section 1: Upload */}
      <div className="flex-1 flex items-center justify-start">
        <button
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={() => inputRef.current?.click()}
          aria-label="Upload JSON"
        >
          <Upload className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          multiple
          onChange={(e) => onUploadFiles?.(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Section 2: Tabs / navigation */}
      <div className="flex-1 flex items-center justify-center">
        <div className="inline-flex rounded-full bg-slate-100 dark:bg-slate-700 p-1">
          <button
            className={`px-3 py-2 rounded-full text-sm ${
              currentTab === "learn"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-700 dark:text-slate-300"
            }`}
            onClick={() => onTabChange?.("learn")}
          >
            Nauka
          </button>
          <button
            className={`px-3 py-2 rounded-full text-sm ${
              currentTab === "subset"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-700 dark:text-slate-300"
            }`}
            onClick={() => onTabChange?.("subset")}
          >
            Podzbiory
          </button>
        </div>
      </div>

      {/* Section 3: Menu */}
      <div className="flex-1 flex items-center justify-end relative">
        <button
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={() => setOpen((s) => !s)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
        </button>

        {open && (
          <div className="absolute bottom-full right-0 mb-3 w-56 bg-white dark:bg-slate-700 rounded-lg shadow-lg border dark:border-slate-600 p-3">
            <div className="flex flex-col gap-2">
              <button
                className="text-left px-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-white"
                onClick={() => {
                  onToggleRunning?.();
                  setOpen(false);
                }}
              >
                {isRunning ? "Pauza" : "Start"}
              </button>
              <button
                className="text-left px-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-white"
                onClick={() => {
                  onReset?.();
                  setOpen(false);
                }}
              >
                Reset
              </button>
              <button
                className="text-left px-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-white"
                onClick={() => {
                  onLoadDemo?.();
                  setOpen(false);
                }}
              >
                Załaduj DEMO
              </button>
              <button
                className="text-left px-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-white"
                onClick={() => {
                  onToggleStartWithBack?.();
                  setOpen(false);
                }}
              >
                {startWithBack
                  ? "Pokazuj przód na start"
                  : "Pokazuj tył na start"}
              </button>
              <button
                disabled={!wrongCount}
                className={`text-left px-2 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-white ${
                  !wrongCount ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (!wrongCount) return;
                  onContinueWithWrongs?.();
                  setOpen(false);
                }}
              >
                Tylko błędne ({wrongCount})
              </button>

              {/* Saved Decks Section */}
              {savedDecks && savedDecks.length > 0 && (
                <>
                  <div className="my-1 border-t dark:border-slate-600 pt-2">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Zapisane zestawy
                    </div>
                    <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                      {savedDecks.map((deck) => (
                        <button
                          key={deck.id}
                          className={`text-left px-2 py-1 text-sm rounded ${
                            currentDeckId === deck.id
                              ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                              : "hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-white"
                          }`}
                          onClick={() => {
                            onLoadDeck?.(deck.id);
                            setOpen(false);
                          }}
                        >
                          <span className="block truncate">{deck.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {deck.cards?.length || 0} kart
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
