import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";

interface TicketVisualizerProps {
  totalTickets: number;
  userTickets: number;
  maxDisplay?: number;
}

interface TicketBlock {
  id: string;
  count: number;
  type: "user" | "pool";
  x: number;
  y: number;
  width: number;
  height: number;
}

// Squarified Treemap Algorithm implementation
const squarify = (
  values: { id: string, count: number, type: "user" | "pool" }[],
  x: number, y: number, width: number, height: number
): TicketBlock[] => {
  const result: TicketBlock[] = [];
  const totalWeight = values.reduce((sum, v) => sum + v.count, 0);

  const scale = (width * height) / totalWeight;

  let curX = x;
  let curY = y;
  let curWidth = width;
  let curHeight = height;

  let i = 0;
  while (i < values.length) {
    const isHorizontal = curWidth >= curHeight;
    const remainingWeight = values.slice(i).reduce((sum, v) => sum + v.count, 0);

    // Greedily take weights while aspect ratio improves or we run out
    let rowWeight = 0;
    let rowCount = 0;

    // For simplicity in this implementation, we'll take one item at a time or small groups
    // but a basic recursive subdivision is easier to follow and works well for small sets
    const weight = values[i].count;
    const ratio = weight / remainingWeight;

    let blockWidth, blockHeight;
    if (isHorizontal) {
      blockWidth = curWidth * ratio;
      blockHeight = curHeight;
      result.push({ ...values[i], x: curX, y: curY, width: blockWidth, height: blockHeight });
      curX += blockWidth;
      curWidth -= blockWidth;
    } else {
      blockWidth = curWidth;
      blockHeight = curHeight * ratio;
      result.push({ ...values[i], x: curX, y: curY, width: blockWidth, height: blockHeight });
      curY += blockHeight;
      curHeight -= blockHeight;
    }
    i++;
  }

  return result;
};

export const TicketVisualizer: React.FC<TicketVisualizerProps> = ({
  totalTickets,
  userTickets,
  maxDisplay = 1000,
}) => {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  // Generate blocks and calculate treemap positions
  const blocks = useMemo(() => {
    const list: { id: string, count: number, type: "user" | "pool" }[] = [];

    // User block (The growing one)
    if (userTickets > 0) {
      list.push({ id: "user-block", count: userTickets, type: "user" });
    }

    // Pool blocks (Grouped)
    let poolRemaining = Math.max(0, Math.min(totalTickets, maxDisplay) - userTickets);

    let i = 0;
    while (poolRemaining > 0) {
      // Chunk sizes: 1, 5, 10, 20, 50, 100
      const possibleSizes = [100, 50, 20, 10, 5, 1].filter(s => s <= poolRemaining);
      const size = possibleSizes[0]; // Take largest possible for cleaner look

      list.push({
        id: `pool-${i}`,
        count: size,
        type: "pool"
      });
      poolRemaining -= size;
      i++;
    }

    // Sort descending for treemap stability
    const sorted = list.sort((a, b) => b.count - a.count);

    // Calculate treemap positions (using 100x100 coord system)
    return squarify(sorted, 0, 0, 100, 100);
  }, [totalTickets, userTickets, maxDisplay]);

  const getBlockColor = (type: "user" | "pool", id: string) => {
    if (type === "user") return "hsl(var(--primary))";
    const seed = id.split("-")[1] || "0";
    const hue = 220 + (parseInt(seed) % 5) * 12;
    const lightness = 25 + (parseInt(seed) % 6) * 4;
    return `hsl(${hue}, 40%, ${lightness}%)`;
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-bold text-sm text-foreground uppercase tracking-wider">Mempool de Tickets</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter">
          <div className="flex items-center gap-1.5 text-primary">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span>VOCÊ: {userTickets}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-900/50 border border-blue-500/30" />
            <span>OUTROS: {totalTickets - userTickets}</span>
          </div>
        </div>
      </div>

      {/* Mempool Container - Strictly Square */}
      <div className="relative w-full overflow-hidden bg-black/40 rounded-xl border border-white/5 shadow-inner"
        style={{ paddingBottom: '100%' }}>

        <div className="absolute inset-0 p-1">
          <AnimatePresence mode="popLayout">
            {blocks.map((block) => (
              <motion.div
                layout
                key={block.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: hoveredBlock && hoveredBlock !== block.id ? 0.3 : 1,
                  scale: 1,
                  left: `${block.x}%`,
                  top: `${block.y}%`,
                  width: `${block.width}%`,
                  height: `${block.height}%`,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  layout: { duration: 0.4 }
                }}
                className={`absolute p-[0.5px] cursor-pointer group`}
                onHoverStart={() => setHoveredBlock(block.id)}
                onHoverEnd={() => setHoveredBlock(null)}
              >
                <div
                  className={`w-full h-full rounded-[2px] border ${block.type === "user"
                      ? "border-primary/50 z-20 shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                      : "border-white/5 hover:border-white/20 z-10"
                    } transition-colors duration-300 relative overflow-hidden`}
                  style={{ backgroundColor: getBlockColor(block.type, block.id) }}
                >
                  {/* Tooltip on hover */}
                  {hoveredBlock === block.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-50 p-1"
                    >
                      <div className="text-[10px] font-black leading-tight text-center text-white uppercase">
                        {block.count} {block.count === 1 ? "Bilhete" : "Bilhetes"}
                        {block.type === "user" && <div className="text-primary">VOCÊ</div>}
                      </div>
                    </motion.div>
                  )}

                  {/* Inner glow for user block */}
                  {block.type === "user" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  )}

                  {/* Subtle pattern for large blocks */}
                  {(block.width > 20 || block.height > 20) && (
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '8px 8px' }} />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total de Bilhetes</p>
          <p className="text-xl font-black text-foreground">{totalTickets}</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
          <p className="text-[10px] font-bold text-primary uppercase mb-1">Sua Participação</p>
          <p className="text-xl font-black text-primary">
            {((userTickets / totalTickets) * 100 || 0).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};
