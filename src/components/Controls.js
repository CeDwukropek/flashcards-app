import React from "react";
import { X, Check } from "lucide-react";

export function Controls({ onCorrect, onWrong }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <button
        onClick={onWrong}
        className="px-4 py-2 bg-red-500 text-white rounded flex items-center justify-center gap-2"
      >
        <X className="h-5 w-5" />
        Źle
      </button>
      <button
        onClick={onCorrect}
        className="px-4 py-2 bg-green-500 text-white rounded flex items-center justify-center gap-2"
      >
        <Check className="h-5 w-5" />
        Dobrze
      </button>
    </div>
  );
}
