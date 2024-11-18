// src/components/GenomicVisualization.jsx
import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';

const GenomicVisualization = ({ data, onSelectVariant, filters, selectedChromosome }) => {
    const [hoveredTrait, setHoveredTrait] = useState(null);
    const [filteredData, setFilteredData] = useState(data);

    // Filter data based on filters and selected chromosome
    useEffect(() => {
        let filtered = data;

        // Apply positional filters
        if (filters.minPosition || filters.maxPosition) {
            const min = parseInt(filters.minPosition, 10) || 0;
            const max = parseInt(filters.maxPosition, 10) || Infinity;
            filtered = filtered.filter(
                (variant) => variant.Position >= min && variant.Position <= max
            );
        }

        // Apply keyword filter
        if (filters.traitKeyword) {
            const keyword = filters.traitKeyword.toLowerCase();
            filtered = filtered.filter((variant) =>
                variant.DiseaseOrTrait.toLowerCase().includes(keyword)
            );
        }

        // Filter for the selected chromosome
        if (selectedChromosome) {
            filtered = filtered.filter((variant) => variant.Chromosome === selectedChromosome);
        }

        setFilteredData(filtered);
    }, [filters, data, selectedChromosome]);

    // Render chromosomes
    const createChromosomes = () => {
        return Array.from({ length: 23 })
            .map((_, index) => {
                const chromosomeIndex = index + 1;
                const isSelected = selectedChromosome
                    ? chromosomeIndex.toString() === selectedChromosome
                    : true;

                return (
                    <mesh
                        key={chromosomeIndex}
                        position={[0, chromosomeIndex * -6, 0]}
                    >
                        <boxGeometry args={[100, 1, 1]} />
                        <meshBasicMaterial color={isSelected ? 'blue' : 'grey'} />
                    </mesh>
                );
            })
            .concat(
                // Add X and Y chromosomes
                ['X', 'Y'].map((chromosome, index) => {
                    const isSelected = selectedChromosome
                        ? chromosome === selectedChromosome
                        : true;

                    return (
                        <mesh
                            key={chromosome}
                            position={[0, (23 + index) * -6, 0]}
                        >
                            <boxGeometry args={[100, 1, 1]} />
                            <meshBasicMaterial color={isSelected ? 'blue' : 'grey'} />
                        </mesh>
                    );
                })
            );
    };

    // Render trait markers
    const createTraitMarkers = () => {
        return filteredData.map((variant, index) => {
            const {
                Chromosome,
                NormalizedPosition,
                Color,
                DiseaseOrTrait,
                RiskAllele,
                PValue,
                OddsRatio,
                ConfidenceInterval,
                Position,
                MappedGene,
            } = variant;

            return (
                <mesh
                    key={index}
                    position={[NormalizedPosition, -Chromosome * 6, 0]}
                    onPointerOver={() => setHoveredTrait(variant)}
                    onPointerOut={() => setHoveredTrait(null)}
                    onClick={() => onSelectVariant(variant)}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color={Color} />

                    {hoveredTrait === variant && (
                        <Html position={[0, 1.5, 0]} center>
                            <div className="gene-tooltip">
                                <strong>Disease/Trait:</strong> {DiseaseOrTrait}
                                <br />
                                <strong>Gene:</strong> {MappedGene}
                                <br />
                                <strong>Chromosome:</strong> {Chromosome}
                                <br />
                                <strong>Position:</strong> {Position}
                                <br />
                                <strong>Risk Allele:</strong> {RiskAllele}
                                <br />
                                <strong>P-Value:</strong> {PValue.toExponential(2)}
                                <br />
                                <strong>Odds Ratio:</strong> {OddsRatio}
                                <br />
                                <strong>CI:</strong> {ConfidenceInterval}
                            </div>
                        </Html>
                    )}
                </mesh>
            );
        });
    };

    return (
        <group>
            {createChromosomes()} {/* Render all chromosomes */}
            {createTraitMarkers()} {/* Render markers for filtered variants */}
        </group>
    );
};

export default GenomicVisualization;
