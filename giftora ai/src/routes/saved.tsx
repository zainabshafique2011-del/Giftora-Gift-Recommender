import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, Heart, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Nav } from "@/components/Nav";
import { HeartsBackground } from "@/components/HeartsBackground";
import { MouseGlow } from "@/components/MouseGlow";
import {
  createCollection,
  deleteCollection,
  useCollectionsStore,
} from "@/lib/collections";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Gifts — Giftora AI" },
      {
        name: "description",
        content: "Organize thoughtful gift ideas into beautiful collections with Giftora AI.",
      },
      { property: "og:title", content: "Saved Gifts — Giftora AI" },
      {
        property: "og:description",
        content: "Your bookmarked gift ideas, greeting cards and bundles — grouped into collections.",
      },
    ],
  }),
  component: Saved,
});

const ICON_CHOICES = ["🎁", "❤️", "⭐", "🎂", "🌸", "🌟", "🎉", "🏡", "🧳", "💼", "👶", "🎓"];

function Saved() {
  const { collections, gifts, ready } = useCollectionsStore();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(ICON_CHOICES[0]);

  const summary = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collections
      .map((c) => {
        const inCol = gifts.filter((g) => g.collectionId === c.id);
        const matched = q
          ? inCol.filter(
              (g) =>
                g.name.toLowerCase().includes(q) ||
                g.description.toLowerCase().includes(q),
            )
          : inCol;
        const latest = inCol
          .map((g) => g.dateSaved)
          .sort()
          .pop();
        return { col: c, count: inCol.length, matched, latest };
      })
      .filter((s) => (query ? s.matched.length > 0 : true));
  }, [collections, gifts, query]);

  const doCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createCollection(name, newIcon);
    toast.success("Collection created.", { description: name });
    setNewName("");
    setNewIcon(ICON_CHOICES[0]);
    setCreating(false);
  };

  const isEmpty = ready && collections.length === 0;

  return (
    <div className="min-h-screen">
      <HeartsBackground />
      <MouseGlow />
      <Nav />

      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Bookmark className="h-3.5 w-3.5 text-primary" />
              Your gift collections
            </div>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl">
              Saved <span className="text-gradient italic">with love</span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Organize every thoughtful idea into collections — like little wish boards.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search saved gifts…"
                className="input pl-9 sm:w-72"
              />
            </div>
            <button
              onClick={() => setCreating(true)}
              className="btn-premium inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow"
            >
              <Plus className="h-4 w-4" /> New Collection
            </button>
          </div>
        </div>

        <div className="mt-10">
          {isEmpty ? (
            <EmptyState onCreate={() => setCreating(true)} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger">
              {summary.map(({ col, count, latest }) => (
                <Link
                  key={col.id}
                  to="/saved/$collectionId"
                  params={{ collectionId: col.id }}
                  className="card-interactive group relative block overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-xl"
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-blush/30 opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative flex items-start justify-between">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-lavender text-3xl shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {col.icon}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm(`Delete collection "${col.name}"? Saved gifts inside will be removed.`)) {
                          deleteCollection(col.id);
                          toast.success("Collection deleted.");
                        }
                      }}
                      aria-label="Delete collection"
                      className="grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-background/70 text-muted-foreground opacity-0 transition-all hover:scale-105 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3 className="relative mt-5 font-display text-2xl">{col.name}</h3>
                  <div className="relative mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {count} {count === 1 ? "gift" : "gifts"}
                    </span>
                    <span>
                      {latest
                        ? `Updated ${new Date(latest).toLocaleDateString()}`
                        : "Empty"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 px-4 backdrop-blur-md fade-up"
          onClick={() => setCreating(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-border/60 bg-card/90 p-6 shadow-soft backdrop-blur-2xl sm:p-8"
            style={{ animation: "fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            <button
              onClick={() => setCreating(false)}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-background/70 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="font-display text-2xl">Create Collection</h2>
            </div>
            <div className="mt-5 space-y-3">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Mom, Best Friend, Office Gifts"
                className="input"
                onKeyDown={(e) => e.key === "Enter" && doCreate()}
              />
              <div className="flex flex-wrap gap-1.5">
                {ICON_CHOICES.map((i) => (
                  <button
                    key={i}
                    onClick={() => setNewIcon(i)}
                    className={`grid h-9 w-9 place-items-center rounded-xl border text-lg transition-all hover:scale-110 ${
                      newIcon === i ? "border-primary/60 bg-lavender" : "border-border/60 bg-background/70"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <button
                onClick={doCreate}
                disabled={!newName.trim()}
                className="btn-premium w-full rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60"
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mx-auto max-w-xl rounded-4xl border border-dashed border-border/70 bg-card/60 p-12 text-center fade-up">
      <div className="relative mx-auto grid h-20 w-20 place-items-center">
        <Sparkles className="loading-sparkle absolute h-20 w-20" />
        <Heart className="loading-heart h-10 w-10" fill="currentColor" strokeWidth={0} />
      </div>
      <h2 className="mt-6 font-display text-3xl">No gift collections yet.</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Start a collection to keep every thoughtful idea in one beautiful place.
      </p>
      <button
        onClick={onCreate}
        className="btn-premium mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow"
      >
        <Plus className="h-4 w-4" /> Create Collection
      </button>
    </div>
  );
}
