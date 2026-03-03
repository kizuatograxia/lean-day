import React, { useState, useEffect } from "react";
import { Clock, Activity } from "lucide-react";
import { TicketVisualizer } from "./TicketVisualizer";

// Compact timer — no card, just text for use below the circle
export const CircularCountdown: React.FC<{
    targetDate: string,
    onExpire?: () => void,
}> = ({ targetDate, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0, total: 1
    });

    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const end = new Date(targetDate).getTime();
            const diff = Math.max(0, end - now);
            if (diff === 0 && onExpire) onExpire();
            const totalDuration = 30 * 24 * 60 * 60 * 1000;
            const elapsed = totalDuration - diff;
            const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft({ days, hours, minutes, seconds, progress, total: diff });
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [targetDate, onExpire]);

    const isEnding = timeLeft.days === 0 && timeLeft.hours < 1;
    const isExpired = timeLeft.total === 0;
    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference * (1 - timeLeft.progress);

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Progress arc — decorative ring around the text block */}
            <div className="relative w-56 h-56">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle
                        cx="100" cy="100" r="90"
                        fill="none"
                        stroke={isExpired ? "hsl(142, 70%, 45%)" : "hsl(var(--primary))"}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear"
                        style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.7))" }}
                    />
                </svg>
                {/* Time text in center of ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {isExpired ? (
                        <div className="flex flex-col items-center gap-2">
                            <Activity className="w-10 h-10 text-green-400 animate-spin" />
                            <span className="text-sm font-black text-green-400 uppercase tracking-widest">SORTEANDO</span>
                        </div>
                    ) : timeLeft.days > 0 ? (
                        <>
                            <div className="text-5xl font-black text-white tabular-nums leading-none">
                                {String(timeLeft.days).padStart(2, "0")}
                                <span className="text-white/30 mx-0.5">:</span>
                                {String(timeLeft.hours).padStart(2, "0")}
                            </div>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-1">Dias : Horas</span>
                        </>
                    ) : (
                        <>
                            <div className="text-4xl font-black text-white tabular-nums leading-none">
                                {String(timeLeft.hours).padStart(2, "0")}
                                <span className="text-white/30 mx-0.5 animate-pulse">:</span>
                                {String(timeLeft.minutes).padStart(2, "0")}
                                <span className="text-white/30 mx-0.5 animate-pulse">:</span>
                                {String(timeLeft.seconds).padStart(2, "0")}
                            </div>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-1">H : M : S</span>
                        </>
                    )}
                </div>
            </div>

            {/* "Próximo sorteio" pill below the ring */}
            {!isExpired && isEnding && (
                <div className="flex items-center gap-1.5 bg-destructive/20 text-destructive px-3 py-1 rounded-full border border-destructive/30">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-bold uppercase tracking-widest">Encerra em breve</span>
                </div>
            )}
            {!isExpired && !isEnding && (
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Próximo Sorteio</span>
            )}
        </div>
    );
};

interface MempoolLayoutProps {
    totalTickets: number;
    userTickets: number;
    targetDate: string;
    onExpire?: () => void;
    isDrawing?: boolean;
}

// Main layout: circle on top (blocks clipped inside), timer below
export const MempoolLayout: React.FC<MempoolLayoutProps> = ({
    totalTickets,
    userTickets,
    targetDate,
    onExpire,
    isDrawing = false,
}) => {
    return (
        <div className="flex flex-col items-center gap-6">
            {/* CIRCLE — blocks clipped to circle boundary by TicketVisualizer */}
            <div className="w-full max-w-[480px] aspect-square">
                <TicketVisualizer
                    totalTickets={totalTickets}
                    userTickets={userTickets}
                    variant="circular"
                    isDrawing={isDrawing}
                />
            </div>

            {/* TIMER — below the circle, compact ring + numbers */}
            <CircularCountdown targetDate={targetDate} onExpire={onExpire} />

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-green-500">Seus tickets</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-blue-600/60 border border-white/10" />
                    <span className="text-white/50">Outros participantes</span>
                </div>
            </div>
        </div>
    );
};

export const MempoolLayoutSideBySide: React.FC<MempoolLayoutProps> = (props) => {
    return <MempoolLayout {...props} />;
};
