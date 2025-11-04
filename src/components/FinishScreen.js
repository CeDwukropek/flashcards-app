import React from "react";
import { RotateCcw, Play } from "lucide-react";

export function FinishScreen({
  correctCount,
  wrongCount,
  onReset,
  onContinueWithWrongs,
}) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">Koniec rundy</h2>
      <p className="text-slate-600 mb-4">
        Wynik: {correctCount} dobrze, {wrongCount} źle.
      </p>
      <button onClick={onReset} className="px-4 py-2 bg-gray-200 rounded mr-2">
        <RotateCcw className="inline h-4 w-4 mr-1" />
        Od nowa
      </button>
      {wrongCount > 0 && wrongCount <= 10 && (
        <button
          onClick={onContinueWithWrongs}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          <Play className="inline h-4 w-4 mr-1" />
          Tylko błędne
        </button>
      )}
    </div>
  );
}
