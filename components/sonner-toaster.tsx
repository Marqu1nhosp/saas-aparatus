"use client";

import React from "react";

export default function SonnerToaster() {
  const [ToasterComp, setToasterComp] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    let mounted = true;
    import("sonner")
      .then((mod) => {
        if (mounted && mod?.Toaster) setToasterComp(() => mod.Toaster);
      })
      .catch(() => {
        // sonner not available — silently ignore
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ToasterComp) return null;

  const Toaster = ToasterComp;
  return <Toaster />;
}
