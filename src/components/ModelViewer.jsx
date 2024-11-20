// src/components/ModelViewer.jsx
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Model({ onHairClick }) {
  const group = useRef();
  const { nodes, materials } = useGLTF('/schatz.glb');

  // Rotate the model slowly
  useFrame(() => {
    group.current.rotation.y += 0.005;
  });

  // Function to handle clicks on the model
  const handlePointerDown = (event) => {
    event.stopPropagation();
    const clickedMeshName = event.object.name;

    if (clickedMeshName.toLowerCase().includes('hair')) {
      onHairClick();
    }
  };

  return (
    <group ref={group} dispose={null} onPointerDown={handlePointerDown}>
      {/* Adjust the scale and position as needed */}
      <primitive object={nodes.Scene} />
    </group>
  );
}

function ModelViewer({ onHairClick }) {
  return (
    <div className="model-viewer-container">
      <Canvas
        camera={{ position: [0, 1.6, 3], fov: 50 }}
        style={{ background: 'radial-gradient(circle, #1a2a6c, #b21f1f, #fdbb2d)' }}
      >
        {/* Add futuristic lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ffff" />
        <spotLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
        {/* Add stars or particle effects */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Model onHairClick={onHairClick} />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}

export default ModelViewer;
