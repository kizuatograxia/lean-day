import React, { Suspense, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Require the GLB asset to be bundled via Metro
const ARARA_GLB = require('../../assets/glb/arara.glb');

function Model() {
    // Drei's useGLTF abstracts the asset loading
    const gltf = useGLTF(ARARA_GLB) as any;
    const scene = gltf.scene;
    const modelRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (modelRef.current) {
            // Apply a smooth continuous rotation around the Y-axis
            modelRef.current.rotation.y += 0.01;
            // Add a levitating floating effect using a sine wave function based on clock time
            modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        }
    });

    return (
        <group ref={modelRef} dispose={null}>
            <primitive object={scene} scale={2} position={[0, -1, 0]} />
        </group>
    );
}

export function Raffle3dModel() {
    return (
        <View style={s.container}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                style={s.canvas}
            >
                {/* Responsive Lighting setup safe for Mobile GPU */}
                <ambientLight intensity={0.6} />
                <hemisphereLight intensity={0.5} color="white" groundColor="#0A0B12" />
                <directionalLight position={[5, 10, 5]} intensity={1.5} />
                <pointLight position={[-10, -10, -10]} intensity={1.5} color="#00FF8C" />

                <Suspense fallback={null}>
                    <Model />
                </Suspense>
            </Canvas>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        width: '100%',
        height: 280,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    canvas: {
        flex: 1,
        width: '100%',
        height: '100%',
    }
});
