import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { waLink } from "@/lib/aashaData";

const links = [
  { href: "#products", label: "Products" },
  { href: "#youtube", label: "Videos" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-primary/15 backdrop-blur-md transition-colors ${
        scrolled ? "bg-background/95" : "bg-background/80"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="#hero" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md gradient-gold font-display text-lg font-bold text-primary-foreground shadow-gold">
            A
          </span>
          <span className="text-sm font-medium tracking-wide text-foreground">
            AASHA <strong className="text-primary">TEXTILE</strong>
          </span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-whatsapp px-4 text-sm font-semibold text-whatsapp-foreground transition-transform active:scale-95"
          >
            <span aria-hidden>📲</span> Order
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-md border border-primary/20 text-foreground md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-primary/15 bg-background/98 md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm text-foreground/90"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};
