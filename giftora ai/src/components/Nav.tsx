import { Link } from "@tanstack/react-router";
import { Gift } from "lucide-react";
import { CurrencySelect } from "@/components/CurrencySelect";

export function Nav() {
  const linkCls =
    "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
  const activeCls = "text-foreground";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/60 backdrop-blur-xl fade-up">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Gift className="h-4 w-4 icon-bounce" />
          </span>
          <span className="font-display text-xl tracking-tight">
            Giftora <span className="text-gradient">AI</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className={`${linkCls} rounded-full px-3 py-1.5 transition-all hover:bg-lavender hover:text-foreground`}
            activeProps={{ className: `${activeCls} bg-lavender` }}
          >
            Gift Finder
          </Link>
          <Link
            to="/saved"
            className={`${linkCls} rounded-full px-3 py-1.5 transition-all hover:bg-lavender hover:text-foreground`}
            activeProps={{ className: `${activeCls} bg-lavender` }}
          >
            Saved Gifts
          </Link>
          <Link
            to="/about"
            className={`${linkCls} rounded-full px-3 py-1.5 transition-all hover:bg-lavender hover:text-foreground`}
            activeProps={{ className: `${activeCls} bg-lavender` }}
          >
            About
          </Link>
          <CurrencySelect variant="pill" className="ml-1" />
        </nav>
      </div>
    </header>
  );
}
