import React from "react";
import { LaTeXText } from "./LaTeXText";

export function FlipCard({
  term,
  definition,
  onFlip,
  currentIndex,
  totalCards,
  isLoading = false,
  showBack,
  shouldAnimateFlip = true,
}) {
  console.log("FlipCard rendered:", { term, definition, showBack });
  console.log(
    "Card should show:",
    showBack ? "BACK (definition)" : "FRONT (term)"
  );
  return (
    <div className="rounded-2xl shadow-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-6 flex flex-col flex-grow">
      <div className="flex items-center justify-between mb-4 text-sm text-slate-500 dark:text-slate-400">
        <div>{isLoading ? "..." : `${currentIndex + 1} / ${totalCards}`}</div>
        <div>
          {isLoading ? "Ładowanie..." : "Kliknij kartę lub wciśnij Spację"}
        </div>
      </div>

      <div style={{ perspective: "1000px" }} className="flex-grow flex">
        {isLoading ? (
          // Loading skeleton
          <div className="w-full flex-grow bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 dark:border-slate-500"></div>
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Wczytywanie karty...
              </p>
            </div>
          </div>
        ) : (
          <div
            onClick={onFlip}
            className="relative w-full h-full flex-grow cursor-pointer select-none rounded-lg"
            style={{
              transformStyle: "preserve-3d",
              transition: shouldAnimateFlip
                ? "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
              transform: `rotateY(${showBack ? 180 : 0}deg)`,
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-slate-900 dark:text-white p-8 text-center overflow-auto break-words"
              style={{
                backfaceVisibility: "hidden",
              }}
              key={`front-${currentIndex}`}
            >
              <LaTeXText key={`latex-front-${currentIndex}`}>{term}</LaTeXText>
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center text-lg font-medium text-slate-900 dark:text-white p-8 text-center overflow-auto break-words"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              key={`back-${currentIndex}`}
            >
              {definition ? (
                <LaTeXText key={`latex-back-${currentIndex}`}>
                  {definition}
                </LaTeXText>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">
                  (brak tłumaczenia)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => onFlip(false)}
          disabled={isLoading}
          className="px-4 py-3 rounded-xl bg-red-500 dark:bg-red-600 text-white font-medium hover:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Źle (J/←)
        </button>
        <button
          onClick={() => onFlip(true)}
          disabled={isLoading}
          className="px-4 py-3 rounded-xl bg-green-600 dark:bg-green-700 text-white font-medium hover:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dobrze (K/→)
        </button>
      </div>
    </div>
  );
}
