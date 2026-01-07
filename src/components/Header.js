import React from "react";
import { Moon, Sun } from "lucide-react";

export function Header({
  onUploadFiles,
  onLoadDemo,
  isDarkMode,
  onToggleDarkMode,
  savedDecks = [],
  onLoadDeck,
  currentDeckId,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">
          EN Flashcards
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Wybierz zestaw (JSON) i ucz się fiszkami. Spacja — odwróć, J/← źle,
          K/→ dobrze.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <label className="inline-flex items-center gap-2 text-sm">
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
            className="px-3 py-2 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-200"
          >
            Wgraj / wybierz JSON
          </label>
        </label>

        {savedDecks.length > 0 && (
          <select
            value={currentDeckId || ""}
            onChange={(e) => {
              const deckId = e.target.value;
              if (deckId) onLoadDeck?.(deckId);
            }}
            className="px-3 py-2 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white hover:border-slate-400 dark:hover:border-slate-500"
          >
            <option value="">Zapisane zestawy</option>
            {savedDecks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name} ({deck.cards?.length || 0})
              </option>
            ))}
          </select>
        )}
        <button
          className="px-3 py-2 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
          onClick={onLoadDemo}
        >
          Załaduj DEMO
        </button>
        <button
          className="p-2 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
          onClick={onToggleDarkMode}
          title={isDarkMode ? "Light mode" : "Dark mode"}
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
