import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Gift,
  Dices,
  Sparkles,
  Mail,
  Ribbon,
  PartyPopper,
  ShoppingBag,
  Star,
  Heart,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { HeartsBackground } from "@/components/HeartsBackground";
import { MouseGlow } from "@/components/MouseGlow";
import { SaveGiftModal, type SaveGiftInput } from "@/components/SaveGiftModal";
import { generateGifts } from "@/lib/gifts.functions";
import { CurrencySelect } from "@/components/CurrencySelect";
import { convertFromUsd, formatFromUsd, useCurrency } from "@/lib/currency";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gift Finder — Giftora AI" },
      {
        name: "description",
        content:
          "Tell Giftora AI about someone you love and get thoughtful, personalized gift ideas in seconds.",
      },
      { property: "og:title", content: "Gift Finder — Giftora AI" },
      {
        property: "og:description",
        content: "Personalized gift ideas, greeting cards, wrapping and more — powered by AI.",
      },
    ],
  }),
  component: Index,
});

const PERSONALITIES = [
  "Creative",
  "Tech Lover",
  "Book Lover",
  "Fitness Enthusiast",
  "Traveler",
  "Coffee Lover",
  "Gamer",
  "Nature Lover",
];

const RELATIONSHIPS = [
  "Partner",
  "Parent",
  "Sibling",
  "Friend",
  "Colleague",
  "Child",
  "Grandparent",
  "Other",
];

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Holiday",
  "Graduation",
  "Housewarming",
  "Just Because",
];

type Recommendation = {
  title: string;
  emoji: string;
  reason: string;
  price: string;
  match: number;
};

type GiftPlan = {
  gifts: Recommendation[];
  card: string;
  wrapping: string[];
  surprises: string[];
  bundle: { name: string; items: string; total: string };
  matchScore: number;
  matchLabel: string;
};

