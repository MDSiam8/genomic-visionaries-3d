// src/components/UserManual.jsx

import React from 'react';
import './UserManual.css';

const UserManual = ({ onClose }) => {
  return (
    <div className="user-manual-overlay">
      <div className="user-manual-content">
        <button className="close-button" onClick={onClose}>✖</button>
        <h2>User Manual</h2>
        <p>
          Welcome to the GWAS Variant Explorer! This tool allows you to visualize genomic variants associated with various traits and diseases.
        </p>
        
        <h3>How to Use</h3>
        <ul>
          <li>Use the filter controls to narrow down the displayed variants.</li>
          <li>Click on a variant marker in the visualization to view detailed information.</li>
          <li>Interact with the 3D model to explore related traits.</li>
          <li>Click on specific body parts in the model to filter relevant variants (e.g., clicking "Hair" filters hair-related variants).</li>
        </ul>

        <h3>Definitions</h3>
        <ul>
          <li>
            <strong>Odds Ratio (OR):</strong> A measure of association between a genetic variant and a trait. An OR greater than 1 indicates that the variant is associated with a higher odds of the trait occurring, while an OR less than or equal to 1 indicates lower or no increased odds.
          </li>
          <li>
            <strong>P-Value:</strong> The probability that the observed association between a variant and a trait is due to chance. A lower P-value suggests a stronger evidence against the null hypothesis, indicating a significant association.
          </li>
          <li>
            <strong>Chromosome:</strong> A DNA molecule carrying genetic information. Humans have 23 pairs of chromosomes.
          </li>
          <li>
            <strong>Position:</strong> The specific location of a genetic variant on a chromosome.
          </li>
          <li>
            <strong>Disease or Trait:</strong> The phenotype or condition associated with the genetic variant.
          </li>
          <li>
            <strong>Risk Allele:</strong> The variant form of a gene that is associated with an increased risk of developing a trait or disease.
          </li>
          <li>
            <strong>Mapped Gene:</strong> The gene associated with the genetic variant.
          </li>
        </ul>

        <h3>Color Key</h3>
        <p>The colors represent the Odds Ratio (OR) associated with each variant:</p>
        <ul>
          <li>
            <span className="color-box" style={{ backgroundColor: '#FF5733' }}></span>
            OR &gt; 1 (Variant increases the odds of the trait)
          </li>
          <li>
            <span className="color-box" style={{ backgroundColor: '#33FF57' }}></span>
            OR ≤ 1 (Variant decreases or does not affect the odds of the trait)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserManual;
