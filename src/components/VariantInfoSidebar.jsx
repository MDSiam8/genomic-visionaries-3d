// src/components/VariantInfoSidebar.jsx
import React from 'react';
import './VariantInfoSidebar.css';

const VariantInfoSidebar = ({ variant, onClose }) => {
    const { Chromosome, Position, TraitAssociation, ReferenceAllele, AlternateAllele, ClinicalSignificance, GeneName, PopulationFrequency } = variant;

    return (
        <div className="sidebar">
            <h2>Variant Information</h2>
            <p><strong>Chromosome:</strong> {Chromosome}</p>
            <p><strong>Position:</strong> {Position}</p>
            <p><strong>Trait Association:</strong> {TraitAssociation}</p>
            <p><strong>Reference Allele:</strong> {ReferenceAllele}</p>
            <p><strong>Alternate Allele:</strong> {AlternateAllele}</p>
            {ClinicalSignificance && <p><strong>Clinical Significance:</strong> {ClinicalSignificance}</p>}
            {GeneName && <p><strong>Gene Name:</strong> {GeneName}</p>}
            {PopulationFrequency && <p><strong>Population Frequency:</strong> {PopulationFrequency}</p>}
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default VariantInfoSidebar;
