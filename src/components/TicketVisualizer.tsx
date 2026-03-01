import React, { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Grid3X3 } from "lucide-react";

interface TicketVisualizerProps {
  totalTickets: number;
  userTickets: number;
  maxDisplay?: number;
}

const CELL_SIZE = 18;
const GAP = 2;

export const TicketVisualizer: React.FC<TicketVisualizerProps> = ({
  totalTickets,
  userTickets,
  maxDisplay = 500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Clamp display count
  const displayCount = Math.min(Math.max(totalTickets, 20), maxDisplay);
  const userCount = Math.min(userTickets, displayCount);

  // Generate grid data with user tickets randomly distributed
  const cells = useMemo(() => {
    const arr: ("user" | "pool")[] = Array(displayCount).fill("pool");

    // Place user tickets at random positions
    const positions = new Set<number>();
    while (positions.size < userCount) {
      positions.add(Math.floor(Math.random() * displayCount));
    }
    positions.forEach((pos) => (arr[pos] = "user"));

    return arr;
  }, [displayCount, userCount]);

  // Calculate columns from container width
  const [cols, setCols] = useState(20);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setCols(Math.floor(width / (CELL_SIZE + GAP)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rows = Math.ceil(displayCount / cols);

  const getColor = (type: "user" | "pool", index: number) => {
    if (type === "user") {
      return "hsl(45, 100%, 55%)"; // Gold for user
    }
    // Pool tickets get varying shades of blue/purple like mempool
    const hue = 220 + (index % 5) * 12; // 220-268 range
    const lightness = 35 + (index % 7) * 5; // 35-65 range
    const saturation = 50 + (index % 3) * 15;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-foreground">Visualização de Tickets</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(45, 100%, 55%)" }} />
            <span className="text-muted-foreground">Você</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(232, 60%, 45%)" }} />
            <span className="text-muted-foreground">Pool</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl"
        style={{ maxHeight: rows * (CELL_SIZE + GAP) + 8, minHeight: 120 }}
      >
        <div
          className="flex flex-wrap"
          style={{ gap: GAP }}
        >
          {cells.map((type, i) => (
            <motion.div
              key={i}
              className="rounded-[3px] cursor-pointer transition-all duration-150"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                background: getColor(type, i),
                opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1,
              }}
              whileHover={{ scale: 1.4, zIndex: 10 }}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </div>

      {/* Tooltip info */}
      {hoveredIndex !== null && (
        <div className="text-xs text-muted-foreground text-center">
          Ticket #{hoveredIndex + 1} •{" "}
          <span className={cells[hoveredIndex] === "user" ? "text-yellow-400 font-bold" : "text-blue-400"}>
            {cells[hoveredIndex] === "user" ? "Seu ticket" : "Pool"}
          </span>
        </div>
      )}
    </div>
  );
};
