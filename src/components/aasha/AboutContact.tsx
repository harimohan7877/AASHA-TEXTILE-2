import { Instagram, Facebook, Youtube, MapPin, Phone } from "lucide-react";
import owner from "@/assets/owner.jpg";
import { waLink } from "@/lib/aashaData";

export const About = () => (
  <section id="about" className="border-b border-primary/15 py-12 md:py-20">
    <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-maroon blur-2xl opacity-40" />
          <img
            src={owner}
            alt="Devkishan Sharma — Aasha Textile owner"
            className="relative h-40 w-40 rounded-full border-4 border-primary object-cover shadow-elevated md:h-48 md:w-48"
          />
        </div>
        <div className="mt-5">
          <div className="text-xs uppercase tracking-wider text-primary">Founder</div>
          <h3 className="font-display text-2xl font-bold text-foreground">Devkishan Sharma</h3>
          <p className="font-deva mt-1 text-sm text-muted-foreground">
            Aasha Textile, Surat • 10+ साल का अनुभव
          </p>
        </div>
      </div>

      <div>
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          हमारे बारे में
        </h2>
        <p className="font-deva mt-4 text-sm leading-relaxed text-foreground/85 md:text-base">
          <strong>Aasha Textile</strong> Surat का एक भरोसेमंद cut-piece fabric wholesaler है।
          हम छोटे retailers, बुटीक मालिकों और tailor shops को सीधे mill rate पर premium
          quality कपड़ा पहुँचाते हैं — Cambric Cotton, Rayon, Silk, Satin, Readymade Kurti
          और बहुत कुछ।
        </p>
        <p className="font-deva mt-3 text-sm leading-relaxed text-foreground/85 md:text-base">
          हर दिन नया स्टॉक, transparent pricing, और WhatsApp पर सीधी बात — यही हमारी पहचान है।
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="pill border border-primary/20 bg-card text-muted-foreground">✓ GST Registered</span>
          <span className="pill border border-primary/20 bg-card text-muted-foreground">✓ Pan-India Shipping</span>
          <span className="pill border border-primary/20 bg-card text-muted-foreground">✓ COD Available</span>
        </div>
      </div>
    </div>
  </section>
);

export const Contact = () => (
  <section id="contact" className="border-b border-primary/15 py-12 md:py-20">
    <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2">
      <div className="rounded-2xl border border-primary/20 bg-card p-6 md:p-8">
        <h3 className="font-display text-xl font-bold text-foreground">Visit Our Shop</h3>
        <div className="mt-4 flex items-start gap-3 text-sm text-foreground/85">
          <MapPin className="mt-0.5 shrink-0 text-primary" size={18} />
          <div>
            <p className="font-deva">
              Aasha Textile, Ring Road,
              <br />
              Surat, Gujarat 395002
            </p>
            <a
              href="https://maps.google.com/?q=Ring+Road+Surat+Textile+Market"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              View on Google Maps →
            </a>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 text-sm text-foreground/85">
          <Phone className="shrink-0 text-primary" size={18} />
          <a href="tel:+917043830602" className="font-mono">+91 70438 30602</a>
        </div>

        {/* Business credentials */}
        <div className="mt-5 grid gap-2 rounded-xl border border-primary/10 bg-background/40 p-3 text-[12px]">
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground/80">GSTIN</span>
            <span className="font-mono text-foreground/90">24XXXXXXXXXXX</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground/80 font-deva">कारोबार के घंटे</span>
            <span className="text-foreground/90">सोम–शनि • 10 AM – 8 PM</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground/80 font-deva">Payment</span>
            <span className="text-foreground/90 text-right">UPI • NEFT/RTGS<br/>Cash • COD उपलब्ध</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground/80 font-deva">शिपिंग</span>
            <span className="text-foreground/90">Pan-India • Transport/Courier</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card p-6 md:p-8">
        <h3 className="font-display text-xl font-bold text-foreground">Connect</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Follow daily stock updates and reels.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-whatsapp px-4 text-sm font-semibold text-whatsapp-foreground"
          >
            📲 WhatsApp
          </a>
          <a
            href="https://youtube.com/@aasarextile"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#FF0000] px-4 text-sm font-semibold text-white"
          >
            <Youtube size={16} /> YouTube
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-primary/30 bg-background px-4 text-sm font-semibold text-foreground"
          >
            <Instagram size={16} /> Instagram
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-primary/30 bg-background px-4 text-sm font-semibold text-foreground"
          >
            <Facebook size={16} /> Facebook
          </a>
        </div>
      </div>
    </div>
  </section>
);
