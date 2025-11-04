import React from "react";
import { motion } from "framer-motion";

export function Flashcard({ term, definition, showBack, onFlip }) {
  return (
    <div style={{ perspective: "1000px" }}>
      <motion.div
        onClick={onFlip}
        className="relative h-56 w-80 cursor-pointer select-none border rounded-2xl shadow-md bg-white"
        initial={false}
        animate={{ rotateY: showBack ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold [backface-visibility:hidden]">
          {term}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center text-2xl font-medium [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          {definition || (
            <span className="text-slate-400">(brak tłumaczenia)</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
