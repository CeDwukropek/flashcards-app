import React from "react";

export function Progress({ correct, wrong, progress }) {
  return (
    <div className="flex gap-3 mb-4">
      <span className="px-3 py-1 bg-green-100 rounded">Dobrze: {correct}</span>
      <span className="px-3 py-1 bg-red-100 rounded">Źle: {wrong}</span>
      <span className="px-3 py-1 bg-gray-100 rounded">Postęp: {progress}%</span>
    </div>
  );
}
