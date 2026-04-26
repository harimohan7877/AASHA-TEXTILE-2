const testimonials = [
  {
    name: "Ramesh Bhai",
    place: "Jaipur, Rajasthan",
    rating: 5,
    text: "1 साल से माल ले रहा हूँ। रेट और quality दोनों best हैं। समय पर delivery।",
  },
  {
    name: "Pooja Boutique",
    place: "Ahmedabad, Gujarat",
    rating: 5,
    text: "हर हफ्ते नया स्टॉक मिलता है। WhatsApp पर तुरंत reply और भरोसेमंद packing।",
  },
  {
    name: "Suresh Kumar",
    place: "Udaipur, Rajasthan",
    rating: 4,
    text: "Cambric cotton और rayon मेरे shop का best seller बन गया। Devkishan जी का behaviour बहुत अच्छा।",
  },
];

const Stars = ({ n }: { n: number }) => (
  <div className="flex gap-1" aria-label={`${n} of 5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`h-2 w-2 rounded-full ${i < n ? "bg-saffron" : "bg-muted"}`}
      />
    ))}
  </div>
);

export const Testimonials = () => (
  <section className="border-b border-primary/15 py-10 md:py-16">
    <div className="mx-auto max-w-6xl px-4">
      <h2 className="font-display text-2xl font-bold text-foreground md:text-4xl">
        Buyers की राय
      </h2>
      <p className="mt-1 text-xs text-muted-foreground md:text-sm">
        Trusted by retailers across Gujarat & Rajasthan
      </p>

      <div className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {testimonials.map((t) => (
          <article
            key={t.name}
            className="relative w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 md:w-auto"
          >
            <span className="font-display pointer-events-none absolute -right-2 -top-6 text-[7rem] leading-none text-primary/10">
              "
            </span>
            <Stars n={t.rating} />
            <p className="font-deva relative mt-3 text-sm leading-relaxed text-foreground/90">
              {t.text}
            </p>
            <div className="mt-5 border-t border-primary/15 pt-3">
              <div className="text-sm font-bold text-foreground">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.place}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
