import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, Alert, TouchableOpacity, Modal, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ShieldCheck, Award, CalendarClock, TrendingUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../components/providers/AuthProvider';
import { DecorativeBackground } from '../../components/DecorativeBackground';
import { RaffleHero } from '../../components/raffle/RaffleHero';
import { RaffleStatsBar } from '../../components/raffle/RaffleStatsBar';
import { RaffleProgress } from '../../components/raffle/RaffleProgress';
import { RaffleCheckoutBar } from '../../components/raffle/RaffleCheckoutBar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Gem, PlusCircle, MinusCircle, QrCode, Copy, Check, X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

export default function RaffleDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [joining, setJoining] = useState(false);
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    // Checkout Modal States
    const [showModal, setShowModal] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState<'nfts' | 'pix' | 'processing' | 'success'>('nfts');
    const [selectedNFTs, setSelectedNFTs] = useState<Record<string, number>>({});
    const [pixData, setPixData] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const { data: raffle, isLoading } = useQuery({
        queryKey: ['raffle', id],
        queryFn: () => api.getRaffle(id).catch(() => null),
    });

    const { data: ownedNFTs = [], isLoading: isLoadingNFTs } = useQuery({
        queryKey: ['owned-nfts', user?.id],
        queryFn: () => user ? api.getWallet(Number(user.id)).catch(() => []) : [],
        enabled: !!user,
    });

    if (isLoading) {
        return (
            <View style={s.centered}>
                <DecorativeBackground />
                <Text style={s.loadingText}>Carregando sorteio...</Text>
            </View>
        );
    }

    if (!raffle) {
        return (
            <View style={s.centered}>
                <DecorativeBackground />
                <Text style={s.loadingText}>Sorteio não encontrado.</Text>
            </View>
        );
    }

    const progress = Math.min((raffle.participantes / raffle.maxParticipantes) * 100, 100);
    const custo = typeof raffle.custoNFT === 'number' ? raffle.custoNFT : 0;
    const imageUri = raffle.imagem || raffle.image_urls?.[0] || 'https://placehold.co/600x400/111827/00FF8C';
    const isAlmostFull = progress >= 80;
    const rawDate = raffle.dataFim;
    const endDate = rawDate ? new Date(rawDate) : null;
    const isValidDate = endDate && !isNaN(endDate.getTime());
    const currentChance = raffle.maxParticipantes > 0
        ? ((1 / (raffle.maxParticipantes - raffle.participantes || 1)) * 100).toFixed(2)
        : '0';

    const finalPrice = Math.max(0, (custo * quantity) -
        Object.entries(selectedNFTs).reduce((acc, [id, qty]: [string, any]) => {
            const nft = ownedNFTs.find((n: any) => n.id === id);
            return acc + (nft ? Math.min(custo, (nft.preco || 0)) * qty : 0); // Desconto baseado no preço do NFT ou limitação pelo custo da cota
        }, 0)
    );

    const handleOpenCheckout = () => {
        if (!user) {
            Alert.alert('Login necessário', 'Entre na sua conta para participar.');
            return;
        }
        setSelectedNFTs({});
        setPixData(null);
        setCheckoutStep('nfts');
        setShowModal(true);
    };

    const handleConfirmNFTs = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (finalPrice > 0) {
            setCheckoutStep('processing');
            try {
                // Generates PIX pretending NFTs are cart items reducing price
                const data = await api.createPayment(user!.id, finalPrice, [{ id: 'raffle_entry', quantity }]);
                setPixData({
                    qrCode: data.qrCodeBase64 ? `data:image/png;base64,${data.qrCodeBase64}` : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data.qrCode)}`,
                    copyPasteCode: data.copyPaste,
                    transactionId: data.transactionId,
                });
                setCheckoutStep('pix');
            } catch (error: any) {
                Alert.alert("Erro no Pagamento", error.message || "Não foi possível gerar o PIX.");
                setCheckoutStep('nfts');
            }
        } else {
            // Direct join if 100% discount
            executeJoin();
        }
    };

    const executeJoin = async () => {
        setCheckoutStep('processing');
        try {
            await api.joinRaffle(Number(id), Number(user!.id), selectedNFTs, quantity);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setCheckoutStep('success');
        } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Erro', err.message || 'Não foi possível participar. Tente novamente.');
            setCheckoutStep('nfts');
        }
    };

    const handleCopy = async () => {
        if (pixData) {
            await Clipboard.setStringAsync(pixData.copyPasteCode);
            setCopied(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" />
            <DecorativeBackground />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <RaffleHero imageUri={imageUri} onBack={() => router.back()} />

                {/* Content */}
                <View style={s.content}>
                    {/* Status badge */}
                    <View style={s.statusRow}>
                        <View style={[s.statusBadge, raffle.status !== 'ativo' && s.statusInactive]}>
                            <View style={[s.statusDot, raffle.status !== 'ativo' && { backgroundColor: '#6b7280' }]} />
                            <Text style={[s.statusText, raffle.status !== 'ativo' && { color: '#6b7280' }]}>
                                {raffle.status === 'ativo' ? 'SORTEIO ATIVO' : 'ENCERRADO'}
                            </Text>
                        </View>
                        <Text style={s.soldCount}>+{raffle.participantes} vendidos</Text>
                    </View>

                    {/* Title & Prize */}
                    <Text style={s.title}>{raffle.titulo}</Text>
                    <Text style={s.prizeLabel}>{raffle.premio}</Text>

                    {/* Price */}
                    <View style={s.priceCard}>
                        <Text style={s.priceValue}>R$ {custo.toFixed(2)}</Text>
                        <Text style={s.installments}>
                            em 10x R$ {(custo / 10).toFixed(2)} sem juros
                        </Text>
                    </View>

                    {/* Stats */}
                    <RaffleStatsBar
                        participantes={raffle.participantes}
                        maxParticipantes={raffle.maxParticipantes}
                        endDate={endDate}
                        isValidDate={!!isValidDate}
                    />

                    {/* Progress */}
                    <RaffleProgress progress={progress} isAlmostFull={isAlmostFull} />

                    {/* Note: NFT Selection was moved to the Checkout Modal */}

                    {/* Quick Info */}
                    <View style={s.infoCard}>
                        <Text style={s.infoTitle}>Informações do Sorteio</Text>
                        <InfoRow icon={<Award size={14} color="#00FF8C" />} label="Prêmio Total" value={`R$ ${raffle.premioValor?.toLocaleString('pt-BR') ?? '—'}`} />
                        <InfoRow icon={<TrendingUp size={14} color="#00FF8C" />} label="Oportunidade Atual" value={`${currentChance}%`} />
                        <InfoRow
                            icon={<CalendarClock size={14} color="#00FF8C" />}
                            label="Encerramento"
                            value={isValidDate ? format(endDate!, "dd 'de' MMMM, yyyy", { locale: ptBR }) : '—'}
                        />
                    </View>

                    {/* Highlights */}
                    <View style={s.highlightsCard}>
                        <Text style={s.infoTitle}>O que você precisa saber</Text>
                        {['Prêmio de luxo verificado', 'Sorteio auditado pela blockchain', 'Entrega digital imediata na carteira', 'Participação garantida ou reembolso'].map((item, i) => (
                            <View key={i} style={s.bulletRow}>
                                <Text style={s.bullet}>•</Text>
                                <Text style={s.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Description */}
                    {raffle.descricao ? (
                        <View style={s.descCard}>
                            <Text style={s.infoTitle}>Descrição</Text>
                            <Text style={s.descText} numberOfLines={isDescExpanded ? undefined : 4}>
                                {raffle.descricao}
                            </Text>
                            {raffle.descricao.length > 120 && (
                                <Text
                                    style={s.readMore}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setIsDescExpanded(!isDescExpanded);
                                    }}
                                >
                                    {isDescExpanded ? 'Ver menos' : 'Ver mais'}
                                </Text>
                            )}
                        </View>
                    ) : null}

                    {/* Guarantee */}
                    <View style={s.guaranteeCard}>
                        <ShieldCheck size={18} color="#00FF8C" />
                        <Text style={s.guaranteeText}>
                            Compra Garantida — receba o bilhete que está esperando ou devolvemos suas NFTs.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <RaffleCheckoutBar
                quantity={quantity}
                setQuantity={setQuantity}
                custo={custo}
                joining={checkoutStep === 'processing'}
                onJoin={handleOpenCheckout}
            />

            {/* Checkout Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Finalizar Participação</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} style={s.modalClose}>
                                <X size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {checkoutStep === 'nfts' && (
                            <ScrollView style={{ maxHeight: 400 }}>
                                <View style={s.modalBody}>
                                    <Text style={s.modalSub}>Sua compra: {quantity} cota(s) — R$ {(custo * quantity).toFixed(2)}</Text>

                                    {ownedNFTs.length > 0 ? (
                                        <>
                                            <View style={s.nftSelectionHeader}>
                                                <Gem size={18} color="#00FF8C" />
                                                <Text style={s.infoTitle}>Usar Meus NFTs para Desconto</Text>
                                            </View>

                                            <View style={s.modalGrid}>
                                                {ownedNFTs.map((nft: any) => {
                                                    const available = nft.quantidade || 1;
                                                    const selected = selectedNFTs[nft.id] || 0;
                                                    const isSelected = selected > 0;
                                                    return (
                                                        <TouchableOpacity
                                                            key={nft.id}
                                                            style={[s.modalNftCard, isSelected && s.modalNftCardActive]}
                                                            onPress={() => {
                                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                                setSelectedNFTs((prev: Record<string, number>) => {
                                                                    const next = { ...prev };
                                                                    if (next[nft.id] && next[nft.id] >= available) {
                                                                        delete next[nft.id];
                                                                    } else {
                                                                        next[nft.id] = (next[nft.id] || 0) + 1;
                                                                    }
                                                                    return next;
                                                                });
                                                            }}
                                                        >
                                                            <View style={s.nftPickImgWrap}>
                                                                {nft.image ? <Image source={{ uri: nft.image }} style={{ width: 32, height: 32 }} /> : <Text style={{ fontSize: 24 }}>{nft.emoji}</Text>}
                                                            </View>
                                                            <Text style={s.modalNftName} numberOfLines={1}>{nft.nome}</Text>
                                                            <Text style={s.modalNftAvailable}>Disp: {available}</Text>
                                                            {isSelected && (
                                                                <View style={s.modalNftBadge}>
                                                                    <Text style={s.modalNftBadgeText}>{selected}x</Text>
                                                                </View>
                                                            )}
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </>
                                    ) : (
                                        <View style={s.emptyWallet}>
                                            <Text style={s.emptyWalletText}>Sua carteira de NFTs está vazia.</Text>
                                        </View>
                                    )}

                                    <View style={s.modalFooter}>
                                        <View style={s.modalTotalRow}>
                                            <Text style={s.modalTotalLabel}>Total a Pagar</Text>
                                            <Text style={s.modalTotalValue}>R$ {finalPrice.toFixed(2)}</Text>
                                        </View>
                                        <TouchableOpacity style={s.modalBtn} onPress={handleConfirmNFTs}>
                                            <Text style={s.modalBtnText}>{finalPrice > 0 ? 'Gerar PIX' : 'Concluir Resgate'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        )}

                        {checkoutStep === 'processing' && (
                            <View style={s.processingView}>
                                <ActivityIndicator size="large" color="#00FF8C" />
                                <Text style={s.processingText}>Processando...</Text>
                            </View>
                        )}

                        {checkoutStep === 'pix' && pixData && (
                            <View style={s.pixSection}>
                                <View style={s.pixHeader}>
                                    <QrCode size={24} color="#00FF8C" />
                                    <Text style={s.modalTitle}>Pague via PIX</Text>
                                </View>
                                <View style={s.qrWrapper}>
                                    <Image source={{ uri: pixData.qrCode }} style={s.qrImage} />
                                </View>
                                <View style={s.copySection}>
                                    <Text style={s.copyLabel}>Copia e Cola</Text>
                                    <View style={s.copyRow}>
                                        <Text style={s.copyText} numberOfLines={1}>{pixData.copyPasteCode}</Text>
                                        <TouchableOpacity onPress={handleCopy} style={s.copyBtn}>
                                            {copied ? <Check size={20} color="#00FF8C" /> : <Copy size={20} color="#f9fafb" />}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <TouchableOpacity style={s.simulateBtn} onPress={executeJoin}>
                                    <Text style={s.simulateText}>Simular Pagamento Confirmado</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {checkoutStep === 'success' && (
                            <View style={s.successView}>
                                <View style={s.successIconWrap}>
                                    <Check size={40} color="#0A0B12" />
                                </View>
                                <Text style={s.successTitle}>Sucesso!</Text>
                                <Text style={s.successSub}>Você está concorrendo a {quantity} cota(s).</Text>
                                <TouchableOpacity style={s.modalBtn} onPress={() => { setShowModal(false); router.replace('/(tabs)/profile'); }}>
                                    <Text style={s.modalBtnText}>Ver Meus Sorteios</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <View style={s.infoRow}>
        {icon}
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
    </View>
);

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#0A0B12' },
    centered: { flex: 1, backgroundColor: '#0A0B12', alignItems: 'center', justifyContent: 'center' },
    loadingText: { color: '#6b7280', fontSize: 14 },
    content: { paddingHorizontal: 16, marginTop: -40 },

    // Status
    statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(0,255,140,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,140,0.3)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    },
    statusInactive: { backgroundColor: 'rgba(107,114,128,0.1)', borderColor: 'rgba(107,114,128,0.3)' },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF8C' },
    statusText: { color: '#00FF8C', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    soldCount: { color: '#6b7280', fontSize: 12 },

    // Title
    title: { color: '#f9fafb', fontSize: 22, fontWeight: '800', lineHeight: 28, marginBottom: 4 },
    prizeLabel: { color: '#00FF8C', fontSize: 14, fontWeight: '600', marginBottom: 16 },

    // Price
    priceCard: {
        backgroundColor: 'rgba(17,24,39,0.55)', borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(31,41,55,0.6)',
        padding: 16, marginBottom: 20,
    },
    priceValue: { color: '#f9fafb', fontSize: 34, fontWeight: '300', letterSpacing: -1 },
    installments: { color: '#00FF8C', fontSize: 14, fontWeight: '600', marginTop: 4 },

    // Info card
    infoCard: {
        backgroundColor: 'rgba(17,24,39,0.55)', borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(31,41,55,0.6)',
        padding: 16, marginBottom: 20,
    },
    infoTitle: { color: '#f9fafb', fontSize: 15, fontWeight: '700', marginBottom: 12 },
    infoRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(31,41,55,0.4)',
    },
    infoLabel: { color: '#9ca3af', fontSize: 13, flex: 1 },
    infoValue: { color: '#f9fafb', fontSize: 13, fontWeight: '600' },

    // Modal & PIX
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, borderWidth: 1, borderColor: '#1f2937' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#f9fafb', fontSize: 18, fontWeight: '800' },
    modalClose: { padding: 4, backgroundColor: '#1f2937', borderRadius: 20 },
    modalBody: { gap: 16 },
    modalSub: { color: '#9ca3af', fontSize: 14, marginBottom: 8 },
    nftSelectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 4 },
    modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    modalNftCard: { width: '31%', backgroundColor: 'rgba(31,41,55,0.4)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    modalNftCardActive: { borderColor: '#00FF8C', backgroundColor: 'rgba(0,255,140,0.05)' },
    nftPickImgWrap: { height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    modalNftName: { color: '#f9fafb', fontSize: 11, fontWeight: '700', textAlign: 'center' },
    modalNftAvailable: { color: '#6b7280', fontSize: 9, marginTop: 4 },
    modalNftBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#00FF8C', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
    modalNftBadgeText: { color: '#0A0B12', fontSize: 10, fontWeight: '900' },
    emptyWallet: { padding: 20, backgroundColor: 'rgba(31,41,55,0.3)', borderRadius: 12, alignItems: 'center' },
    emptyWalletText: { color: '#6b7280', fontSize: 13 },
    modalFooter: { borderTopWidth: 1, borderTopColor: '#1f2937', paddingTop: 16, marginTop: 10 },
    modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTotalLabel: { color: '#f9fafb', fontSize: 14, fontWeight: '700' },
    modalTotalValue: { color: '#00FF8C', fontSize: 24, fontWeight: '900' },
    modalBtn: { backgroundColor: '#00FF8C', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
    modalBtnText: { color: '#0A0B12', fontSize: 16, fontWeight: '800' },
    processingView: { paddingVertical: 40, alignItems: 'center', gap: 16 },
    processingText: { color: '#00FF8C', fontSize: 16, fontWeight: '600' },
    successView: { paddingVertical: 20, alignItems: 'center', gap: 12 },
    successIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#00FF8C', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    successTitle: { color: '#f9fafb', fontSize: 24, fontWeight: '800' },
    successSub: { color: '#9ca3af', fontSize: 14, marginBottom: 20 },

    // Copy Pix
    pixSection: { paddingVertical: 10 },
    pixHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    qrWrapper: { backgroundColor: '#fff', padding: 16, borderRadius: 20, alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
    qrImage: { width: 180, height: 180 },
    copySection: { marginBottom: 24 },
    copyLabel: { color: '#6b7280', fontSize: 12, marginBottom: 8 },
    copyRow: { flexDirection: 'row', backgroundColor: '#0A0B12', borderRadius: 12, padding: 10, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#1f2937' },
    copyText: { flex: 1, color: '#6b7280', fontSize: 12, fontFamily: 'monospace' },
    copyBtn: { padding: 8, backgroundColor: '#1f2937', borderRadius: 8 },
    simulateBtn: { borderStyle: 'dotted', borderWidth: 1, borderColor: '#4b5563', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    simulateText: { color: '#f9fafb', fontSize: 13, fontWeight: '700' },
    // Highlights
    highlightsCard: {
        backgroundColor: 'rgba(17,24,39,0.55)', borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(31,41,55,0.6)',
        padding: 16, marginBottom: 20,
    },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
    bullet: { color: '#00FF8C', fontSize: 16, lineHeight: 20 },
    bulletText: { color: '#9ca3af', fontSize: 13, lineHeight: 20, flex: 1 },

    // Description
    descCard: {
        backgroundColor: 'rgba(17,24,39,0.55)', borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(31,41,55,0.6)',
        padding: 16, marginBottom: 20,
    },
    descText: { color: '#6b7280', fontSize: 14, lineHeight: 22 },
    readMore: { color: '#00FF8C', fontSize: 13, fontWeight: '700', marginTop: 8 },

    // Guarantee
    guaranteeCard: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(0,255,140,0.06)', borderRadius: 16,
        padding: 14, borderWidth: 1, borderColor: 'rgba(0,255,140,0.15)',
        marginBottom: 20,
    },
    guaranteeText: { color: '#9ca3af', fontSize: 13, flex: 1, lineHeight: 18 },
});
