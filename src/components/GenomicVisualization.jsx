// src/components/GenomicVisualization.jsx
import React, { useState } from 'react';
import { Html } from '@react-three/drei';

const GenomicVisualization = ({ data }) => {
    const [hoveredTrait, setHoveredTrait] = useState(null);

    // Generate a chromosome as a long grey box
    const createChromosome = (chromosomeIndex) => {
        return (
            <mesh key={chromosomeIndex} position={[0, chromosomeIndex * -6, 0]}>
                <boxGeometry args={[100, 1, 1]} />
                <meshBasicMaterial color="grey" />
            </mesh>
        );
    };

    // Map trait positions to their respective chromosomes
    const createTraitMarkers = () => {
        return data.map((trait, index) => {
            const { Chromosome, Position, Color, TraitAssociation, ReferenceAllele, AlternateAllele } = trait;

            // Calculate relative position on the chromosome (normalize Position for simplicity)
            const normalizedPosition = (Position % 2000000) / 2000000 * 100 - 50; // Adjusted scaling

            return (
                <mesh
                    key={index}
                    position={[normalizedPosition, -Chromosome * 6, 0]}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        setHoveredTrait(trait);
                    }}
                    onPointerOut={() => setHoveredTrait(null)}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color={Color} />

                    {/* Tooltip for hovered trait */}
                    {hoveredTrait === trait && (
                        <Html position={[0, 1.5, 0]}>
                            <div className="gene-tooltip">
                                <strong>Trait:</strong> {TraitAssociation}
                                <br />
                                <strong>Ref Allele:</strong> {ReferenceAllele}
                                <br />
                                <strong>Alt Allele:</strong> {AlternateAllele}
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
