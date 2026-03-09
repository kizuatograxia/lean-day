import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, ChevronDown, X } from "lucide-react";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { useAuth } from "@/contexts/AuthContext";
import { CountdownBadge } from "@/components/CountdownBadge";
import { Link } from "react-router-dom";

export const RaffleParticipationWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const { userRaffles } = useUserRaffles();

    // Filter only active raffles
    const activeRaffles = userRaffles.filter(ur => {
        const status = ur.raffle.status;
        return status === 'ativo' || status === 'active';
    });


    // Don't render if user is not logged in or has no active raffles
    if (!user || activeRaffles.length === 0) return null;

    // Check if any raffle is ending soon (within 1 hour)
    const hasUrgent = activeRaffles.some(ur => {
        const endTime = new Date(ur.raffle.dataFim).getTime();
        const now = Date.now();
        return endTime - now < 3600000 && endTime > now;
    });

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-auto">
            {/* Expanded List */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mb-4 w-80 max-h-[70vh] overflow-hidden rounded-2xl glass-card shadow-elevated"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border/10">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                                    <Ticket className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-semibold text-foreground text-sm">
                                    Participando de <span className="text-primary">{activeRaffles.length}</span>
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Raffle List - Simplified scrollbar */}
                        <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                            {activeRaffles.map((ur) => (
                                <Link
                                    key={ur.raffle.id}
                                    to={`/raffle/${ur.raffle.id}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02, backgroundColor: "hsla(var(--foreground) / 0.03)" }}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-border/10 transition-colors cursor-pointer group"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/20 group-hover:border-primary/30 transition-colors">
                                            <img
                                                src={ur.raffle.imagem || "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100"}
                                                alt={ur.raffle.titulo}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                                {ur.raffle.titulo}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CountdownBadge
                                                    targetDate={ur.raffle.dataFim}
                                                    className="text-[10px] px-1.5 py-0.5 bg-secondary text-foreground"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-border/10 bg-muted/30">
                            <Link
                                to="/profile"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                                Ver todos meus sorteios →
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300
                    border
                    ${isOpen
                        ? 'bg-background border-border text-foreground'
                        : 'glass-card text-foreground hover:border-primary/50'
                    }
                    ${hasUrgent && !isOpen ? 'ring-2 ring-destructive/50 animate-pulse' : ''}
                `}
            >
                {isOpen ? (
                    <ChevronDown className="w-6 h-6" />
                ) : (
                    <Ticket className={`w-6 h-6 ${hasUrgent ? 'text-destructive' : 'text-primary'}`} />
                )}

                {/* Badge Counter */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground shadow-lg border border-black">
                        {activeRaffles.length}
                    </span>
                )}
            </motion.button>
        </div>
    );
};
