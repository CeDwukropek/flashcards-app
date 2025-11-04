import React from "react";

export function Header({ onUploadFiles, onLoadDemo }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">EN Flashcards</h1>
        <p className="text-slate-600">
          Wybierz zestaw (JSON) i ucz się fiszkami. Spacja — odwróć, J/← źle,
          K/→ dobrze.
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
          onClick={onLoadDemo}
        >
          Załaduj DEMO
        </button>
      </div>
    </div>
  );
}
