import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Box from './components/Box';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <h1>Genome Viewer</h1>
      <button>Switch to AR Experience</button>
      <div className="canvas-container">
        <Canvas>
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Box position={[0, 0, 0]} />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
