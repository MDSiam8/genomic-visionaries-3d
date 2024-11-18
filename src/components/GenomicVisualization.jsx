import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';

const GenomicVisualization = ({ data, onSelectVariant, filters, selectedChromosome }) => {
    const [hoveredTrait, setHoveredTrait] = useState(null);
    const [filteredData, setFilteredData] = useState(data);

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

        // Apply chromosome filter
        if (selectedChromosome) {
            const chromosomeString = selectedChromosome.toString();
            filtered = filtered.filter((variant) => variant.Chromosome === chromosomeString);
        }

        // Scale traits to fit the new larger chromosome while keeping relative positions
        if (selectedChromosome) {
            const newChromosomeLength = 200; // Length of the larger chromosome
            const originalChromosomeLength = 100; // Original length for scaling
            filtered = filtered.map((variant) => ({
                ...variant,
                NormalizedPosition: (variant.NormalizedPosition / originalChromosomeLength) * newChromosomeLength, // Adjusted scaling
            }));
        }

        setFilteredData(filtered);
    }, [filters, data, selectedChromosome]);

    const createChromosome = () => {
        const chromosomeLength = selectedChromosome ? 200 : 100; // Larger chromosome for specific selection
        if (!selectedChromosome) {
            // Render all chromosomes if no specific chromosome is selected
            return Array.from({ length: 23 }, (_, index) => (
                <mesh key={index + 1} position={[0, (index + 1) * -10, 0]}>
                    <boxGeometry args={[chromosomeLength, 3, 1]} />
                    <meshBasicMaterial color="grey" />
                </mesh>
            ));
        }

        // Render only the selected chromosome
        const chromosomeIndex = isNaN(selectedChromosome)
            ? selectedChromosome === "X"
                ? 23
                : 24 // Assume Y is the 24th chromosome
            : parseInt(selectedChromosome);

        return (
            <mesh key={chromosomeIndex} position={[0, chromosomeIndex * -10, 0]}>
                <boxGeometry args={[200, 3, 1]} /> {/* Larger chromosome size */}
                <meshBasicMaterial color="grey" />
            </mesh>
        );
    };

    const createTraitMarkers = () => {
        const zOffsetBase = 0.1; // Slight offset for overlapping traits along Z-axis

        return filteredData.map((variant, index) => {
            const {
                Chromosome,
                NormalizedPosition,
                Color,
                DiseaseOrTrait,
                RiskAllele,
                PValue,
                OddsRatio,
                Position,
                MappedGene,
            } = variant;

            const zOffset = index * zOffsetBase % 3; // Adjust Z position for overlap
            const yPosition = -Chromosome * 10; // Adjust for larger chromosome spacing

            return (
                <mesh
                    key={index}
                    position={[NormalizedPosition, yPosition, zOffset]}
                    onPointerOver={() => setHoveredTrait(variant)}
                    onPointerOut={() => setHoveredTrait(null)}
                    onClick={() => onSelectVariant(variant)}
                >
                    <boxGeometry args={[2, 2, 2]} /> {/* Slightly larger trait markers */}
                    <meshBasicMaterial color={Color} />

                    {hoveredTrait === variant && (
                        <Html position={[0, 3, 0]} center>
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
                            </div>
                        </Html>
                    )}
                </mesh>
            );
        });
    };

    return (
        <group>
            {createChromosome()} {/* Render the chromosome(s) */}
            {createTraitMarkers()} {/* Render the associated traits */}
        </group>
    );
};

export default GenomicVisualization;
