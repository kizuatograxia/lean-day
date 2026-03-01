import React, { useEffect, useState, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";

interface TicketRouletteProps {
    totalTickets: number;
    userTickets: number;
    winnerIndex?: number;
    onComplete?: () => void;
}

const TICKET_WIDTH = 100;
const VISIBLE_TICKETS = 20; // Number of tickets to generate for the animation

export const TicketRoulette: React.FC<TicketRouletteProps> = ({
    totalTickets,
    userTickets,
    winnerIndex = 42, // Mock winner index for now
    onComplete,
}) => {
    const controls = useAnimation();
    const [isSpinning, setIsSpinning] = useState(false);

    // Generate a random-ish list of tickets for the roulette strip
    // The winner should be at a specific position (e.g., VISIBLE_TICKETS - 5)
    const tickets = useMemo(() => {
        const list = [];
        for (let i = 0; i < VISIBLE_TICKETS; i++) {
            // Randomly assign some as user tickets
            const isUser = Math.random() < (userTickets / totalTickets);
            list.push({
                id: i,
                number: Math.floor(Math.random() * totalTickets),
                type: isUser ? "user" : "pool"
            });
        }
        // Fixed winner at position 15
        list[15] = {
            id: 15,
            number: winnerIndex,
            type: "pool" // For drama, assume someone else won unless we specify user won
        };
        return list;
    }, [totalTickets, userTickets, winnerIndex]);

    useEffect(() => {
        const startSpin = async () => {
            setIsSpinning(true);

            // Start at 0, spin to the winner position
            // Each ticket is TICKET_WIDTH px
            // We want the winner (index 15) to be in the center
            const winnerOffset = 15 * TICKET_WIDTH - (window.innerWidth / 4); // Adjusted for center

            await controls.start({
                x: -winnerOffset,
                transition: {
                    duration: 8,
                    ease: [0.12, 0, 0.39, 0], // Fast start
                }
            });

            // Slow down and settle
            await controls.start({
                x: -winnerOffset - 20,
                transition: { duration: 2, ease: "easeOut" }
            });

            setIsSpinning(false);
            if (onComplete) onComplete();
        };

        startSpin();
    }, [controls, onComplete]);

    return (
        <div className="relative w-full overflow-hidden bg-black/40 rounded-2xl border border-white/5 py-12 shadow-2xl">
            {/* Center Marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary/50 z-20 -translate-x-1/2 shadow-[0_0_15px_hsl(var(--primary))]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45 -translate-y-1/2" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45 translate-y-1/2" />
            </div>

            <motion.div
                animate={controls}
                className="flex gap-2 px-1/2"
                style={{ width: "max-content" }}
            >
                {tickets.map((ticket, i) => (
                    <div
                        key={i}
                        className={`w-[100px] h-[100px] rounded-xl flex flex-col items-center justify-center border-2 transition-colors ${ticket.type === "user"
                                ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                : "bg-background border-border"
                            }`}
                    >
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Ticket</span>
                        <span className={`text-2xl font-black ${ticket.type === "user" ? "text-primary" : "text-foreground"}`}>
                            #{ticket.number}
                        </span>
                    </div>
                ))}
            </motion.div>

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-background via-transparent to-background" />

            <div className="mt-8 text-center">
                <p className="text-primary font-bold animate-pulse uppercase tracking-[0.2em] text-sm">
                    Sorteando Vencedor...
                </p>
            </div>
        </div>
    );
};
