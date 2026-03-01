import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Ticket, Trophy, Target, Info, CheckCircle2, Minus, Plus, Loader2, Share2, ShoppingCart, Activity, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useUserRaffles } from "@/contexts/UserRafflesContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { OwnedNFT } from "@/types/raffle";
import { Progress } from "@/components/ui/progress";
import { TicketVisualizer } from "@/components/TicketVisualizer";

const rarityColors: Record<string, string> = {
    comum: "from-gray-400 to-gray-500",
    raro: "from-blue-400 to-cyan-500",
    epico: "from-purple-400 to-pink-500",
    lendario: "from-yellow-400 to-orange-500",
};

// Circular countdown component
const CircularCountdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 });

    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const end = new Date(targetDate).getTime();
            const diff = Math.max(0, end - now);

            // Assume raffle started 30 days before end
            const totalDuration = 30 * 24 * 60 * 60 * 1000;
            const elapsed = totalDuration - diff;
            const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, progress });
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    const isEnding = timeLeft.days === 0 && timeLeft.hours < 1;
    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference * (1 - timeLeft.progress);

    return (
        <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center relative overflow-hidden">
            {/* Ending soon badge */}
            {isEnding && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-destructive/20 text-destructive px-2.5 py-1 rounded-full text-xs font-bold border border-destructive/30">
                    <Clock className="w-3 h-3" />
                    ENCERRA EM BREVE
                </div>
            )}

            <h3 className="text-base font-bold text-foreground mb-6">
                O Próximo Ganhador Será Definido em...
            </h3>

            {/* Circular Progress */}
            <div className="relative w-52 h-52 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    {/* Background track */}
                    <circle
                        cx="100" cy="100" r="90"
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth="8"
                    />
                    {/* Progress arc */}
                    <circle
                        cx="100" cy="100" r="90"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>
                {/* Time display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {timeLeft.days > 0 ? (
                        <>
                            <div className="text-5xl font-black text-foreground tracking-tight tabular-nums">
                                {String(timeLeft.days).padStart(2, "0")}
                                <span className="text-muted-foreground mx-1">:</span>
                                {String(timeLeft.hours).padStart(2, "0")}
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                DIAS RESTANTES
                            </span>
                        </>
                    ) : (
                        <>
                            <div className="text-5xl font-black text-foreground tracking-tight tabular-nums">
                                {String(timeLeft.hours).padStart(2, "0")}
                                <span className="text-muted-foreground mx-1 animate-pulse">:</span>
                                {String(timeLeft.minutes).padStart(2, "0")}
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                MINUTOS RESTANTES
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 w-full mt-2">
                <Button variant="hero" className="flex-1 h-12 text-base font-bold gap-2" onClick={() => {
                    document.getElementById("nft-selection")?.scrollIntoView({ behavior: "smooth" });
                }}>
                    <ShoppingCart className="w-4 h-4" />
                    Comprar Tickets
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copiado!");
                }}>
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

// Activity Feed component
const ActivityFeed: React.FC<{ raffleId: string }> = ({ raffleId }) => {
    const mockActivity = [
        { name: "João D.", action: "+3 tickets comprados", time: "2m", isYou: false },
        { name: "Maria A.", action: "+10 tickets (Bulk)", time: "5m", isYou: false },
        { name: "Você", action: "Entrada confirmada (4 tickets)", time: "12m", isYou: true },
        { name: "Pedro S.", action: "+1 ticket comprado", time: "18m", isYou: false },
        { name: "Ana L.", action: "+5 tickets (Bulk)", time: "25m", isYou: false },
    ];

    return (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Atividade Recente
            </h3>
            <div className="space-y-3">
                {mockActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.isYou ? "bg-primary" : "bg-muted-foreground/40"
                            }`} />
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${item.isYou ? "text-primary" : "text-foreground"}`}>
                                {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.action}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RaffleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { ownedNFTs, removeNFT, refreshWallet } = useWallet();
    const { addUserRaffle, getUserValue } = useUserRaffles();

    const [selectedNFTs, setSelectedNFTs] = useState<Record<string, number>>({});
    const [raffle, setRaffle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeImage, setActiveImage] = useState<string>("");

    useEffect(() => {
        if (id) {
            api.getRaffle(id)
                .then(data => {
                    const mapped = {
                        id: String(data.id),
                        titulo: data.title,
                        descricao: data.description,
                        imagem: data.image_url && !data.image_url.includes('example.com')
                            ? data.image_url
                            : "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80",
                        status: data.status === 'active' ? 'ativo' : 'encerrado',
                        premio: data.prize_pool,
                        premioValor: data.prize_value || 0,
                        dataFim: data.draw_date || "2024-12-31",
                        custoNFT: data.ticket_price,
                        participantes: parseInt(data.tickets_sold) || 0,
                        categoria: "geral",
                        raridade: "comum",
                        emoji: "🎫",
                        image_urls: data.image_urls || [],
                        winner: data.winner_name ? {
                            name: data.winner_name,
                            picture: data.winner_picture
                        } : undefined
                    };
                    setRaffle(mapped);
                    setActiveImage(mapped.imagem);
                })
                .catch(err => {
                    console.error("Error fetching raffle", err);
                    toast.error("Erro ao carregar sorteio. Tente novamente.");
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const userCurrentValue = raffle ? getUserValue(raffle.id) : 0;
    const availableNFTs = ownedNFTs.filter(nft => nft.quantidade > 0);

    const handleQuantityChange = (nftId: string, delta: number, max: number) => {
        setSelectedNFTs(prev => {
            const current = prev[nftId] || 0;
            const next = Math.max(0, Math.min(max, current + delta));
            const newState = { ...prev, [nftId]: next };
            if (next === 0) delete newState[nftId];
            return newState;
        });
    };

    const toggleSelection = (nftId: string, max: number) => {
        setSelectedNFTs(prev => {
            const current = prev[nftId] || 0;
            if (current > 0) {
                const newState = { ...prev };
                delete newState[nftId];
                return newState;
            } else {
                return { ...prev, [nftId]: 1 };
            }
        });
    };

    const selectionStats = useMemo(() => {
        let count = 0;
        let value = 0;
        availableNFTs.forEach(nft => {
            const qty = selectedNFTs[nft.id] || 0;
            count += qty;
            value += qty * nft.preco;
        });
        return { count, value };
    }, [availableNFTs, selectedNFTs]);

    const calculateChance = (userVal: number) => {
        const prizeValue = raffle?.premioValor || 0;
        if (prizeValue === 0) return 0;
        const chance = (userVal / prizeValue) * 75;
        return Math.min(chance, 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!raffle) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-foreground">Sorteio não encontrado</h1>
                    <Button onClick={() => navigate("/")} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar ao início
                    </Button>
                </div>
            </div>
        );
    }

    const { count: selectedCount, value: selectedValue } = selectionStats;
    const currentChance = calculateChance(userCurrentValue);
    const potentialChance = calculateChance(userCurrentValue + selectedValue);
    const ticketPrice = raffle.custoNFT;
    const ticketsToReceive = Math.floor(selectedValue / ticketPrice);
    const targetRevenue = (raffle.premioValor || 5000) * 1.5;
    const currentRevenue = (raffle.participantes * ticketPrice);
    const revenueProgress = Math.min((currentRevenue / targetRevenue) * 100, 100);

    // User tickets calculation (for visualizer)
    const userTickets = ticketPrice > 0 ? Math.floor(userCurrentValue / ticketPrice) : 0;

    const handleParticipate = async () => {
        if (isProcessing) return;
        if (raffle.status !== 'ativo') {
            toast.error("Este sorteio já foi encerrado!");
            return;
        }
        if (selectedCount === 0) {
            toast.error("Selecione pelo menos 1 NFT para participar");
            return;
        }
        if (ticketsToReceive === 0) {
            toast.error(`O valor selecionado (R$ ${selectedValue.toFixed(2)}) é insuficiente para um bilhete (R$ ${ticketPrice})`);
            return;
        }
        setIsProcessing(true);
        try {
            await addUserRaffle(raffle, ticketsToReceive, selectedValue, selectedNFTs);
            setRaffle((prev: any) => ({ ...prev, participantes: prev.participantes + ticketsToReceive }));
            await refreshWallet();
            setSelectedNFTs({});
            try {
                const data = await api.getRaffle(raffle.id);
                if (data && data.tickets_sold) {
                    setRaffle((prev: any) => ({ ...prev, participantes: parseInt(data.tickets_sold) || 0 }));
                }
            } catch (error) { console.error("Failed to refresh raffle stats", error); }
            toast.success(`Você entrou no sorteio com ${ticketsToReceive} Bilhetes!`, {
                description: `Valor total adicionado: R$ ${selectedValue.toFixed(2)}`,
            });
        } catch (error) {
            console.error("Erro ao participar do sorteio", error);
            toast.error("Ocorreu um erro ao processar sua participação. Tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="hover:text-foreground cursor-pointer" onClick={() => navigate("/sorteios")}>Sorteios</span>
                            <span>/</span>
                            <span className="text-foreground font-medium truncate max-w-[200px]">{raffle.titulo}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Sorteio Ao Vivo
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Title */}
            <div className="container mx-auto px-4 pt-6 pb-2">
                <h1 className="text-2xl md:text-3xl font-black text-foreground">{raffle.titulo}</h1>
                <p className="text-muted-foreground mt-1">{raffle.descricao}</p>
            </div>

            <main className="container mx-auto px-4 py-6">
                {/* WINNER CARD */}
                {raffle.status === 'encerrado' && raffle.winner && (
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-6 flex items-center gap-6 animate-fade-in shadow-[0_0_30px_rgba(234,179,8,0.2)] mb-8">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-75 animate-pulse"></div>
                            <img src={raffle.winner.picture} alt={raffle.winner.name} className="relative w-20 h-20 rounded-full border-2 border-white object-cover shadow-xl" />
                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-full shadow-lg border border-white">
                                <Trophy className="w-4 h-4" fill="black" />
                            </div>
                        </div>
                        <div>
                            <p className="text-yellow-500 font-bold uppercase tracking-wider text-xs mb-1">Grande Vencedor</p>
                            <h2 className="text-2xl font-bold text-foreground mb-1">{raffle.winner.name}</h2>
                        </div>
                    </div>
                )}

                {/* Main 3-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: Countdown + Prize + Image */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Countdown */}
                        {raffle.status === 'ativo' && (
                            <CircularCountdown targetDate={raffle.dataFim} />
                        )}

                        {/* Prize Card */}
                        <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-3xl flex-shrink-0">
                                🎁
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">Grande Prêmio</span>
                                <h3 className="font-bold text-foreground text-base leading-tight truncate">{raffle.premio}</h3>
                                <p className="text-sm text-muted-foreground">Valor estimado: R$ {raffle.premioValor.toLocaleString("pt-BR")}</p>
                            </div>
                        </div>

                        {/* Chance Card */}
                        <div className="bg-gradient-to-br from-purple-600/30 to-blue-600/20 rounded-2xl border border-purple-500/20 p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-400" />
                                    <span className="font-bold text-sm text-foreground">Sua Chance</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-muted-foreground">Tickets</span>
                                    <p className="font-bold text-foreground">{userTickets}</p>
                                </div>
                            </div>
                            <p className="text-4xl font-black text-primary">
                                {currentChance.toFixed(1)}%
                            </p>
                            <Progress value={currentChance} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                                Você tem mais chances que {Math.min(Math.round(currentChance * 10), 99)}% dos participantes.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Ticket Visualizer + Stats + Activity */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Ticket Visualizer (Mempool-style) */}
                        <TicketVisualizer
                            totalTickets={Math.max(raffle.participantes, 50)}
                            userTickets={userTickets}
                        />

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-card rounded-2xl border border-border p-4 text-center">
                                <Users className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-2xl font-black text-foreground">{raffle.participantes}</p>
                                <p className="text-xs text-muted-foreground">Participantes</p>
                            </div>
                            <div className="bg-card rounded-2xl border border-border p-4 text-center">
                                <Hash className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-2xl font-black text-foreground">
                                    #{userTickets > 0 ? Math.max(1, Math.floor(raffle.participantes * 0.3)) : "—"}
                                </p>
                                <p className="text-xs text-muted-foreground">Seu Rank</p>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <ActivityFeed raffleId={raffle.id} />
                    </div>
                </div>

                {/* NFT SELECTION SECTION (below the main grid) */}
                <div id="nft-selection" className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* NFT List */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-primary" />
                            Escolha seus Ingressos (NFTs)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Selecione quais NFTs deseja usar para entrar no sorteio. Quanto maior o valor dos NFTs, maior sua chance de ganhar!
                        </p>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {availableNFTs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground bg-secondary/30 rounded-xl border border-dashed border-border">
                                    <p>Você não possui NFTs disponíveis.</p>
                                    <Button variant="link" onClick={() => navigate("/")}>Comprar NFTs</Button>
                                </div>
                            ) : (
                                availableNFTs.map(nft => {
                                    const isSelected = (selectedNFTs[nft.id] || 0) > 0;
                                    const qtySelected = selectedNFTs[nft.id] || 0;
                                    return (
                                        <div
                                            key={nft.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected
                                                ? "bg-primary/10 border-primary shadow-[0_0_0_1px_hsl(var(--primary))]"
                                                : "bg-background border-border hover:border-primary/50"
                                                }`}
                                            onClick={() => toggleSelection(nft.id, nft.quantidade)}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}`}>
                                                {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                                            </div>
                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${rarityColors[nft.raridade]} flex items-center justify-center text-2xl shadow-sm`}>
                                                {nft.emoji}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-sm truncate">{nft.nome}</h4>
                                                    <span className="text-sm font-bold text-primary">R$ {nft.preco.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-xs text-muted-foreground capitalize">{nft.raridade}</span>
                                                    <span className="text-xs text-muted-foreground">Disp: {nft.quantidade}</span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-1 shadow-sm" onClick={e => e.stopPropagation()}>
                                                    <button className="p-1 hover:bg-secondary rounded-md transition-colors disabled:opacity-50" onClick={() => handleQuantityChange(nft.id, -1, nft.quantidade)} disabled={qtySelected <= 0}>
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="text-xs font-bold w-4 text-center">{qtySelected}</span>
                                                    <button className="p-1 hover:bg-secondary rounded-md transition-colors disabled:opacity-50" onClick={() => handleQuantityChange(nft.id, 1, nft.quantidade)} disabled={qtySelected >= nft.quantidade}>
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Summary Panel */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-lg space-y-4 h-fit lg:sticky lg:top-20">
                        <h3 className="font-bold text-lg">Resumo da Participação</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">NFTs Selecionados</span>
                                <span className="font-bold">{selectedCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Valor Total Contribuição</span>
                                <span className="font-bold text-primary">R$ {selectedValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-dashed border-border pt-2">
                                <span className="text-muted-foreground">Bilhetes a Receber</span>
                                <span className="font-bold text-primary">{ticketsToReceive}</span>
                            </div>
                            <div className="h-px bg-border my-2" />
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-sm">Nova Chance Estimada</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm line-through decoration-destructive">
                                        {currentChance.toFixed(2)}%
                                    </span>
                                    <span className="text-xl font-black text-primary">
                                        {potentialChance.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="hero"
                            size="lg"
                            className="w-full text-lg py-6 shadow-xl shadow-primary/20"
                            onClick={handleParticipate}
                            disabled={selectedCount === 0 || raffle.status !== "ativo" || isProcessing}
                        >
                            {isProcessing ? (
                                <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processando...</>
                            ) : (
                                <><Ticket className="h-5 w-5 mr-2" />Confirmar Entrada (R$ {selectedValue.toFixed(2)})</>
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            Ao confirmar, os NFTs selecionados serão convertidos em bilhetes proporcionalmente ao seu valor.
                            (1 Bilhete = R$ {ticketPrice})
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RaffleDetails;
