import { Heart } from "lucide-react";
import { useMemo } from "react";

export function HeartsBackground({ count = 12 }: { count?: number }) {
  const floaters = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const size = 10 + Math.random() * 16;
        const left = Math.random() * 100;
        const duration = 16 + Math.random() * 18;
        const delay = -Math.random() * duration;
        const opacity = 0.35 + Math.random() * 0.35;
        return { i, size, left, duration, delay, opacity };
      }),
    [count],
  );

  // Dense staggered grid of blinking hearts (like the reference pattern)
  const gridHearts = useMemo(() => {
    const cols = 10;
    const rows = 12;
    const items: {
      i: number;
      left: number;
      top: number;
      size: number;
      delay: number;
      duration: number;
    }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offset = r % 2 === 0 ? 0 : (100 / cols) / 2;
        const left = (c * 100) / cols + offset + (Math.random() * 2 - 1);
        const top = (r * 100) / rows + (Math.random() * 2 - 1);
        items.push({
          i: r * cols + c,
          left,
          top,
          size: 12 + Math.random() * 6,
          delay: Math.random() * 3,
          duration: 2 + Math.random() * 2.5,
        });
      }
    }
    return items;
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {gridHearts.map((h) => (
        <Heart
          key={`g-${h.i}`}
          className="heart-blink absolute"
          fill="currentColor"
          strokeWidth={0}
          style={{
            left: `${h.left}%`,
            top: `${h.top}%`,
            width: h.size,
            height: h.size,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        />
      ))}
      {floaters.map((h) => (
        <Heart
          key={`f-${h.i}`}
          className="heart-float"
          fill="currentColor"
          strokeWidth={0}
          style={{
            left: `${h.left}%`,
            bottom: `-${h.size * 2}px`,
            width: h.size,
            height: h.size,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            opacity: h.opacity,
          }}
        />
      ))}
    </div>
  );
}
