import React from "react";

export function TabSelector({ currentTab, onTabChange }) {
  return (
    <div className="mt-4">
      <div className="inline-flex rounded-xl border bg-white p-1">
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "learn"
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          onClick={() => onTabChange("learn")}
        >
          Nauka
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "subset"
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          onClick={() => onTabChange("subset")}
        >
          Podzbiory
        </button>
      </div>
    </div>
  );
}
