// src/components/VariantInfoSidebar.jsx
import React from 'react';
import './VariantInfoSidebar.css';

const VariantInfoSidebar = ({ variant, onClose }) => {
    const {
        Chromosome,
        Position,
        DiseaseOrTrait,
        MappedGene,
        RiskAllele,
        PValue,
        OddsRatio,
        Color, // Optional: Use for styling or debugging
    } = variant;

    return (
        <div className="sidebar">
            <h2>Variant Information</h2>
            <p><strong>Chromosome:</strong> {Chromosome}</p>
            <p><strong>Position:</strong> {Position}</p>
            <p><strong>Disease/Trait:</strong> {DiseaseOrTrait}</p>
            {MappedGene && <p><strong>Mapped Gene:</strong> {MappedGene}</p>}
            <p><strong>Risk Allele:</strong> {RiskAllele}</p>
            <p><strong>P-Value:</strong> {PValue.toExponential(2)}</p>
            <p><strong>Odds Ratio:</strong> {OddsRatio}</p>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default VariantInfoSidebar;
