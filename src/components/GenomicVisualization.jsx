// src/components/GenomicVisualization.jsx
import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

const GenomicVisualization = ({ data, onSelectVariant, filters, selectedChromosome }) => {
    const [hoveredTrait, setHoveredTrait] = useState(null);
    const [filteredData, setFilteredData] = useState(data);
    const { camera } = useThree();

    // Apply filters whenever they change
    useEffect(() => {
        let filtered = data;

        if (filters.minPosition || filters.maxPosition) {
            const min = parseInt(filters.minPosition, 10) || 0;
            const max = parseInt(filters.maxPosition, 10) || Infinity;
            filtered = filtered.filter(
                (variant) => variant.Position >= min && variant.Position <= max
            );
        }

        if (filters.traitKeyword) {
            const keyword = filters.traitKeyword.toLowerCase();
            filtered = filtered.filter((variant) =>
                variant.TraitAssociation.toLowerCase().includes(keyword)
            );
        }

        setFilteredData(filtered); // Ensure all variants matching the filters are shown
    }, [filters, data]);

    // Adjust camera to dynamically follow the selected chromosome level
    useEffect(() => {
        if (selectedChromosome) {
            const yPosition = -selectedChromosome * 6; // Calculate y-position for chromosome
            camera.position.set(0, yPosition, 50); // Set the camera closer to chromosome level
            camera.lookAt(0, yPosition, 0);        // Make the camera look directly at the chromosome level
        } else {
            // Reset camera to a more general view when no chromosome is selected
            camera.position.set(0, 10, 150);
            camera.lookAt(0, 0, 0);
        }
    }, [selectedChromosome, camera]);

    const createChromosome = (chromosomeIndex) => {
        return (
            <mesh
                key={chromosomeIndex}
                position={[0, chromosomeIndex * -6, 0]}
            >
                <boxGeometry args={[100, 1, 1]} />
                <meshBasicMaterial color="grey" />
            </mesh>
        );
    };

    const createTraitMarkers = () => {
        return filteredData.map((variant, index) => {
            const {
                Chromosome,
                NormalizedPosition,
                Color,
                TraitAssociation,
                ReferenceAllele,
                AlternateAllele,
                Position
            } = variant;

            return (
                <mesh
                    key={index}
                    position={[NormalizedPosition, -Chromosome * 6, 0]}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        setHoveredTrait(variant);
                    }}
                    onPointerOut={() => setHoveredTrait(null)}
                    onClick={() => onSelectVariant(variant)}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color={Color} />

                    {hoveredTrait === variant && (
                        <Html position={[0, 1.5, 0]} center>
                            <div className="gene-tooltip">
                                <strong>Chromosome:</strong> {Chromosome}
                                <br />
                                <strong>Position:</strong> {Position}
                                <br />
                                <strong>Trait:</strong> {TraitAssociation}
                                <br />
                                <strong>Reference Allele:</strong> {ReferenceAllele}
                                <br />
                                <strong>Alternate Allele:</strong> {AlternateAllele}
                            </div>
                        </Html>
                    )}
                </mesh>
            );
        });
    };

    return (
        <group>
            {/* Render chromosomes */}
            {Array.from({ length: 23 }).map((_, index) => createChromosome(index + 1))}

            {/* Render trait markers */}
            {createTraitMarkers()}
        </group>
    );
};

export default GenomicVisualization;
