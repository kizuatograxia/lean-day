import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, RefreshControl, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Star, Trophy, Sparkles, MessageSquarePlus, CheckCircle, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FlashList } from "@shopify/flash-list";
import * as Haptics from 'expo-haptics';

const TypedFlashList = FlashList as any;

export default function WinnersScreen() {
    const { data: winners = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['winners_reviews'],
        queryFn: async () => {
            const approvedReviews = await api.getApprovedReviews();
            return approvedReviews.map((r: any) => ({
                id: r.id,
                name: r.userName || r.user_name || "Usuário",
                prize: r.prizeName || r.prize_name || r.raffleName || r.raffle_title || "Prêmio",
                image: r.photoUrl || r.photo_url || "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80",
                avatar: r.userAvatar || r.user_avatar || r.user_picture || "https://i.pravatar.cc/150",
                date: r.createdAt || r.created_at || new Date().toISOString(),
                testimonial: r.comment || r.testimonial || "",
                rating: r.rating || 5,
                verified: true,
                likes: r.likes || Math.floor(Math.random() * 50) + 10,
                prizeImage: r.photoUrl || r.photo_url || r.image_url || "https://images.unsplash.com/photo-1635326444826-06c8f8d2e61d?w=800&q=80"
            })).reverse();
        },
        staleTime: 60000,
    });

    const renderItem = useCallback(({ item }: { item: any }) => (
        <WinnerCard winner={item} />
    ), []);

    const averageRating = winners.length > 0
        ? (winners.reduce((sum: number, w: any) => sum + w.rating, 0) / winners.length).toFixed(1)
        : "5.0";

    const ListHeader = () => (
        <View style={s.headerContent}>
            {/* Hero Section */}
            <View style={s.heroSection}>
                <View style={s.badgeWrap}>
                    <Sparkles size={14} color="#00FF8C" />
                    <Text style={s.badgeText}>Histórias Reais de Ganhadores</Text>
                </View>

                <Text style={s.heroTitle}>Mural dos Ganhadores</Text>
                <Text style={s.heroSub}>
                    Confira quem já está comemorando e junte-se a eles! Veja os depoimentos de quem já ganhou na MundoPix.
                </Text>

                <TouchableOpacity style={s.heroBtn} activeOpacity={0.8} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <MessageSquarePlus size={18} color="#0A0B12" />
                    <Text style={s.heroBtnText}>Enviar meu Depoimento</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Section */}
            {winners.length > 0 && (
                <View style={s.statsRow}>
                    <View style={s.statCard}>
                        <Trophy size={20} color="#00FF8C" style={s.statIcon} />
                        <Text style={s.statValue}>{winners.length}</Text>
                        <Text style={s.statLabel}>Depoimentos</Text>
                    </View>
                    <View style={s.statCard}>
                        <Sparkles size={20} color="#00FF8C" style={s.statIcon} />
                        <Text style={s.statValue}>{averageRating}/5</Text>
                        <Text style={s.statLabel}>Avaliação Média</Text>
                    </View>
                </View>
            )}

            <View style={s.listHeaderRow}>
                <Trophy size={22} color="#00FF8C" />
                <Text style={s.listHeaderTitle}>Depoimentos Recentes</Text>
            </View>
        </View>
    );

    return (
        <ScreenWrapper style={s.root}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }} />

            <TypedFlashList
                data={winners}
                renderItem={renderItem}
                keyExtractor={(item: any) => String(item.id)}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={s.listContent}
                estimatedItemSize={400}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#00FF8C" colors={['#00FF8C']} />
                }
                ListEmptyComponent={
                    !isLoading && winners.length === 0 ? (
                        <View style={s.emptyState}>
                            <Trophy size={48} color="#1f2937" />
                            <Text style={s.emptyText}>Nenhum ganhador recente encontrado.</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={<View style={{ height: 100 }} />}
            />
        </ScreenWrapper>
    );
}

