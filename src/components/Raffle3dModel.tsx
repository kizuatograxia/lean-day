import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
    url: string;
}

function Model({ url }: ModelProps) {
    // Drei's useGLTF abstracts the asset loading
    const gltf = useGLTF(url) as any;
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

// Preload the specific model we know we have to avoid jarring pops
useGLTF.preload('/glb/arara.glb');

export function Raffle3dModel({ url = '/glb/arara.glb' }: { url?: string }) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                className="w-full h-full"
            >
                {/* Responsive Lighting setup */}
                <ambientLight intensity={0.6} />
                <hemisphereLight intensity={0.5} position={[0, 50, 0]} groundColor="#0A0B12" />
                <directionalLight position={[5, 10, 5]} intensity={1.5} />
                <pointLight position={[-10, -10, -10]} intensity={1.5} color="#00FF8C" />

                <Suspense fallback={null}>
                    <Model url={url} />
                </Suspense>
            </Canvas>
        </div>
    );
}
