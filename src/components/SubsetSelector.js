import React from "react";

export function SubsetSelector({
  cards,
  selection,
  onSelectionChange,
  onClearSelection,
  onSelectAll,
  onStartSelected,
  selectedCount,
  onQuickFocus,
}) {
  return (
    <div className="mt-6">
      <div className="rounded-2xl shadow-md border bg-white p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            className="px-3 py-2 rounded border bg-white hover:bg-slate-50"
            onClick={onClearSelection}
          >
            Wyczyść wybór
          </button>
          <button
            className="px-3 py-2 rounded border bg-white hover:bg-slate-50"
            onClick={onSelectAll}
          >
            Zaznacz wszystko
          </button>
          <button
            className="px-3 py-2 rounded bg-slate-900 text-white"
            onClick={onStartSelected}
          >
            Start z zaznaczonych ({selectedCount})
          </button>
          <button
            className="px-3 py-2 rounded border bg-white hover:bg-slate-50"
            onClick={onQuickFocus}
          >
            Szybki fokus: 5 pierwszych
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-auto pr-1">
          {cards.map((c, i) => (
            <label
              key={c.id}
              className="flex items-start gap-3 rounded-xl border p-3 hover:shadow-sm"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={!!selection[c.id]}
                onChange={(e) => onSelectionChange(c.id, e.target.checked)}
              />
              <div>
                <div className="font-medium">
                  {c.term}{" "}
                  <span className="text-slate-400 text-sm">#{i + 1}</span>
                </div>
                <div className="text-slate-600">
                  {c.definition || (
                    <span className="text-slate-400">(brak tłumaczenia)</span>
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
  );
}
