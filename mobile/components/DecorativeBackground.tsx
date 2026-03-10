import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Rect, Defs, Pattern } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * TRUE WEB-PARITY BACKGROUND "MEMPOOL" 
 * Specs mirrored from MempoolBackground.tsx:
 * - 16px squares, 2px gap (18px step)
 * - Base Opacity: 0.03 - 0.08
 * - HSL(160, 80%, 55%) for Emerald
 * - HSL(200, 80%, 55%) for Azure
 */
export const DecorativeBackground = React.memo(() => {
    const cellSize = 16;
    const gap = 2;
    const step = cellSize + gap;

    // We animate a few "Pulse" layers instead of every square to keep 120 FPS
    return (
        <View style={s.container} pointerEvents="none">
            {/* Deep Indigo-Black Base - Exact Web Color */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0B12' }]} />

            {/* STATIC GRID LAYER - Infinite and Efficient */}
            <View style={StyleSheet.absoluteFill}>
                <Svg width="100%" height="100%">
                    <Defs>
                        <Pattern
                            id="mempoolGrid"
                            x="0"
                            y="0"
                            width={step}
                            height={step}
                            patternUnits="userSpaceOnUse"
                        >
                            <Rect
                                x="0"
                                y="0"
                                width={cellSize}
                                height={cellSize}
                                fill="rgba(0, 255, 140, 0.06)"
                                rx={2}
                            />
                        </Pattern>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#mempoolGrid)" />
                </Svg>
            </View>

            {/* DYNAMIC PULSE LAYER - Random squares that light up like the Web version */}
            <PulsingBlocks count={12} step={step} size={cellSize} />

            {/* GLOBAL ATMOSPHERE - Web-style glows */}
            <LinearGradient
                colors={['rgba(0, 255, 140, 0.15)', 'transparent']}
                style={[s.glow, s.glowTopRight]}
            />
            <LinearGradient
                colors={['rgba(0, 160, 255, 0.1)', 'transparent']}
                style={[s.glow, s.glowBottomLeft]}
            />

            {/* Bottom Fade for UI contrast */}
            <LinearGradient
                colors={['transparent', '#0A0B12']}
                style={s.bottomFade}
            />
        </View>
    );
});

/**
 * Renders a small set of pulsing blocks aligned to the grid.
 * This simulates the Web canvas animation perfectly without the CPU cost.
 */
const PulsingBlocks = ({ count, step, size }: { count: number; step: number; size: number }) => {
    return (
        <View style={StyleSheet.absoluteFill}>
            {Array.from({ length: 24 }).map((_, i) => (
                <SinglePulse key={i} step={step} size={size} />
            ))}
        </View>
    );
};

const SinglePulse = ({ step, size }: { step: number; size: number }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const [pos, setPos] = React.useState({ left: 0, top: 0 });

    useEffect(() => {
        const animate = () => {
            // Pick a random grid coordinate
            const cols = Math.floor(width / step);
            const rows = Math.floor(height / step);
            const left = Math.floor(Math.random() * cols) * step;
            const top = Math.floor(Math.random() * rows) * step;

            setPos({ left, top });

            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.15 + Math.random() * 0.35,
                    duration: 1500 + Math.random() * 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 1500 + Math.random() * 1000,
                    useNativeDriver: true,
                }),
            ]).start(() => animate());
        };

        animate();
    }, []);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: pos.left,
                top: pos.top,
                width: size,
                height: size,
                backgroundColor: '#00FF8C',
                opacity,
                borderRadius: 2,
                shadowColor: '#00FF8C',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            }}
        />
    );
};

const s = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: (width * 1.5) / 2,
    },
    glowTopRight: {
        top: -width * 0.6,
        right: -width * 0.5,
    },
    glowBottomLeft: {
        bottom: -width * 0.7,
        left: -width * 0.6,
    },
    bottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
    }
});
