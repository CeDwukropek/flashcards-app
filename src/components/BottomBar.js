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
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  return (
    <div className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-2 flex items-center justify-between z-50">
      {/* Section 1: Upload */}
      <div className="flex-1 flex items-center justify-start">
        <button
          className="p-2 rounded-md hover:bg-slate-100"
          onClick={() => inputRef.current?.click()}
          aria-label="Upload JSON"
        >
          <Upload className="h-5 w-5 text-slate-700" />
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
        <div className="inline-flex rounded-full bg-slate-100 p-1">
          <button
            className={`px-3 py-2 rounded-full text-sm ${
              currentTab === "learn"
                ? "bg-slate-900 text-white"
                : "text-slate-700"
            }`}
            onClick={() => onTabChange?.("learn")}
          >
            Nauka
          </button>
          <button
            className={`px-3 py-2 rounded-full text-sm ${
              currentTab === "subset"
                ? "bg-slate-900 text-white"
                : "text-slate-700"
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
          className="p-2 rounded-md hover:bg-slate-100"
          onClick={() => setOpen((s) => !s)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </button>

        {open && (
          <div className="absolute bottom-full right-0 mb-3 w-56 bg-white rounded-lg shadow-lg border p-3">
            <div className="flex flex-col gap-2">
              <button
                className="text-left px-2 py-2 rounded hover:bg-slate-50"
                onClick={() => {
                  onToggleRunning?.();
                  setOpen(false);
                }}
              >
                {isRunning ? "Pauza" : "Start"}
              </button>
              <button
                className="text-left px-2 py-2 rounded hover:bg-slate-50"
                onClick={() => {
                  onReset?.();
                  setOpen(false);
                }}
              >
                Reset
              </button>
              <button
                className="text-left px-2 py-2 rounded hover:bg-slate-50"
                onClick={() => {
                  onLoadDemo?.();
                  setOpen(false);
                }}
              >
                Załaduj DEMO
              </button>
              <button
                disabled={!wrongCount}
                className={`text-left px-2 py-2 rounded hover:bg-slate-50 ${
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
