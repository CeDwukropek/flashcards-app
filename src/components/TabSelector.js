import React from "react";

export function TabSelector({ currentTab, onTabChange }) {
  return (
    <div className="mt-4">
      <div className="inline-flex rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-1">
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "learn"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
          onClick={() => onTabChange("learn")}
        >
          Nauka
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "subset"
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
          onClick={() => onTabChange("subset")}
        >
          Podzbiory
        </button>
      </div>
    </div>
  );
}
