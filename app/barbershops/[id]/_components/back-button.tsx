"use client";

import React from "react";

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      aria-label="Voltar"
      className="absolute left-4 top-4 inline-flex items-center justify-center h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
    >
      ←
    </button>
  );
}
