// src/components/GenomicVisualization.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import PropTypes from 'prop-types';

const GenomicVisualization = ({
    data,
    onSelectVariant,
    filters,
    selectedChromosome,
    isExplodedView, // Receive the prop
}) => {
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
        if (filters.minPValue) { // Changed from maxPValue to minPValue
            const minP = parseFloat(filters.minPValue);
            if (!isNaN(minP)) {
                filtered = filtered.filter((variant) => variant.PValue <= minP);
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

    // Compute scaling factors for P-Value (size), Odds Ratio (opacity), and separation based on OR using useMemo for performance
    const { sizeScale, opacityScale, separationScale } = useMemo(() => {
        if (!filteredData.length) {
            return { sizeScale: () => 1, opacityScale: () => 1, separationScale: () => 0 };
        }

        // Determine min and max P-Values
        const pValues = filteredData.map(v => v.PValue);
        const minP = Math.min(...pValues); // e.g., 1e-41
        const maxP = Math.max(...pValues); // e.g., 1e-25

        // Define size scaling function based on P-Value
        const sizeScaleFn = (p) => {
            // Calculate -log10(pValue)
            const logP = -Math.log10(p);
            // Map logP from [25, 41] to [0.5, 3.0]
            const minSize = 0.5;
            const maxSize = 3.0;
            const scaledSize = THREE.MathUtils.mapLinear(logP, 25, 80, minSize, maxSize);
            return THREE.MathUtils.clamp(scaledSize, minSize, maxSize);
        };

        // Determine Odds Ratio range and handle both OR >=1 and OR <1
        const orValues = filteredData.map(v => v.OddsRatio);
        const minOR = Math.min(...orValues.filter(or => or > 0)); // Exclude OR=0
        const maxOR = Math.max(...orValues.filter(or => or > 0)); // e.g., 14000000

        // Define opacity scaling function based on Odds Ratio
        const opacityScaleFn = (or) => {
            // Handle OR=0 by setting to minimum opacity
            if (or === 0) return 0.1;

            // For OR >=1, use log10(OR)
            // For OR <1, use log10(1/OR) to represent strength
            let logOR;
            if (or >= 1) {
                logOR = Math.log10(or);
            } else {
                logOR = Math.log10(1 / or);
            }

            // Cap logOR at log10(20) ~1.3 to prevent outliers from skewing opacity
            const cappedLogOR = THREE.MathUtils.clamp(logOR, 0, 1.3);

            // Map cappedLogOR from [0,1.3] to [0.1,1]
            const minOpacity = 0.1;
            const maxOpacity = 1.0;
            const scaledOpacity = THREE.MathUtils.mapLinear(cappedLogOR, 0, 1.3, minOpacity, maxOpacity);
            return THREE.MathUtils.clamp(scaledOpacity, minOpacity, maxOpacity);
        };

        // Define separation scaling function based on Odds Ratio
        const separationScaleFn = (or) => {
            if (or === 1) return 0; // No separation

            let logOR;
            if (or > 1) {
                logOR = Math.log10(or);
            } else {
                logOR = Math.log10(1 / or);
            }

            // Cap logOR to prevent extreme separation
            const cappedLogOR = THREE.MathUtils.clamp(logOR, 0, 1.3); // log10(20) ~1.3

            const maxSeparation = 10; // Adjust based on visualization needs
            const scaledSeparation = THREE.MathUtils.mapLinear(cappedLogOR, 0, 1.3, 0, maxSeparation);
            return scaledSeparation;
        };

        return { sizeScale: sizeScaleFn, opacityScale: opacityScaleFn, separationScale: separationScaleFn };
    }, [filteredData]);

    const getChromosomeIndex = (chromosome) => {
        if (isNaN(chromosome)) {
            if (chromosome === "X") return 23;
            if (chromosome === "Y") return 24;
            return 25; // For any unknown chromosome
        }
        return parseInt(chromosome);
    };

    const createChromosomes = () => {
        // If a chromosome is selected, render only that chromosome
        if (selectedChromosome) {
            const chromosome = selectedChromosome;
            const chromosomeIndex = getChromosomeIndex(chromosome);
            const chromLength = getScaledChromosomeLength(chromosome);

            return (
                <mesh
                    key={chromosome}
                    position={[0, chromosomeIndex * -6, 0]}
                >
                    <boxGeometry args={[chromLength, 1, 0.5]} /> {/* Thinner Z-axis */}
                    <meshBasicMaterial color="white" />
                </mesh>
            );
        }

        // Render all chromosomes if no selection is made
        return Object.keys(CHROMOSOME_LENGTHS).map((chromosome, index) => {
            const chromosomeIndex = getChromosomeIndex(chromosome);
            const chromLength = getScaledChromosomeLength(chromosome);

            return (
                <mesh
                    key={chromosome}
                    position={[0, chromosomeIndex * -6, 0]}
                >
                    <boxGeometry args={[chromLength, 1, 0.5]} /> {/* Thinner Z-axis */}
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

            const chromosomeIndex = getChromosomeIndex(Chromosome);

            // Calculate size and opacity based on P-Value and Odds Ratio
            const size = sizeScale(PValue);
            const opacity = opacityScale(OddsRatio);

            // Calculate separation based on Odds Ratio
            const separation = separationScale(OddsRatio);

            // Determine Z position based on OR and the isExplodedView state
            let zPosition = 0;
            if (OddsRatio > 1) {
                zPosition = isExplodedView ? separation : 0.5; // Positive side
            } else if (OddsRatio < 1) {
                zPosition = isExplodedView ? -separation : -0.5; // Negative side
            }
            // OR = 1 remains at z = 0

            return (
                <mesh
                    key={index}
                    position={[NormalizedPosition, chromosomeIndex * -6, zPosition]} // Adjusted Z position
                    onPointerOver={() => setHoveredTrait(variant)}
                    onPointerOut={() => setHoveredTrait(null)}
                    onClick={() => onSelectVariant(variant)}
                >
                    <boxGeometry args={[0.1, size + 0.5, 0.5]} /> {/* Width, Height (size + buffer), Depth (thinner) */}
                    <meshBasicMaterial
                        color={Color}
                        transparent={true}
                        opacity={opacity}
                    />

                    {hoveredTrait === variant && (
                        <Html position={[0, 0, 0]} center>
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

// Define PropTypes for better type checking
GenomicVisualization.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            Chromosome: PropTypes.string.isRequired,
            Position: PropTypes.number.isRequired,
            NormalizedPosition: PropTypes.number.isRequired,
            DiseaseOrTrait: PropTypes.string.isRequired,
            MappedGene: PropTypes.string.isRequired,
            RiskAllele: PropTypes.string.isRequired,
            PValue: PropTypes.number.isRequired,
            OddsRatio: PropTypes.number.isRequired,
            Color: PropTypes.string.isRequired,
        })
    ).isRequired,
    onSelectVariant: PropTypes.func.isRequired,
    filters: PropTypes.object.isRequired,
    selectedChromosome: PropTypes.string,
    isExplodedView: PropTypes.bool.isRequired, // Ensure this prop is passed
};

export default GenomicVisualization;
