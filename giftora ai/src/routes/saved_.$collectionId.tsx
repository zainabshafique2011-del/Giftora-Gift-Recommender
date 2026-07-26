import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, FolderInput, Heart, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  convertFromUsd,
  formatFromUsd,
  getCurrency,
  useCurrency,
  type CurrencyCode,
} from "@/lib/currency";
import { Nav } from "@/components/Nav";
import { HeartsBackground } from "@/components/HeartsBackground";
import { MouseGlow } from "@/components/MouseGlow";
import { SaveGiftModal, type SaveGiftInput } from "@/components/SaveGiftModal";
import { removeGift, useCollectionsStore, type SavedGift } from "@/lib/collections";

export const Route = createFileRoute("/saved_/$collectionId")({
  head: ({ params }) => ({
    meta: [
      { title: `Collection — Giftora AI` },
      { name: "description", content: `Saved gifts in your Giftora AI collection ${params.collectionId}.` },
      { property: "og:title", content: "Gift Collection — Giftora AI" },
      { property: "og:description", content: "Every gift you've saved to this collection." },
    ],
  }),
  component: CollectionDetail,
  notFoundComponent: () => (
    <div className="min-h-screen">
      <Nav />
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Collection not found</h1>
        <Link to="/saved" className="mt-4 inline-block text-sm text-primary underline">Back to collections</Link>
      </div>
    </div>
  ),
});

const CATEGORIES = ["All", "General", "Creative", "Tech Lover", "Book Lover", "Fitness Enthusiast", "Traveler", "Coffee Lover", "Gamer", "Nature Lover"];
const OCCASIONS = ["All", "Birthday", "Anniversary", "Wedding", "Holiday", "Graduation", "Housewarming", "Just Because"];
const SORTS = [
  { id: "recent", label: "Recently Saved" },
  { id: "match", label: "Highest Match Score" },
  { id: "name", label: "Name (A–Z)" },
] as const;

