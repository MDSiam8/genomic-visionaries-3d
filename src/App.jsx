// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GenomicVisualization from './components/GenomicVisualization';
import './App.css';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/assets/clinvar_data.json')
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="app-container">
      <h1>ClinVar Genome Viewer</h1>
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 10, 150], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
          {data && <GenomicVisualization data={data} />}
        </Canvas>
      </div>
    </div>
  );
}

export default App;
