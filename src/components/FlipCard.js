import React from "react";

export function FlipCard({
  term,
  definition,
  showBack,
  onFlip,
  currentIndex,
  totalCards,
}) {
  return (
    <div className="rounded-2xl shadow-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4 text-sm text-slate-500 dark:text-slate-400">
        <div>
          {currentIndex + 1} / {totalCards}
        </div>
        <div>Kliknij kartę lub wciśnij Spację</div>
      </div>

      <div style={{ perspective: "1000px" }}>
        <div
          onClick={onFlip}
          className="relative h-56 md:h-64 cursor-pointer select-none"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)",
            transform: `rotateY(${showBack ? 180 : 0}deg)`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold [backface-visibility:hidden] text-slate-900 dark:text-white">
            {term}
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center text-2xl font-medium [backface-visibility:hidden] text-slate-900 dark:text-white"
            style={{ transform: "rotateY(180deg)" }}
          >
            {definition || (
              <span className="text-slate-400 dark:text-slate-500">
                (brak tłumaczenia)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => onFlip(false)}
          className="px-4 py-3 rounded-xl bg-red-500 dark:bg-red-600 text-white font-medium hover:bg-red-600 dark:hover:bg-red-700"
        >
          Źle (J/←)
        </button>
        <button
          onClick={() => onFlip(true)}
          className="px-4 py-3 rounded-xl bg-green-600 dark:bg-green-700 text-white font-medium hover:bg-green-700 dark:hover:bg-green-800"
        >
          Dobrze (K/→)
        </button>
      </div>
    </div>
  );
}
