// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GenomicVisualization from './components/GenomicVisualization';
import './App.css';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/assets/genomic-data.json')
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="app-container">
      <h1>Genome Viewer</h1>
      <button>Switch to AR Experience</button>
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <OrbitControls />
          {data ? (
            <GenomicVisualization data={data} />
          ) : (
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="gray" />
            </mesh>
          )}
        </Canvas>
      </div>
    </div>
  );
}

export default App;
