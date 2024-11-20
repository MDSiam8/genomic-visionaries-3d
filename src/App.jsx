// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import GenomicVisualization from './components/GenomicVisualization';
import VariantInfoSidebar from './components/VariantInfoSidebar';
import CameraControls from './components/CameraControls';
import ModelViewer from './components/ModelViewer'; // Import ModelViewer
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [filteredVariants, setFilteredVariants] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [filters, setFilters] = useState({
    minPosition: '',
    maxPosition: '',
    traitKeyword: '',
  });
  const [selectedChromosome, setSelectedChromosome] = useState(null);

  useEffect(() => {
    fetch('/assets/o1-gwas_strict_filtered.json')
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        setFilteredVariants(jsonData);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handle chromosome selection change
  const handleChromosomeSelect = (e) => {
    setSelectedChromosome(e.target.value);
  };

  // Function to handle hair click
  const handleHairClick = () => {
    if (data) {
      // Filter variants related to hair traits
      const hairVariants = data.filter((variant) =>
        variant.DiseaseOrTrait.toLowerCase().includes('hair')
      );
      setFilteredVariants(hairVariants);
    }
  };

  // Function to reset filters
  const resetFilters = () => {
    setFilteredVariants(data);
    setFilters({
      minPosition: '',
      maxPosition: '',
      traitKeyword: '',
    });
    setSelectedChromosome(null);
  };

  return (
    <div className="app-container">
      <h1>ClinVar Genome Viewer</h1>

      {/* Filter Controls */}
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
        {/* Chromosome Selection Dropdown */}
        <label>
          Select Chromosome:
          <select value={selectedChromosome || ''} onChange={handleChromosomeSelect}>
            <option value="">All Chromosomes</option>
            {[...Array(22)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Chromosome {i + 1}
              </option>
            ))}
            <option value="X">Chromosome X</option>
            <option value="Y">Chromosome Y</option>
          </select>
        </label>
        {/* Reset Filters Button */}
        <button onClick={resetFilters}>Reset Filters</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Model Viewer */}
        <ModelViewer onHairClick={handleHairClick} />

        {/* 3D Canvas */}
        <div className="canvas-container">
          <Canvas camera={{ position: [0, 10, 100], fov: 75 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <CameraControls />
            {filteredVariants && (
              <GenomicVisualization
                data={filteredVariants}
                onSelectVariant={(variant) => setSelectedVariant(variant)}
                filters={filters}
                selectedChromosome={selectedChromosome}
              />
            )}
          </Canvas>
        </div>
      </div>

      {/* Sidebar with variant details */}
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
