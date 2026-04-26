export const Footer = () => (
  <footer className="bg-[hsl(30_38%_4%)] py-10">
    <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md gradient-gold font-display text-lg font-bold text-primary-foreground">
            A
          </span>
          <span className="text-base font-semibold text-foreground">
            AASHA <strong className="text-primary">TEXTILE</strong>
          </span>
        </div>
        <p className="font-deva mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
          Surat का भरोसेमंद कट-पीस कपड़ा wholesaler — हर दिन नया स्टॉक, बेहतरीन रेट।
        </p>

        <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
          <div>
            <span className="text-muted-foreground/60">GSTIN: </span>
            <span className="font-mono text-foreground/80">24XXXXXXXXXXX</span>
            <span className="ml-1 text-muted-foreground/50">(update soon)</span>
          </div>
          <div className="font-deva">
            Aasha Textile, Ring Road, Surat, Gujarat 395002
          </div>
          <div>
            Proprietor: <span className="text-foreground/80">Devkishan Sharma</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Quick Links</h4>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li><a href="#products" className="hover:text-primary">Products</a></li>
          <li><a href="#youtube" className="hover:text-primary">Videos</a></li>
          <li><a href="#about" className="hover:text-primary">About</a></li>
          <li><a href="#contact" className="hover:text-primary">Contact</a></li>
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Connect</h4>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li><a href="https://wa.me/917043830602" target="_blank" rel="noopener noreferrer" className="hover:text-primary">WhatsApp</a></li>
          <li><a href="https://youtube.com/@aasarextile" target="_blank" rel="noopener noreferrer" className="hover:text-primary">YouTube</a></li>
          <li><a href="tel:+917043830602" className="hover:text-primary">+91 70438 30602</a></li>
        </ul>
        <div className="font-deva mt-4 text-[10.5px] text-muted-foreground/80">
          🕙 सोम–शनि • 10 AM – 8 PM
        </div>
      </div>
    </div>

    <div className="mx-auto mt-10 max-w-6xl border-t border-primary/10 px-4 pt-5 text-center text-[11px] text-muted-foreground">
      © {new Date().getFullYear()} Aasha Textile. All rights reserved. • Made in Surat 🇮🇳
    </div>
  </footer>
);
