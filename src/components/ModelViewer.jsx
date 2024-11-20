// src/components/ModelViewer.jsx
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Grid, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';
import Loader from './Loader'; // Ensure Loader component is created as per previous instructions
import { FaChevronUp, FaChevronDown } from 'react-icons/fa'; // Import React Icons

function Model({ onHairClick }) {
    const group = useRef();
    const { scene, materials } = useGLTF('/schatz.glb'); // Corrected model path
    const [hovered, setHovered] = useState(false);

    // Function to handle clicks on the model
    const handlePointerDown = (event) => {
        event.stopPropagation();
        const clickedMeshName = event.object.name.toLowerCase();

        if (clickedMeshName.includes('hair')) {
            onHairClick();
        }
    };

    // Function to handle hover
    const handlePointerOver = (event) => {
        const clickedMeshName = event.object.name.toLowerCase();
        if (clickedMeshName.includes('hair')) {
            setHovered(true);
        }
    };

    const handlePointerOut = () => {
        setHovered(false);
    };

    // Enhance hair material to have emissive glow when hovered
    useEffect(() => {
        // Replace 'HairMaterial' with the actual material name from your GLB model
        if (materials.HairMaterial) {
            materials.HairMaterial.emissive = hovered ? new THREE.Color('#00ffff') : new THREE.Color('#000000');
            materials.HairMaterial.emissiveIntensity = hovered ? 1 : 0;
        }
    }, [hovered, materials]);

    return (
        <group
            ref={group}
            dispose={null}
            onPointerDown={handlePointerDown}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            {/* Centering adjustment: Position the model so that the feet are on the grid */}
            <primitive object={scene} position={[0, 0, 0]} /> {/* Adjust Y position if needed */}
            {hovered && (
                <Html position={[0, 1.8, 0]} center>
                    <div className="tooltip">Click to filter hair traits</div>
                </Html>
            )}
        </group>
    );
}

function ModelViewer({ onHairClick }) {
    const controlsRef = useRef();
    const [isInfoOpen, setIsInfoOpen] = useState(false); // State to manage Info Panel visibility

    // Function to toggle the Information Panel
  
    // useEffect(() => {
    //     if (controlsRef.current) {
    //         // Set the target to the model's torso/head position
    //         controlsRef.current.target.set(0, 1.5, 0); // Adjust Y value as needed
    //         controlsRef.current.update();
    //     }
    // }, []);

    return (
        <div className="model-viewer-container">
            <Canvas
                camera={{ position: [0, 2, 5], fov: 50 }}
                style={{ width: '100%', height: '100%' }}
            >
                {/* Cyan Blue Gradient Background */}
                <color attach="background" args={['#0e0f29']} /> {/* Deep cyan-blue base color */}

                {/* Grid Lines */}
                <Grid
                    args={[100, 100]} // Size and divisions
                    position={[0, 0, 0]}
                    rotation={[Math.PI / 2, 0, 0]} // Align grid horizontally on X-Z plane
                    cellColor="#00ffff" // Cyan color
                    sectionColor="#0083b0" // Slightly darker cyan for sections
                    fadeDistance={50}
                    fadeStrength={1}
                    infiniteGrid={true}
                />
                <Grid
                    args={[100, 100]} // Size and divisions
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]} // Align grid horizontally on X-Z plane
                    cellColor="#00ffff" // Cyan color
                    sectionColor="#0083b0" // Slightly darker cyan for sections
                    fadeDistance={50}
                    fadeStrength={1}
                    infiniteGrid={true}
                />

                {/* Ambient Light for base illumination */}
                <ambientLight intensity={0.8} />

                {/* Directional Lights to highlight the model */}
                <directionalLight position={[5, 10, 7.5]} intensity={1} color="#ffffff" />
                <directionalLight position={[-5, 10, -7.5]} intensity={0.8} color="#ffffff" />

                {/* Optional: Remove or adjust Stars and Sparkles */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                {/* <Sparkles count={100} size={1} speed={0.5} opacity={0.5} /> */}

                {/* Suspense for lazy loading the model */}
                <Suspense fallback={<Loader />}>
                    <Model onHairClick={onHairClick} />
                </Suspense>

                {/* OrbitControls for user interaction */}
                <OrbitControls target={[0, 1.5, 0]} ref={controlsRef} enablePan={false} enableRotate={true} enableZoom={true} />

                {/* Post-processing effects */}
                {/* <EffectComposer>
                    <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} />
                </EffectComposer> */}
            </Canvas>

            {/* Toggleable Information Panel */}
            <div className="info-panel-toggle-container">

                {/* Information Panel */}
                <div className={`info-panel-wrapper ${isInfoOpen ? 'open' : 'closed'}`}>
                    <div className="info-panel">
                        <h2>Dr. Mike Catz</h2>
                        <p>
                            Dr. Mike Catz is a renowned Computational Genomicist specializing in the study of genetic variants
                            and their associations with various phenotypes. In this genome visualizer, Dr. Catz serves as
                            the model organism for exploring and filtering genomic data based on specific traits.
                        </p>
                        <div>
                            <strong>Interactive Features:</strong>
                            <ul>
                                <li>Click on different features of Dr. Catz to filter and explore genetic variants related to that trait.</li>
                                <li>Analyze the impact of specific genetic variants on various phenotypes.</li>
                            </ul>
                        </div>
                        {/* Additional Traits Selection */}
                        <div className="additional-traits">
                            <h3>Other traits of Mike Catz that you may be interested in:</h3>
                            <label>
                                <input type="checkbox" value="Height" />
                                Height
                            </label>
                            <label>
                                <input type="checkbox" value="BMI" />
                                BMI
                            </label>
                            <label>
                                <input type="checkbox" value="Skin Color" />
                                Skin Color
                            </label>
                            {/* Add more traits as needed */}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default ModelViewer;