function WinnerCard({ winner }: { winner: any }) {
    const [likes, setLikes] = useState(winner.likes);
    const [liked, setLiked] = useState(false);

    const handleLike = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (liked) {
            setLikes((prev: number) => prev - 1);
        } else {
            setLikes((prev: number) => prev + 1);
        }
        setLiked(!liked);
    };

    const formattedDate = formatDistanceToNow(new Date(winner.date), {
        addSuffix: true,
        locale: ptBR,
    });

    const initials = winner.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

    return (
        <View style={wc.card}>
            {/* Header User Info */}
            <View style={wc.header}>
                <View style={wc.userInfo}>
                    <View style={wc.avatar}>
                        <Image source={{ uri: winner.avatar }} style={wc.avatarImg} />
                    </View>
                    <View>
                        <View style={wc.nameRow}>
                            <Text style={wc.name}>{winner.name}</Text>
                            {winner.verified && <CheckCircle size={14} color="#00FF8C" fill="rgba(0,255,140,0.2)" />}
                        </View>
                        <Text style={wc.date}>{formattedDate}</Text>
                    </View>
                </View>
                <View style={wc.winnerBadge}>
                    <Trophy size={10} color="#00FF8C" style={{ marginRight: 4 }} />
                    <Text style={wc.winnerBadgeText}>Ganhador</Text>
                </View>
            </View>

            {/* Content Space */}
            <View style={wc.content}>
                {/* Prize Image - aspect video */}
                <View style={wc.prizeContainer}>
                    <Image source={{ uri: winner.prizeImage }} style={wc.prizeImg} resizeMode="cover" />
                    <LinearGradient colors={['transparent', 'rgba(10,11,18,0.9)']} style={wc.prizeGradient} />
                    <Text style={wc.prizeTitle} numberOfLines={2}>{winner.prize}</Text>
                </View>

                {/* Rating */}
                <View style={wc.ratingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={14}
                            color={star <= winner.rating ? "#facc15" : "rgba(255,255,255,0.1)"}
                            fill={star <= winner.rating ? "#facc15" : "transparent"}
                        />
                    ))}
                    <Text style={wc.ratingText}>({winner.rating}.0/5)</Text>
                </View>

                {/* Testimonial */}
                <Text style={wc.testimonialText}>"{winner.testimonial}"</Text>
            </View>

            {/* Footer */}
            <View style={wc.footer}>
                <TouchableOpacity style={wc.likeBtn} activeOpacity={0.7} onPress={handleLike}>
                    <Heart
                        size={16}
                        color={liked ? "#ef4444" : "#9ca3af"}
                        fill={liked ? "#ef4444" : "transparent"}
                    />
                    <Text style={[wc.likesText, liked && { color: '#ef4444' }]}>{likes}</Text>
                    <Text style={wc.likeSub}>Parabéns!</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: 'transparent' },
    listContent: { paddingHorizontal: 16, paddingTop: 10 },
    headerContent: { marginBottom: 20 },
    heroSection: { alignItems: 'center', marginBottom: 30, paddingTop: 10 },
    badgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(0,255,140,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,140,0.3)', marginBottom: 20 },
    badgeText: { color: '#00FF8C', fontSize: 12, fontWeight: '600' },
    heroTitle: { fontSize: 32, fontWeight: '900', color: '#00FF8C', textAlign: 'center', marginBottom: 12 },
    heroSub: { fontSize: 15, color: '#9ca3af', textAlign: 'center', marginHorizontal: 20, marginBottom: 24, lineHeight: 22 },
    heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#00FF8C', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, shadowColor: '#00FF8C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    heroBtnText: { color: '#0A0B12', fontSize: 15, fontWeight: '800' },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    statCard: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(31, 41, 55, 0.5)', padding: 16, alignItems: 'center' },
    statIcon: { marginBottom: 8 },
    statValue: { fontSize: 24, fontWeight: '800', color: '#f9fafb' },
    statLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    listHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    listHeaderTitle: { fontSize: 20, fontWeight: '800', color: '#f9fafb' },
    emptyState: { paddingTop: 40, alignItems: 'center', gap: 12 },
    emptyText: { color: '#6b7280', textAlign: 'center' },
});

const wc = StyleSheet.create({
    card: { backgroundColor: 'rgba(20, 24, 39, 0.8)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(31, 41, 55, 0.5)', marginBottom: 20, overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 12 },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(0,255,140,0.3)', backgroundColor: '#1f2937' },
    avatarImg: { width: '100%', height: '100%' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { fontSize: 15, fontWeight: '700', color: '#f9fafb' },
    date: { fontSize: 11, color: '#6b7280', marginTop: 2 },
    winnerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,255,140,0.1)', borderWidth: 1, borderColor: 'rgba(0,255,140,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    winnerBadgeText: { color: '#00FF8C', fontSize: 10, fontWeight: '700' },
    content: { paddingHorizontal: 16, paddingBottom: 16 },
    prizeContainer: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden', position: 'relative', marginBottom: 16 },
    prizeImg: { width: '100%', height: '100%' },
    prizeGradient: { position: 'absolute', inset: 0 },
    prizeTitle: { position: 'absolute', bottom: 12, left: 12, right: 12, color: '#f9fafb', fontSize: 18, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
    ratingText: { color: '#6b7280', fontSize: 13, marginLeft: 6 },
    testimonialText: { color: '#d1d5db', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
    footer: { borderTopWidth: 1, borderTopColor: 'rgba(31, 41, 55, 0.5)', padding: 12, paddingHorizontal: 16 },
    likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    likesText: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
    likeSub: { color: '#6b7280', fontSize: 11, marginLeft: 2 },
});

