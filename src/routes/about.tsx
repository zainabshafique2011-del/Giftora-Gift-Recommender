import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Heart, Shield } from "lucide-react";
import { Nav } from "@/components/Nav";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Giftora AI" },
      {
        name: "description",
        content:
          "Giftora AI is a personalized gift assistant that helps you find thoughtful gifts for the people who matter.",
      },
      { property: "og:title", content: "About — Giftora AI" },
      {
        property: "og:description",
        content: "Meet Giftora AI — a warmer, more personal way to find gifts.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <Nav />
      <section className="mx-auto max-w-3xl px-5 py-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-lavender/60 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> About Giftora AI
          </span>
          <h1 className="mt-6 font-display text-5xl leading-tight">
            Gifts should feel <span className="text-gradient italic">personal</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Giftora AI helps you skip the endless scrolling and find gifts that actually mean
            something — for the people who matter most.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: <Heart className="h-4 w-4" />,
              title: "Warm by design",
              body: "Every suggestion is written like a friend recommending, not a search result.",
            },
            {
              icon: <Sparkles className="h-4 w-4" />,
              title: "Guided by AI",
              body: "Personality, occasion and interests all shape what we recommend.",
            },
            {
              icon: <Shield className="h-4 w-4" />,
              title: "Yours alone",
              body: "Your gift lists are private. No ads, no noise, no clutter.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl border border-border/60 bg-card p-6">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-background text-primary shadow-sm">
                {f.icon}
              </span>
              <h3 className="mt-4 font-display text-lg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
