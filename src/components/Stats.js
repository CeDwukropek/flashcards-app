import React from "react";

export function Stats({
  correctCount,
  wrongCount,
  progress,
  isRunning,
  onToggleRunning,
  onReset,
  totalCards,
  poolSize,
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-2">
        <span className="rounded-2xl px-3 py-1 bg-green-100 dark:bg-green-900 dark:text-green-100">
          Dobrze: {correctCount}
        </span>
        <span className="rounded-2xl px-3 py-1 bg-red-100 dark:bg-red-900 dark:text-red-100">
          Źle: {wrongCount}
        </span>
        <span className="rounded-2xl px-3 py-1 bg-slate-100 dark:bg-slate-700 dark:text-white">
          Postęp: {progress}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleRunning}
          className="px-3 py-2 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          {isRunning ? "Pauza" : "Start"}
        </button>
        <button
          onClick={onReset}
          className="px-3 py-2 rounded border bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Reset
        </button>
      </div>
      <div className="flex items-center gap-2 justify-start sm:justify-end">
        <span className="rounded-2xl px-3 py-1 bg-slate-100 dark:bg-slate-700 dark:text-white">
          Karty: {poolSize}
        </span>
        <span className="rounded-2xl px-3 py-1 bg-slate-100 dark:bg-slate-700 dark:text-white">
          Zestaw: {totalCards}
        </span>
      </div>
    </div>
  );
}
