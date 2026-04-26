import { useEffect, useState } from "react";

export const Preloader = () => {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={hidden}
    >
      <div className="font-display text-3xl font-bold tracking-wide text-primary md:text-5xl">
        AASHA TEXTILE
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Surat • Wholesale Fabrics
      </p>
      <div className="mt-6 h-[2px] w-48 overflow-hidden rounded-full bg-primary/15">
        <div className="h-full w-full origin-left animate-loader-fill bg-gradient-to-r from-primary-dark via-primary to-primary-glow" />
      </div>
    </div>
  );
};
