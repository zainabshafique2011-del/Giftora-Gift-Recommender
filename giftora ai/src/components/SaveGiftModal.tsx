import { useEffect, useMemo, useState } from "react";
import { Check, Plus, X, Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";
import {
  addGift,
  createCollection,
  moveGift,
  useCollectionsStore,
  type SavedGift,
} from "@/lib/collections";

const ICON_CHOICES = ["🎁", "❤️", "⭐", "🎂", "🌸", "🌟", "🎉", "🏡", "🧳", "💼", "👶", "🎓"];

export type SaveGiftInput = {
  name: string;
  description: string;
  priceRange: string;
  category: string;
  matchScore: number;
  occasion: string;
  emoji: string;
  currency?: string;
};

export function SaveGiftModal({
  open,
  onClose,
  gift,
  mode = "save",
  moveGiftId,
  excludeCollectionId,
}: {
  open: boolean;
  onClose: () => void;
  gift: SaveGiftInput | null;
  mode?: "save" | "move";
  moveGiftId?: string;
  excludeCollectionId?: string;
}) {
  const { collections } = useCollectionsStore();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(ICON_CHOICES[0]);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCreating(false);
      setNewName("");
      setNewIcon(ICON_CHOICES[0]);
      setJustSaved(null);
    }
  }, [open]);

  const sorted = useMemo(
    () =>
      [...collections]
        .filter((c) => c.id !== excludeCollectionId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [collections, excludeCollectionId],
  );

  if (!open || !gift) return null;

  const doSave = (collectionId: string) => {
    if (mode === "move" && moveGiftId) {
      moveGift(moveGiftId, collectionId);
      toast.success("Gift moved.", {
        description: `${gift.name} → ${collections.find((c) => c.id === collectionId)?.name ?? "Collection"}`,
      });
    } else {
      const saved: SavedGift = addGift({ ...gift, collectionId });
      toast.success("Gift saved successfully.", {
        description: `${saved.name} → ${collections.find((c) => c.id === collectionId)?.name ?? "Collection"}`,
      });
    }
    setJustSaved(collectionId);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const doCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const col = createCollection(name, newIcon);
    doSave(col.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 px-4 backdrop-blur-md fade-up"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-card/90 p-6 shadow-soft backdrop-blur-2xl sm:p-8"
        style={{ animation: "fade-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both" }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-background/70 text-muted-foreground transition-all hover:scale-105 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          </span>
          <h2 className="font-display text-2xl">{mode === "move" ? "Move Gift" : "Save Gift"}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a collection for <span className="font-medium text-foreground">{gift.name}</span>.
        </p>

        <div className="mt-5 max-h-72 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sorted.map((c) => {
              const active = justSaved === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => doSave(c.id)}
                  className={`group relative flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-lavender ${
                    active
                      ? "border-primary/60 bg-lavender"
                      : "border-border/60 bg-background/70"
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                  {active && (
                    <Check className="h-4 w-4 text-primary" style={{ animation: "sparkle-pop 0.6s ease-out both" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 border-t border-border/60 pt-4">
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="btn-premium inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-background/60 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-lavender"
            >
              <Plus className="h-4 w-4" />
              Create New Collection
            </button>
          ) : (
            <div className="space-y-3">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name (e.g. Mom, Best Friend)"
                className="input"
                onKeyDown={(e) => e.key === "Enter" && doCreate()}
              />
              <div className="flex flex-wrap gap-1.5">
                {ICON_CHOICES.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewIcon(i)}
                    className={`grid h-9 w-9 place-items-center rounded-xl border text-lg transition-all hover:scale-110 ${
                      newIcon === i
                        ? "border-primary/60 bg-lavender"
                        : "border-border/60 bg-background/70"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCreating(false)}
                  className="flex-1 rounded-2xl border border-border/60 bg-background/70 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-lavender"
                >
                  Cancel
                </button>
                <button
                  onClick={doCreate}
                  disabled={!newName.trim()}
                  className="btn-premium flex-1 rounded-2xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 icon-spin-slow" /> Create & Save
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
