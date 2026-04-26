import { waLink } from "@/lib/aashaData";

export const FloatingWhatsApp = () => (
  <a
    href={waLink("नमस्ते, मुझे आपके fabrics के बारे में जानकारी चाहिए")}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="WhatsApp Order"
    className="fixed bottom-20 right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-bold text-whatsapp-foreground animate-wa-pulse md:bottom-6"
  >
    <span aria-hidden className="text-base">📲</span>
    <span>WhatsApp Order</span>
  </a>
);
