// src/components/GenomicVisualization.jsx
import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';

const GenomicVisualization = ({ data, onSelectVariant, filters, selectedChromosome }) => {
    const [hoveredTrait, setHoveredTrait] = useState(null);
    const [filteredData, setFilteredData] = useState(data);

    // Define chromosome lengths and scaling constants
    const CHROMOSOME_LENGTHS = {
        '1': 248956422, '2': 242193529, '3': 198295559, '4': 190214555,
        '5': 181538259, '6': 170805979, '7': 159345973, '8': 145138636,
        '9': 138394717, '10': 133797422, '11': 135086622, '12': 133275309,
        '13': 114364328, '14': 107043718, '15': 101991189, '16': 90338345,
        '17': 83257441, '18': 80373285, '19': 58617616, '20': 64444167,
        '21': 46709983, '22': 50818468, 'X': 156040895, 'Y': 57227415,
    };

    const maxChromLength = Math.max(...Object.values(CHROMOSOME_LENGTHS));
    const SCALE_LENGTH = 100.0; // Should match the SCALE_LENGTH in your data processing script

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

        // Apply P-Value filter
        if (filters.maxPValue) {
            const maxP = parseFloat(filters.maxPValue);
            if (!isNaN(maxP)) {
                filtered = filtered.filter((variant) => variant.PValue <= maxP);
            }
        }

        // Apply Odds Ratio filter
        const { minOddsRatio, maxOddsRatio } = filters;
        if (minOddsRatio) {
            const minOR = parseFloat(minOddsRatio);
            if (!isNaN(minOR)) {
                filtered = filtered.filter((variant) => variant.OddsRatio >= minOR);
            }
        }
        if (maxOddsRatio) {
            const maxOR = parseFloat(maxOddsRatio);
            if (!isNaN(maxOR)) {
                filtered = filtered.filter((variant) => variant.OddsRatio <= maxOR);
            }
        }

        // Filter for the selected chromosome
        if (selectedChromosome) {
            filtered = filtered.filter((variant) => variant.Chromosome === selectedChromosome);
        }

        setFilteredData(filtered);
    }, [filters, data, selectedChromosome]);

    const getScaledChromosomeLength = (chromosome) => {
        const chromLength = CHROMOSOME_LENGTHS[chromosome];
        const chromLengthRatio = chromLength / maxChromLength;
        const visualChromLength = chromLengthRatio * SCALE_LENGTH;
        return visualChromLength;
    };

    const createChromosomes = () => {
        // If a chromosome is selected, render only that chromosome
        if (selectedChromosome) {
            const chromosome = selectedChromosome;
            const chromosomeIndex = isNaN(chromosome)
                ? chromosome === "X"
                    ? 23
                    : 24 // Assume Y is the 24th chromosome
                : parseInt(chromosome);

            const chromLength = getScaledChromosomeLength(chromosome);

            return (
                <mesh
                    key={chromosome}
                    position={[0, chromosomeIndex * -6, 0]}
                >
                    <boxGeometry args={[chromLength, 1, 1]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            );
        }

        // Render all chromosomes if no selection is made
        return [...Array(24)].map((_, index) => {
            let chromosome;
            if (index < 22) {
                chromosome = (index + 1).toString();
            } else if (index === 22) {
                chromosome = 'X';
            } else {
                chromosome = 'Y';
            }
            const chromosomeIndex = index + 1;
            const chromLength = getScaledChromosomeLength(chromosome);

            return (
                <mesh
                    key={chromosome}
                    position={[0, chromosomeIndex * -6, 0]}
                >
                    <boxGeometry args={[chromLength, 1, 1]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            );
        });
    };

    const createTraitMarkers = () => {
        // Render markers only for filtered data (which includes selected chromosome filtering)
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

            const chromosomeIndex = isNaN(Chromosome)
                ? Chromosome === "X"
                    ? 23
                    : 24 // Y chromosome
                : parseInt(Chromosome);

            return (
                <mesh
                    key={index}
                    position={[NormalizedPosition, chromosomeIndex * -6, 0]} // Correct vertical position
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
                            </div>
                        </Html>
                    )}
                </mesh>
            );
        });
    };

    return (
        <group>
            {createChromosomes()} {/* Render chromosomes dynamically based on selection */}
            {createTraitMarkers()} {/* Render markers for filtered variants */}
        </group>
    );
};

export default GenomicVisualization;