function CollectionDetail() {
  const { collectionId } = Route.useParams();
  const { collections, gifts, ready } = useCollectionsStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [occasion, setOccasion] = useState("All");
  const [budget, setBudget] = useState<number>(500);
  const { code: currencyCode } = useCurrency();
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("recent");
  const [moving, setMoving] = useState<SavedGift | null>(null);
  const [viewing, setViewing] = useState<SavedGift | null>(null);
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  const collection = collections.find((c) => c.id === collectionId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return gifts
      .filter((g) => g.collectionId === collectionId)
      .filter((g) => (q ? g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) : true))
      .filter((g) => (category === "All" ? true : g.category === category))
      .filter((g) => (occasion === "All" ? true : g.occasion === occasion))
      .filter((g) => {
        // Prices are stored in the currency selected at save time — compare in
        // that same currency so the USD-based slider stays meaningful.
        const num = Number((g.priceRange.replace(/[,\s]/g, "").match(/\d+/g) ?? ["0"])[0]);
        return num <= convertFromUsd(budget, (g.currency as CurrencyCode) ?? "USD");
      })
      .sort((a, b) => {
        if (sort === "match") return b.matchScore - a.matchScore;
        if (sort === "name") return a.name.localeCompare(b.name);
        return b.dateSaved.localeCompare(a.dateSaved);
      });
  }, [gifts, collectionId, query, category, occasion, budget, sort]);

  if (ready && !collection) throw notFound();

  const handleRemove = (id: string) => {
    setRemoving((prev) => new Set(prev).add(id));
    setTimeout(() => {
      removeGift(id);
      toast.success("Gift removed.");
    }, 260);
  };

  return (
    <div className="min-h-screen">
      <HeartsBackground />
      <MouseGlow />
      <Nav />

      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <Link to="/saved" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All collections
        </Link>

        <div className="mt-6 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end fade-up">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-lavender text-4xl shadow-soft">
              {collection?.icon ?? "🎁"}
            </div>
            <div>
              <h1 className="font-display text-4xl sm:text-5xl">{collection?.name ?? "Collection"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered.length} of {gifts.filter((g) => g.collectionId === collectionId).length}{" "}
                {gifts.length === 1 ? "gift" : "gifts"}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this collection…"
              className="input pl-9"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 grid gap-3 rounded-3xl border border-border/60 bg-card/60 p-4 sm:grid-cols-2 lg:grid-cols-4 backdrop-blur-xl">
          <FilterSelect label="Occasion" value={occasion} onChange={setOccasion} options={OCCASIONS} />
          <FilterSelect label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={(v) => setSort(v as typeof sort)}
            options={SORTS.map((s) => s.id)}
            labels={Object.fromEntries(SORTS.map((s) => [s.id, s.label]))}
          />
          <div>
            <label className="mb-1 flex items-baseline justify-between text-xs font-medium text-muted-foreground">
              <span>Max Budget</span>
              <span className="text-primary">{formatFromUsd(budget, currencyCode)}+</span>
            </label>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border/70 bg-card/60 p-10 text-center">
              <Heart className="mx-auto h-6 w-6 icon-pulse-heart" fill="currentColor" strokeWidth={0} />
              <p className="mt-3 text-sm text-muted-foreground">
                No saved gifts match these filters yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger">
              {filtered.map((g) => {
                const isRemoving = removing.has(g.id);
                return (
                  <article
                    key={g.id}
                    className={`card-interactive group relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-xl transition-all ${
                      isRemoving ? "pointer-events-none scale-95 opacity-0" : ""
                    }`}
                  >
                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-blush/30 opacity-70 blur-2xl" />
                    <div className="relative flex items-start gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lavender text-2xl">
                        {g.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-display text-lg">{g.name}</h3>
                        <p className="text-xs text-muted-foreground">{g.category} · {g.occasion}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-gradient-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
                        {g.matchScore}
                      </span>
                    </div>
                    <p className="relative mt-3 line-clamp-3 text-sm text-foreground/80">{g.description}</p>
                    <div className="relative mt-3 flex items-center justify-between text-xs">
                      <span className="font-semibold text-primary">{g.priceRange}</span>
                      <span className="text-muted-foreground">
                        Saved {new Date(g.dateSaved).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="relative mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => setViewing(g)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-lavender"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View Details
                      </button>
                      <button
                        onClick={() => setMoving(g)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-lavender"
                      >
                        <FolderInput className="h-3.5 w-3.5" /> Move
                      </button>
                      <button
                        onClick={() => handleRemove(g.id)}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-destructive/40 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <SaveGiftModal
        open={!!moving}
        onClose={() => setMoving(null)}
        mode="move"
        moveGiftId={moving?.id}
        excludeCollectionId={collectionId}
        gift={moving ? toInput(moving) : null}
      />

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 px-4 backdrop-blur-md fade-up"
          onClick={() => setViewing(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl border border-border/60 bg-card/90 p-8 shadow-soft backdrop-blur-2xl"
            style={{ animation: "fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-lavender text-3xl">{viewing.emoji}</span>
              <div>
                <h2 className="font-display text-2xl">{viewing.name}</h2>
                <p className="text-xs text-muted-foreground">{viewing.category} · {viewing.occasion}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-foreground/85">{viewing.description}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Info label="Price Range" value={viewing.priceRange} />
              <Info label="Currency" value={getCurrency(viewing.currency).code} />
              <Info label="Match Score" value={`${viewing.matchScore}`} />
              <Info label="Category" value={viewing.category} />
              <Info label="Occasion" value={viewing.occasion} />
              <Info label="Date Saved" value={new Date(viewing.dateSaved).toLocaleString()} />
            </dl>
            <button
              onClick={() => setViewing(null)}
              className="btn-premium mt-6 w-full rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function toInput(g: SavedGift): SaveGiftInput {
  return {
    name: g.name,
    description: g.description,
    priceRange: g.priceRange,
    currency: g.currency,
    category: g.category,
    matchScore: g.matchScore,
    occasion: g.occasion,
    emoji: g.emoji,
  };
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  labels?: Record<string, string>;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
