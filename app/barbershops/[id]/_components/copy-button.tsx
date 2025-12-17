"use client";

import React from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      // show sonner toast if available, otherwise local feedback
      try {
        const mod = await import("sonner");
        mod.toast?.success?.("Copiado");
      } catch (e) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
      aria-label="Copiar telefone"
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}