function Index() {
  const [recipient, setRecipient] = useState("");
  const [age, setAge] = useState("");
  const [relationship, setRelationship] = useState("");
  const [occasion, setOccasion] = useState("");
  const [budget, setBudget] = useState(75);
  const [interests, setInterests] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const [results, setResults] = useState<GiftPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingGift, setSavingGift] = useState<SaveGiftInput | null>(null);
  const [savedTitles, setSavedTitles] = useState<Set<string>>(new Set());

  const { code: currencyCode, currency } = useCurrency();
  const budgetLocal = convertFromUsd(budget, currencyCode);

  const callGenerate = useServerFn(generateGifts);

  const toggleTrait = (t: string) =>
    setTraits((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const generate = async (surprise = false) => {
    setLoading(true);
    setError(null);
    let nextTraits = traits;
    if (surprise) {
      nextTraits = [PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)]];
      setTraits(nextTraits);
    }
    try {
      const data = await callGenerate({
        data: {
          recipient,
          age,
          relationship,
          occasion,
          budget,
          interests,
          traits: nextTraits,
          surprise,
          currencyCode,
          currencySymbol: currency.symbol,
          budgetLocal,
        },
      });
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <HeartsBackground />
      <MouseGlow />
      <Nav />

      {/* Hero + Form */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 left-1/2 -z-10 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-blush/30 blur-3xl" />


        <div className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center sm:pt-24">
          <div className="stagger">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary icon-spin-slow" />
              Thoughtfully chosen by AI
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl">
              Personalized gifts,{" "}
              <span className="text-gradient italic">thoughtfully chosen</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Tell Giftora a little about someone you love. We'll find gifts that feel
              personal — not generic.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-5 pb-24 fade-up" style={{ animationDelay: "0.35s" }}>
          <div className="rounded-4xl border border-border/60 bg-card/70 p-6 shadow-soft backdrop-blur-2xl sm:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Recipient name" hint="optional">
                <input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Maya"
                  className="input"
                />
              </Field>
              <Field label="Age">
                <input
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 32"
                  className="input"
                />
              </Field>
              <Field label="Relationship">
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="input"
                >
                  <option value="">Select…</option>
                  {RELATIONSHIPS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Occasion">
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="input"
                >
                  <option value="">Select…</option>
                  {OCCASIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-medium text-foreground">Budget</label>
                <span className="text-sm font-semibold text-primary">
                  {formatFromUsd(budget, currencyCode)}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={5}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="mt-3 w-full accent-[var(--primary)]"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{formatFromUsd(10, currencyCode)}</span>
                <span>{formatFromUsd(500, currencyCode)}+</span>
              </div>
            </div>

            <div className="mt-6">
              <Field label="Currency" hint="prices shown in this currency">
                <CurrencySelect />
              </Field>
            </div>

            <div className="mt-6">
              <Field label="Interests">
                <input
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. photography, jazz vinyl, hiking"
                  className="input"
                />
              </Field>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-foreground">Personality</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {PERSONALITIES.map((t) => {
                  const active = traits.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTrait(t)}
                      className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                        active
                          ? "border-transparent bg-gradient-primary text-primary-foreground shadow-soft"
                          : "border-border bg-background/70 text-foreground hover:border-primary/40 hover:bg-lavender"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => generate(false)}
                disabled={loading}
                className="btn-premium group flex-1 rounded-2xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow disabled:opacity-60"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Gift className="h-4 w-4 transition-transform group-hover:-rotate-12 group-hover:scale-110" />
                  {loading ? "Finding gifts…" : "Generate Gift Ideas"}
                </span>
              </button>
              <button
                onClick={() => generate(true)}
                disabled={loading}
                className="btn-premium group flex-1 rounded-2xl border border-border bg-background/70 px-6 py-3.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-lavender hover:shadow-soft disabled:opacity-60"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Dices className="h-4 w-4 transition-transform duration-500 group-hover:rotate-[360deg]" />
                  Surprise Me
                  <Sparkles className="h-3.5 w-3.5 text-primary opacity-0 transition-opacity group-hover:opacity-100 icon-spin-slow" />
                </span>
              </button>
            </div>
            {error && (
              <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive fade-up">
                {error}
              </p>
            )}

          </div>
        </div>
      </section>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md fade-up">
          <div className="rounded-3xl border border-border/60 bg-card/80 px-10 py-8 text-center shadow-soft backdrop-blur-xl">
            <div className="relative mx-auto grid h-20 w-20 place-items-center">
              <Sparkles className="loading-sparkle absolute h-20 w-20" />
              <Heart className="loading-heart h-10 w-10" fill="currentColor" strokeWidth={0} />
              <Gift className="loading-gift absolute -bottom-1 -right-1 h-6 w-6" />
            </div>
            <p className="mt-6 font-display text-lg italic text-foreground">
              Finding the perfect gift for you...
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              A little sparkle takes a moment ✨
            </p>
          </div>
        </div>
      )}


      {/* Results */}
      <section className="mx-auto max-w-6xl px-5 pb-28">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Your gift dashboard</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you need to make the moment feel intentional.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger">
          <ResultCard
            icon={<Gift className="h-4 w-4 icon-bounce" />}
            title="Gift Recommendations"
            accent="from-primary/20 to-blush/30"
          >
            {results ? (
              <ul className="space-y-3">
                {results.gifts.map((g) => {
                  const isSaved = savedTitles.has(g.title);
                  return (
                    <li
                      key={g.title}
                      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lavender text-lg">
                        {g.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{g.title}</p>
                          <span className="shrink-0 text-xs font-semibold text-primary">
                            {g.price}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{g.reason}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSavedTitles((prev) => new Set(prev).add(g.title));
                          setSavingGift({
                            name: g.title,
                            description: g.reason,
                            priceRange: g.price,
                            category: traits[0] ?? "General",
                            matchScore: g.match ?? results.matchScore,
                            occasion: occasion || "Just Because",
                            emoji: g.emoji,
                            currency: currencyCode,
                          });
                        }}
                        aria-label={`Save ${g.title}`}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/60 bg-background/80 text-primary transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-lavender active:scale-90"
                      >
                        <Heart
                          className={`h-4 w-4 transition-all duration-300 ${isSaved ? "scale-110" : ""}`}
                          fill={isSaved ? "currentColor" : "none"}
                          strokeWidth={isSaved ? 0 : 2}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty text="No gift recommendations generated yet." />
            )}
          </ResultCard>

          <ResultCard
            icon={<Mail className="h-4 w-4 icon-wiggle" />}
            title="Greeting Card Generator"
            accent="from-blush/30 to-gold-soft/40"
          >
            {results ? (
              <div className="greeting-card group/card relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-blush/20 to-lavender/40 p-6 shadow-soft">
                {/* Decorative corners */}
                <Sparkles className="absolute right-3 top-3 h-4 w-4 text-gold icon-spin-slow opacity-70" />
                <Heart className="absolute left-3 bottom-3 h-3.5 w-3.5 text-primary icon-pulse-heart" fill="currentColor" strokeWidth={0} />
                <Heart className="absolute right-4 bottom-4 h-2.5 w-2.5 text-blush icon-pulse-heart" fill="currentColor" strokeWidth={0} style={{ animationDelay: "0.6s" }} />
                <Sparkles className="absolute left-4 top-4 h-3 w-3 text-primary/70 icon-spin-slow" style={{ animationDelay: "1s" }} />

                {/* Ornamental divider top */}
                <div className="mb-3 flex items-center justify-center gap-2 text-primary/60">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary/40" />
                  <Heart className="h-3 w-3" fill="currentColor" strokeWidth={0} />
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary/40" />
                </div>

                <blockquote className="relative font-display text-[1.05rem] italic leading-relaxed text-foreground">
                  <span className="absolute -left-1 -top-3 font-display text-4xl leading-none text-primary/30">&ldquo;</span>
                  <p className="relative px-2">{results.card}</p>
                  <span className="absolute -bottom-6 right-0 font-display text-4xl leading-none text-primary/30">&rdquo;</span>
                </blockquote>

                {/* Ornamental divider bottom */}
                <div className="mt-6 flex items-center justify-center gap-2 text-primary/60">
                  <span className="h-px w-6 bg-gradient-to-r from-transparent to-primary/40" />
                  <span className="text-xs tracking-[0.3em] text-primary/70">WITH LOVE</span>
                  <span className="h-px w-6 bg-gradient-to-l from-transparent to-primary/40" />
                </div>

                {/* Shimmer overlay */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover/card:translate-x-full" />
              </div>
            ) : (
              <Empty text="No card written yet." />
            )}
          </ResultCard>


          <ResultCard
            icon={<Ribbon className="h-4 w-4 icon-bounce" />}
            title="Gift Wrapping Ideas"
            accent="from-gold-soft/40 to-lavender-deep/40"
          >
            {results ? (
              <ul className="space-y-2 text-sm text-foreground/90">
                {results.wrapping.map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
            ) : (
              <Empty text="No wrapping ideas yet." />
            )}
          </ResultCard>

          <ResultCard
            icon={<PartyPopper className="h-4 w-4 icon-wiggle" />}
            title="Surprise Presentation Ideas"
            accent="from-primary/20 to-gold-soft/40"
          >
            {results ? (
              <ul className="space-y-2 text-sm text-foreground/90">
                {results.surprises.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            ) : (
              <Empty text="No surprise ideas yet." />
            )}
          </ResultCard>

          <ResultCard
            icon={<ShoppingBag className="h-4 w-4 icon-bounce" />}
            title="Gift Bundle Builder"
            accent="from-lavender-deep/40 to-blush/30"
          >
            {results ? (
              <div className="rounded-2xl bg-background/70 p-4">
                <p className="text-sm font-semibold">{results.bundle.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{results.bundle.items}</p>
                <p className="mt-3 text-sm font-semibold text-primary">
                  {results.bundle.total}
                </p>
              </div>
            ) : (
              <Empty text="No bundle built yet." />
            )}
          </ResultCard>

          <ResultCard
            icon={<Star className="h-4 w-4 icon-spin-slow" />}
            title="Gift Match Score"
            accent="from-gold/30 to-primary/20"
          >
            {results ? (
              <div className="flex items-center gap-4">
                <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft soft-pulse">
                  <span className="font-display text-2xl">{results.matchScore}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{results.matchLabel}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Based on personality, interests & occasion
                  </p>
                </div>
              </div>
            ) : (
              <Empty text="No match score yet." />
            )}
          </ResultCard>

        </div>
      </section>

      <Footer />

      <SaveGiftModal
        open={!!savingGift}
        onClose={() => setSavingGift(null)}
        gift={savingGift}
      />
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function ResultCard({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <article className="card-interactive group relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-xl">
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${accent} opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-background text-primary shadow-sm">
          {icon}
        </span>
        <h3 className="font-display text-lg">{title}</h3>
      </div>
      <div className="relative mt-5">{children}</div>
    </article>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 p-5 text-center">
      <Heart className="icon-pulse-heart mx-auto h-5 w-5 opacity-60" fill="currentColor" strokeWidth={0} />
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 sm:flex-row">
        <p className="font-display text-sm text-muted-foreground">
          Giftora AI · Personalized Gifts, Thoughtfully Chosen by AI.
        </p>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Giftora</p>
      </div>
    </footer>
  );
}
