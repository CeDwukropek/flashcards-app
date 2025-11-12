import React from "react";
import { Moon, Sun } from "lucide-react";

export function Header({
  onUploadFiles,
  onLoadDemo,
  isDarkMode,
  onToggleDarkMode,
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
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 dark:text-white">
            Wgraj JSON
          </span>
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
            className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-700 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            Wybierz pliki
          </label>
        </label>
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
