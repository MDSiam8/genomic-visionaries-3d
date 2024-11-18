// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GenomicVisualization from './components/GenomicVisualization';
import VariantInfoSidebar from './components/VariantInfoSidebar';
import './App.css';

function App() {
    const [data, setData] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [filters, setFilters] = useState({ minPosition: '', maxPosition: '', traitKeyword: '' });
    const [selectedChromosome, setSelectedChromosome] = useState(null);

    useEffect(() => {
        fetch('/assets/o1-gwas_strict_filtered.json')
            .then((response) => response.json())
            .then((jsonData) => setData(jsonData))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleChromosomeSelect = (e) => {
        const value = e.target.value;
        setSelectedChromosome(value ? (isNaN(value) ? value : Number(value)) : null);
    };

    return (
        <div className="app-container">
            {/* 3D Canvas */}
            <div className="canvas-container">
                <h1>ClinVar Genome Viewer</h1>

                <div className="filter-controls">
                    <label>
                        Min Position:
                        <input
                            type="number"
                            name="minPosition"
                            value={filters.minPosition}
                            onChange={handleFilterChange}
                            placeholder="Min Position"
                        />
                    </label>
                    <label>
                        Max Position:
                        <input
                            type="number"
                            name="maxPosition"
                            value={filters.maxPosition}
                            onChange={handleFilterChange}
                            placeholder="Max Position"
                        />
                    </label>
                    <label>
                        Trait Keyword:
                        <input
                            type="text"
                            name="traitKeyword"
                            value={filters.traitKeyword}
                            onChange={handleFilterChange}
                            placeholder="Enter keyword"
                        />
                    </label>
                    <label>
                        Select Chromosome:
                        <select value={selectedChromosome || ''} onChange={handleChromosomeSelect}>
                            <option value="">All Chromosomes</option>
                            {[...Array(23)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    Chromosome {i + 1}
                                </option>
                            ))}
                            <option value="X">Chromosome X</option>
                            <option value="Y">Chromosome Y</option>
                        </select>
                    </label>
                </div>

                <Canvas camera={{ position: [0, 10, 150], fov: 75 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
                    {data && (
                        <GenomicVisualization
                            data={data}
                            onSelectVariant={(variant) => setSelectedVariant(variant)}
                            filters={filters}
                            selectedChromosome={selectedChromosome}
                        />
                    )}
                </Canvas>
            </div>

            {/* Sidebar */}
            {selectedVariant && (
                <VariantInfoSidebar
                    variant={selectedVariant}
                    onClose={() => setSelectedVariant(null)}
                />
            )}
        </div>
    );
}

export default App;
