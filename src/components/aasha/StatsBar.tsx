const stats = [
  { num: "50+", label: "Varieties" },
  { num: "365+", label: "Daily Arrivals" },
  { num: "₹100+", label: "From Rate" },
  { num: "500+", label: "Happy Buyers" },
];

export const StatsBar = () => (
  <section className="border-y border-primary/15 bg-card">
    <div className="mx-auto grid max-w-6xl grid-cols-4 divide-x divide-primary/15 px-2">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center justify-center px-2 py-5 text-center">
          <div className="font-display text-xl font-bold text-primary md:text-3xl">
            {s.num}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground md:text-xs">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  </section>
);
